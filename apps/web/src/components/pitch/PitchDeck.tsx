"use client";

import { ChevronLeft, ChevronRight, Maximize, Presentation } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/cn";
import { PITCH_SCRIPT } from "./script";
import { SLIDE_VIEWS } from "./slides";
import { openPitchChannel, PRESENTER_WINDOW } from "./sync";
import { Fit } from "./ui";

const LAST = PITCH_SCRIPT.length - 1;

function readHash() {
  const n = Number.parseInt(window.location.hash.slice(1), 10);
  return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), LAST) : 0;
}

export function openPresenter() {
  window.open("/pitch/apresentador", PRESENTER_WINDOW, "popup,width=1360,height=860");
}

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown };

export default function PitchDeck() {
  const [index, setIndex] = useState(readHash);
  const [chrome, setChrome] = useState(true);
  const indexRef = useRef(index);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const channel = useRef<ReturnType<typeof openPitchChannel>>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback((target: number) => {
    const next = Math.min(Math.max(target, 0), LAST);
    if (next === indexRef.current) return;
    document.documentElement.dataset.ptDir = next < indexRef.current ? "back" : "forward";
    indexRef.current = next;
    const doc = document as ViewTransitionDocument;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reduce) doc.startViewTransition(() => flushSync(() => setIndex(next)));
    else setIndex(next);
  }, []);

  const showChrome = useCallback(() => {
    setChrome(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setChrome(false), 2500);
  }, []);

  // Estado da apresentação → URL (#n) e modo apresentador.
  useEffect(() => {
    window.history.replaceState(null, "", `#${index + 1}`);
    channel.current?.post({ type: "state", index });
  }, [index]);

  useEffect(() => {
    const ch = openPitchChannel((message) => {
      if (message.type === "goto") go(message.index);
      else if (message.type === "hello") ch.post({ type: "state", index: indexRef.current });
    });
    channel.current = ch;
    ch.post({ type: "state", index: indexRef.current });
    return () => {
      ch.close();
      channel.current = null;
    };
  }, [go]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(key)) go(indexRef.current + 1);
      else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(key)) go(indexRef.current - 1);
      else if (key === "Home") go(0);
      else if (key === "End") go(LAST);
      else if (key === "f" || key === "F") toggleFullscreen();
      else if (key === "p" || key === "P") openPresenter();
      else return;
      event.preventDefault();
    };
    const onHash = () => go(readHash());
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    idle.current = setTimeout(() => setChrome(false), 4000);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
      clearTimeout(idle.current);
    };
  }, [go]);

  const slide = PITCH_SCRIPT[index];
  const View = SLIDE_VIEWS[slide.id];

  return (
    <div
      className="fixed inset-0 cursor-pointer bg-[#141210] select-none"
      onMouseMove={showChrome}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a, button")) return;
        go(indexRef.current + (event.clientX < window.innerWidth * 0.25 ? -1 : 1));
      }}
      onTouchStart={(event) => (touchX.current = event.touches[0].clientX)}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const dx = event.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(indexRef.current + (dx < 0 ? 1 : -1));
      }}
    >
      <Fit className="h-full w-full">
        <div key={slide.id} className="absolute inset-0" style={{ viewTransitionName: "pt-slide" } as CSSProperties}>
          <View active />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[6px] bg-black/5">
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${((index + 1) / PITCH_SCRIPT.length) * 100}%` }}
          />
        </div>
      </Fit>

      <div
        className={cn(
          "fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink/85 p-1.5 text-white shadow-lift backdrop-blur transition-opacity duration-300",
          chrome ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <DeckButton label="Slide anterior (←)" onClick={() => go(index - 1)} disabled={index === 0}>
          <ChevronLeft className="h-5 w-5" />
        </DeckButton>
        <span className="min-w-16 text-center text-sm font-bold tabular-nums">
          {index + 1} / {PITCH_SCRIPT.length}
        </span>
        <DeckButton label="Próximo slide (→)" onClick={() => go(index + 1)} disabled={index === LAST}>
          <ChevronRight className="h-5 w-5" />
        </DeckButton>
        <span className="mx-1 h-6 w-px bg-white/20" />
        <DeckButton label="Tela cheia (F)" onClick={toggleFullscreen}>
          <Maximize className="h-4.5 w-4.5" />
        </DeckButton>
        <button
          type="button"
          onClick={openPresenter}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition hover:bg-white/15"
        >
          <Presentation className="h-4.5 w-4.5" /> Modo apresentador <kbd className="text-white/50">P</kbd>
        </button>
      </div>
    </div>
  );
}

function DeckButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/15 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.().catch(() => {});
}
