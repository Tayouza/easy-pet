"use client";

import { ChevronLeft, ChevronRight, ExternalLink, MessageSquareQuote, Pause, Play, Printer, RotateCcw, Users, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";
import { memberById, PITCH_SCRIPT, QA, TOTAL_SECONDS, type ScriptEntry } from "./script";
import { SLIDE_VIEWS } from "./slides";
import { openPitchChannel } from "./sync";
import { Fit } from "./ui";

type Mode = "5" | "1";
const LAST = PITCH_SCRIPT.length - 1;
const MODE_KEY = "easypet-pitch-mode";

/** Segundo em que cada slide deveria começar, pelo roteiro. */
const PLAN_START = PITCH_SCRIPT.map((_, i) => PITCH_SCRIPT.slice(0, i).reduce((sum, s) => sum + s.segundos, 0));

function readMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === "1" ? "1" : "5";
  } catch {
    return "5";
  }
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function speakerOf(entry: ScriptEntry, mode: Mode) {
  if (mode === "1") return { nome: "Você", detalhe: "Apresentação solo", cor: "#FF6B35", inicial: "V" };
  const m = memberById(entry.quem);
  return { nome: m.nome, detalhe: `${m.papel} · ${m.area}`, cor: m.cor, inicial: m.nome[0] };
}

const speechOf = (entry: ScriptEntry, mode: Mode) => (mode === "1" ? (entry.falaSolo ?? entry.fala) : entry.fala);

export default function PresenterView() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>(readMode);
  const [tab, setTab] = useState<"live" | "full">("live");
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(0);
  const [slideAt, setSlideAt] = useState(0);
  const [timer, setTimer] = useState({ running: false, startedAt: 0, acc: 0 });
  const indexRef = useRef(0);
  const channel = useRef<ReturnType<typeof openPitchChannel>>(null);

  const startTimer = useCallback(() => {
    const t = Date.now();
    setNow(t);
    setTimer((cur) => (cur.running ? cur : { running: true, startedAt: t, acc: cur.acc }));
  }, []);

  const enter = useCallback(
    (i: number) => {
      if (i === indexRef.current) return;
      // Avançar a partir da capa dispara o cronômetro, se ainda não foi iniciado.
      if (indexRef.current === 0 && i > 0) startTimer();
      indexRef.current = i;
      setIndex(i);
      setSlideAt(Date.now());
    },
    [startTimer],
  );

  const goto = useCallback(
    (target: number) => {
      const i = Math.min(Math.max(target, 0), LAST);
      enter(i);
      channel.current?.post({ type: "goto", index: i });
    },
    [enter],
  );

  useEffect(() => {
    const ch = openPitchChannel((message) => {
      if (message.type !== "state") return;
      setConnected(true);
      enter(message.index);
    });
    channel.current = ch;
    ch.post({ type: "hello" });
    return () => {
      ch.close();
      channel.current = null;
    };
  }, [enter]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.target as HTMLElement).closest("input, textarea, summary")) return;
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) goto(indexRef.current + 1);
      else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) goto(indexRef.current - 1);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goto]);

  const changeMode = (next: Mode) => {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      /* Preferência só desta máquina; sem storage, vale até fechar a janela. */
    }
  };

  const pause = () => setTimer((cur) => (cur.running ? { running: false, startedAt: 0, acc: cur.acc + (Date.now() - cur.startedAt) } : cur));
  const reset = () => {
    setTimer({ running: false, startedAt: 0, acc: 0 });
    setSlideAt(Date.now());
  };

  const elapsed = timer.acc + (timer.running ? Math.max(0, now - timer.startedAt) : 0);
  const slideElapsed = slideAt ? Math.max(0, now - slideAt) : 0;
  const entry = PITCH_SCRIPT[index];
  const next = PITCH_SCRIPT[index + 1];
  const speaker = speakerOf(entry, mode);
  const slideRatio = slideElapsed / (entry.segundos * 1000);
  const drift = elapsed / 1000 - PLAN_START[index];
  const started = elapsed > 0;

  return (
    <div className="min-h-screen bg-[#141210] text-white print:bg-white print:text-ink">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-white/10 bg-[#141210]/95 px-6 py-3 backdrop-blur print:hidden">
        <Logo light size="sm" />
        <span className="hidden text-sm font-bold tracking-widest text-white/50 uppercase 2xl:inline">Modo apresentador</span>

        <div className="flex rounded-full bg-white/10 p-1 text-sm font-bold">
          {(["5", "1"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => changeMode(m)}
              className={cn("flex items-center gap-2 rounded-full px-4 py-1.5 transition", mode === m ? "bg-white text-ink" : "text-white/70 hover:text-white")}
            >
              {m === "5" ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
              {m === "5" ? "5 apresentadores" : "1 apresentador"}
            </button>
          ))}
        </div>

        <div className="flex rounded-full bg-white/10 p-1 text-sm font-bold">
          {(["live", "full"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("rounded-full px-4 py-1.5 transition", tab === t ? "bg-white text-ink" : "text-white/70 hover:text-white")}
            >
              {t === "live" ? "Ao vivo" : "Roteiro completo"}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          {connected ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-white/70">
              <span className="h-2.5 w-2.5 rounded-full bg-success" /> Apresentação conectada
            </span>
          ) : (
            <a
              href="/pitch"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
            >
              Abrir apresentação <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 py-1.5 pr-1.5 pl-4">
            <span
              className={cn(
                "text-2xl font-black tabular-nums",
                elapsed > TOTAL_SECONDS * 1000 ? "text-danger" : elapsed > TOTAL_SECONDS * 800 ? "text-accent" : "text-white",
              )}
            >
              {clock(elapsed)}
            </span>
            <span className="text-sm text-white/40 tabular-nums">/ {clock(TOTAL_SECONDS * 1000)}</span>
            <IconButton label={timer.running ? "Pausar" : "Iniciar"} onClick={timer.running ? pause : startTimer}>
              {timer.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </IconButton>
            <IconButton label="Zerar" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </header>

      {tab === "live" ? (
        <main className="grid gap-6 p-6 lg:grid-cols-[1fr_440px]">
          <section className="min-w-0">
            <div className="flex items-center gap-5">
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-full text-4xl font-black text-white"
                style={{ background: speaker.cor }}
              >
                {speaker.inicial}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-widest text-white/50 uppercase">Agora fala</div>
                <div className="text-4xl font-black">{speaker.nome}</div>
                <div className="text-white/60">{speaker.detalhe}</div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold tabular-nums">
                {index + 1} / {PITCH_SCRIPT.length}
              </span>
              <span className="text-xl font-extrabold">{entry.titulo}</span>
              <span
                className={cn(
                  "ml-auto font-bold tabular-nums",
                  slideRatio > 1 ? "text-danger" : slideRatio > 0.8 ? "text-accent" : "text-white/70",
                )}
              >
                {clock(slideElapsed)} / {clock(entry.segundos * 1000)}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn("h-full rounded-full transition-[width] duration-500", slideRatio > 1 ? "bg-danger" : slideRatio > 0.8 ? "bg-accent" : "bg-success")}
                style={{ width: `${Math.min(slideRatio, 1) * 100}%` }}
              />
            </div>
            {started && (
              <div className="mt-2 text-sm text-white/50">
                {Math.abs(drift) < 5
                  ? "No ritmo do roteiro."
                  : drift > 0
                    ? `${Math.round(drift)}s atrasado em relação ao roteiro.`
                    : `${Math.round(-drift)}s adiantado em relação ao roteiro.`}
              </div>
            )}

            <p className="mt-8 text-[28px] leading-[1.55] font-semibold text-white/95">{speechOf(entry, mode)}</p>

            {entry.palco && (
              <div className="mt-8 rounded-2xl border border-accent/40 bg-accent/10 p-5">
                <div className="text-xs font-extrabold tracking-widest text-accent uppercase">Palco</div>
                <p className="mt-1 text-lg text-white/85">{entry.palco}</p>
              </div>
            )}

            {mode === "5" && entry.passagem && next && (
              <div className="mt-4 rounded-2xl border p-5" style={{ borderColor: `${memberById(next.quem).cor}80`, background: `${memberById(next.quem).cor}1A` }}>
                <div className="text-xs font-extrabold tracking-widest uppercase" style={{ color: memberById(next.quem).cor }}>
                  Passe a vez para {memberById(next.quem).nome}
                </div>
                <p className="mt-1 text-xl font-bold">“{entry.passagem}”</p>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <SlidePreview index={index} />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => goto(index - 1)}
                disabled={index === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 py-4 text-lg font-bold transition hover:bg-white/20 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" /> Anterior
              </button>
              <button
                type="button"
                onClick={() => goto(index + 1)}
                disabled={index === LAST}
                className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-extrabold transition hover:bg-primary-600 disabled:opacity-30"
              >
                Próximo <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {next && (
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold tracking-widest text-white/50 uppercase">A seguir</span>
                  <span className="font-semibold text-white/70">
                    {next.titulo}
                    {mode === "5" && <> · {memberById(next.quem).nome}</>}
                  </span>
                </div>
                <div className="w-1/2 opacity-70">
                  <SlidePreview index={index + 1} />
                </div>
              </div>
            )}

            <ol className="space-y-1 rounded-2xl bg-white/5 p-2">
              {PITCH_SCRIPT.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goto(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                      i === index ? "bg-white text-ink" : "text-white/75 hover:bg-white/10",
                    )}
                  >
                    <span className="w-5 font-bold tabular-nums opacity-60">{i + 1}</span>
                    <span className="flex-1 font-semibold">{s.titulo}</span>
                    {mode === "5" && (
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        <span className="h-2 w-2 rounded-full" style={{ background: memberById(s.quem).cor }} />
                        {memberById(s.quem).nome}
                      </span>
                    )}
                    <span className="w-9 text-right text-xs tabular-nums opacity-60">{s.segundos}s</span>
                  </button>
                </li>
              ))}
            </ol>

            <QaList mode={mode} />
          </aside>
        </main>
      ) : (
        <FullScript mode={mode} />
      )}
    </div>
  );
}

function SlidePreview({ index }: { index: number }) {
  const View = SLIDE_VIEWS[PITCH_SCRIPT[index].id];
  return (
    <Fit className="pointer-events-none aspect-video w-full rounded-xl bg-bg ring-1 ring-white/10">
      <div key={PITCH_SCRIPT[index].id} className="absolute inset-0">
        <View active={false} />
      </div>
    </Fit>
  );
}

function QaList({ mode }: { mode: Mode }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold tracking-widest text-white/50 uppercase">
        <MessageSquareQuote className="h-4 w-4" /> Perguntas prováveis
      </div>
      {QA.map((q) => (
        <details key={q.pergunta} className="group border-t border-white/10 py-2 first:border-0">
          <summary className="cursor-pointer text-sm font-bold text-white/85">{q.pergunta}</summary>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            {mode === "5" && <b style={{ color: memberById(q.quem).cor }}>{memberById(q.quem).nome}: </b>}
            {q.resposta}
          </p>
        </details>
      ))}
    </div>
  );
}

function FullScript({ mode }: { mode: Mode }) {
  return (
    <main className="mx-auto max-w-4xl p-6 print:max-w-none print:p-0">
      <div className="flex items-center justify-between print:mb-4">
        <div>
          <h1 className="text-3xl font-black">Roteiro do pitch · EasyPet</h1>
          <p className="mt-1 text-white/60 print:text-muted">
            {mode === "5" ? "Versão com 5 apresentadores" : "Versão com 1 apresentador"} · {clock(TOTAL_SECONDS * 1000)} no total
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-bold hover:bg-white/20 print:hidden"
        >
          <Printer className="h-4 w-4" /> Imprimir
        </button>
      </div>
      <ol className="mt-6 space-y-4">
        {PITCH_SCRIPT.map((entry, i) => {
          const speaker = speakerOf(entry, mode);
          return (
            <li key={entry.id} className="break-inside-avoid rounded-2xl bg-white/5 p-5 print:border print:border-line print:bg-white">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-black tabular-nums text-white/40 print:text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg font-extrabold">{entry.titulo}</span>
                <span className="flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-bold" style={{ background: `${speaker.cor}26`, color: speaker.cor }}>
                  {speaker.nome}
                </span>
                <span className="ml-auto text-sm tabular-nums text-white/50 print:text-muted">
                  {clock(PLAN_START[i] * 1000)} → {clock((PLAN_START[i] + entry.segundos) * 1000)} · {entry.segundos}s
                </span>
              </div>
              <p className="mt-3 text-lg leading-relaxed">{speechOf(entry, mode)}</p>
              {entry.palco && (
                <p className="mt-2 text-sm text-accent print:text-muted">
                  <b>Palco:</b> {entry.palco}
                </p>
              )}
              {mode === "5" && entry.passagem && (
                <p className="mt-2 text-sm text-white/70 print:text-ink">
                  <b>Passagem:</b> “{entry.passagem}”
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <section className="mt-8 break-inside-avoid">
        <h2 className="text-xl font-black">Perguntas prováveis</h2>
        <ul className="mt-3 space-y-3">
          {QA.map((q) => (
            <li key={q.pergunta}>
              <div className="font-bold">{q.pergunta}</div>
              <div className="text-white/70 print:text-ink">
                {mode === "5" && <b>{memberById(q.quem).nome}: </b>}
                {q.resposta}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20"
    >
      {children}
    </button>
  );
}
