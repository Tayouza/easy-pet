"use client";

import {
  Award,
  BadgeCheck,
  Bath,
  Check,
  Clock,
  Crown,
  ExternalLink,
  Eye,
  Footprints,
  HeartHandshake,
  Heart,
  Hotel,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Navigation,
  PawPrint,
  PhoneMissed,
  Pill,
  Quote,
  Rocket,
  Scissors,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  Store,
  Syringe,
  Target,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";
import { TEAM, type SlideId } from "./script";
import { A, CountUp, Phone, Pin, Tag, Typed } from "./ui";

/* ───────────────────────── moldura comum ───────────────────────── */

function Frame({
  children,
  dark,
  blob = "orange",
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  blob?: "orange" | "teal" | "none";
  className?: string;
}) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden font-sans", dark ? "bg-ink text-white" : "bg-bg text-ink")}>
      {blob !== "none" && (
        <div
          className={cn(
            "pt-fade absolute -top-[300px] -right-[260px] h-[980px] w-[980px] rounded-full",
            blob === "orange" ? "bg-[#FFE9DA]" : "bg-secondary-50",
            dark && "bg-white/[0.04]",
          )}
        />
      )}
      <div className="absolute inset-x-[96px] top-[52px] flex items-center justify-between">
        <Logo light={dark} className="h-[52px]" />
        <span className={cn("text-[17px] font-bold tracking-[0.3em]", dark ? "text-white/50" : "text-secondary")}>
          PORTO ALEGRE / RS
        </span>
      </div>
      <div className={cn("absolute inset-x-[96px] top-[140px] bottom-[70px]", className)}>{children}</div>
    </div>
  );
}

function Title({ lines, d = 100, size = 84, accentLast }: { lines: string[]; d?: number; size?: number; accentLast?: boolean }) {
  return (
    <h1 className="font-black tracking-[-0.035em] whitespace-nowrap" style={{ fontSize: size, lineHeight: 1.04 }}>
      {lines.map((line, i) => (
        <A key={line} d={d + i * 120}>
          <span className={cn(accentLast && i === lines.length - 1 && "text-primary")}>{line}</span>
        </A>
      ))}
    </h1>
  );
}

const CATEGORIES: { icon: LucideIcon; color: string; label: string }[] = [
  { icon: Stethoscope, color: "#2B7FFF", label: "Veterinário" },
  { icon: Store, color: "#FF6B35", label: "Pet Shop" },
  { icon: Bath, color: "#3BB3C4", label: "Banho e Tosa" },
  { icon: Hotel, color: "#8E5CD9", label: "Hotel e Creche" },
  { icon: Award, color: "#E0A100", label: "Adestrador" },
  { icon: Footprints, color: "#2E9E5B", label: "Dog Walker" },
  { icon: Pill, color: "#E85D9A", label: "Farmácia" },
  { icon: Scissors, color: "#127475", label: "Tosa" },
];

/* ───────────────────────── 1. capa ───────────────────────── */

function Capa() {
  return (
    <Frame>
      <div className="flex h-full items-center justify-between">
        <div className="w-[860px]">
          <A>
            <Tag>Pitch · Shark Tank</Tag>
          </A>
          <div className="mt-9">
            <Title lines={["Seu pet precisa.", "Você encontra."]} size={104} accentLast />
          </div>
          <A d={480}>
            <p className="mt-8 text-[34px] leading-snug text-muted">A vitrine geolocalizada de tudo que é pet.</p>
          </A>
          <A v="fade" d={800} className="mt-14 flex flex-wrap gap-3">
            {TEAM.map((m) => (
              <span key={m.id} className="flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-[20px] font-bold shadow-soft">
                <span className="h-3 w-3 rounded-full" style={{ background: m.cor }} />
                {m.nome}
              </span>
            ))}
          </A>
        </div>
        <Orbit />
      </div>
    </Frame>
  );
}

function Orbit() {
  const R = 250;
  return (
    <A v="pop" d={200} className="relative mr-[20px] h-[600px] w-[600px]">
      <div className="absolute inset-[50px] rounded-full border-2 border-dashed border-primary/30" />
      <div className="absolute inset-[150px] rounded-full bg-white shadow-lift" />
      <div className="pt-spin-slow absolute inset-0">
        {CATEGORIES.map((c, i) => {
          const angle = (i / CATEGORIES.length) * Math.PI * 2;
          return (
            <div
              key={c.label}
              className="absolute"
              style={{ left: 300 + Math.cos(angle) * R - 36, top: 300 + Math.sin(angle) * R - 36 }}
            >
              <div className="pt-spin-slow-reverse grid h-[72px] w-[72px] place-items-center rounded-[22px] bg-white shadow-lift">
                <c.icon style={{ color: c.color }} className="h-9 w-9" strokeWidth={2.2} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="pt-float">
          <LogoMark className="h-[230px] w-[230px] drop-shadow-[0_18px_24px_rgba(255,107,53,0.35)]" />
        </div>
      </div>
    </A>
  );
}

/* ───────────────────────── 2. gancho ───────────────────────── */

const NIGHT_FEED: { icon: LucideIcon; from: string; text: string; tone?: "bad" }[] = [
  { icon: Search, from: "Google", text: "veterinário aberto perto de mim" },
  { icon: Store, from: "Clínica Patas & Cia", text: "Fechado · abre amanhã às 8h", tone: "bad" },
  { icon: PhoneMissed, from: "Chamada não atendida", text: "Hospital Veterinário Zona Sul", tone: "bad" },
  { icon: MessagesSquare, from: "Grupo do condomínio", text: "Alguém conhece vet aberto agora??" },
  { icon: MessageCircle, from: "@clinica.patinhas", text: "Respondemos em horário comercial 💛", tone: "bad" },
];

function Gancho() {
  return (
    <Frame dark blob="none">
      <div className="flex h-full items-center justify-between">
        <div className="w-[820px]">
          <A>
            <Tag dark>Sexta-feira</Tag>
          </A>
          <A v="pop" d={150}>
            <div className="mt-4 text-[220px] leading-none font-black tracking-[-0.05em] tabular-nums">
              22<span className="animate-pulse text-primary">:</span>07
            </div>
          </A>
          <Title lines={["A Luna não está bem."]} d={500} size={72} />
          <A d={3600}>
            <p className="mt-8 flex items-center gap-4 text-[32px] text-white/70">
              <Clock className="h-9 w-9 text-accent" /> 20 minutos depois, ainda sem saber pra onde ir.
            </p>
          </A>
        </div>
        <Phone dark className="h-[700px] w-[360px] -rotate-3">
          <div className="flex h-full flex-col gap-3 px-4 pt-16">
            <div className="mb-2 text-center text-[64px] leading-none font-extralight text-white/90 tabular-nums">22:07</div>
            {NIGHT_FEED.map((n, i) => (
              <A key={n.from} v="pop" d={700 + i * 520}>
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-[20px] bg-white/[0.12] p-3.5 backdrop-blur",
                    i === NIGHT_FEED.length - 1 && "pt-shake",
                  )}
                  style={{ animationDelay: `${700 + i * 520 + 600}ms` }}
                >
                  <div
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                      n.tone === "bad" ? "bg-danger/90" : "bg-white/20",
                    )}
                  >
                    <n.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-extrabold text-white">{n.from}</div>
                    <div className="text-[15px] leading-snug text-white/75">{n.text}</div>
                  </div>
                </div>
              </A>
            ))}
          </div>
        </Phone>
      </div>
    </Frame>
  );
}

/* ───────────────────────── 3. problema ───────────────────────── */

const SOURCES: { label: string; x: number; y: number; r: number }[] = [
  { label: "Google", x: 30, y: 10, r: -6 },
  { label: "Instagram", x: 250, y: 0, r: 5 },
  { label: "Grupo do WhatsApp", x: 110, y: 95, r: -3 },
  { label: "Indicação do vizinho", x: 0, y: 190, r: 4 },
  { label: "Facebook", x: 300, y: 200, r: -8 },
  { label: "Panfleto na porta", x: 90, y: 290, r: 2 },
];

function Problema() {
  return (
    <Frame blob="teal">
      <Title lines={["O cuidado existe.", "Só não é fácil de achar."]} accentLast size={78} />
      <div className="mt-14 flex items-start gap-12">
        <div className="relative h-[360px] w-[520px] shrink-0">
          {SOURCES.map((s, i) => (
            <A key={s.label} v="pop" d={500 + i * 160} className="absolute" style={{ left: s.x, top: s.y }}>
              <div
                className="rounded-full border-2 border-line bg-white px-6 py-3.5 text-[24px] font-bold shadow-soft"
                style={{ transform: `rotate(${s.r}deg)` }}
              >
                {s.label}
              </div>
            </A>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-6">
          <PainCard
            d={1300}
            icon={Heart}
            color="#FF6B35"
            title="Para o tutor"
            items={["Informação espalhada e desatualizada", "Não sabe quem está aberto agora", "Perde tempo quando mais precisa"]}
          />
          <PainCard
            d={1550}
            icon={Store}
            color="#127475"
            title="Para o lojista"
            items={["Ótimo serviço, pouca visibilidade", "Depende só do boca a boca", "Não sabe quem procura por ele"]}
          />
        </div>
      </div>
    </Frame>
  );
}

function PainCard({ d, icon: Icon, color, title, items }: { d: number; icon: LucideIcon; color: string; title: string; items: string[] }) {
  return (
    <A d={d} className="card p-8">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: `${color}1A` }}>
          <Icon className="h-7 w-7" style={{ color }} />
        </div>
        <div className="text-[30px] font-black">{title}</div>
      </div>
      <ul className="mt-6 space-y-4">
        {items.map((t, i) => (
          <A key={t} v="slide-left" d={d + 250 + i * 150}>
            <li className="flex items-start gap-3 text-[23px] leading-snug text-muted">
              <X className="mt-1 h-6 w-6 shrink-0 text-danger" strokeWidth={3} /> {t}
            </li>
          </A>
        ))}
      </ul>
    </A>
  );
}

/* ───────────────────────── 4. solução ───────────────────────── */

const MAP_PINS: { x: number; y: number; c: number; d: number }[] = [
  { x: 120, y: 190, c: 1, d: 1500 },
  { x: 470, y: 160, c: 2, d: 1650 },
  { x: 540, y: 330, c: 3, d: 1800 },
  { x: 205, y: 330, c: 4, d: 1950 },
  { x: 440, y: 320, c: 6, d: 2100 },
  { x: 330, y: 215, c: 0, d: 2300 },
];

function Solucao() {
  return (
    <Frame>
      <div className="flex h-full items-center justify-between gap-16">
        <div className="w-[700px]">
          <A>
            <Tag>A solução</Tag>
          </A>
          <div className="mt-8">
            <Title lines={["Tudo pet", "num mapa.", "A um toque."]} accentLast size={80} />
          </div>
          <div className="mt-12 space-y-6">
            {[
              { icon: MapPin, t: "Busque por perto", s: "15 categorias, do veterinário ao hotel" },
              { icon: Clock, t: "Veja quem está aberto", s: "Horários, avaliações e distância" },
              { icon: MessageCircle, t: "Chame ou vá", s: "WhatsApp e rota em um toque" },
            ].map((step, i) => (
              <A key={step.t} d={600 + i * 200} className="flex items-center gap-5">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-lift">
                  <step.icon className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-[30px] font-black">{step.t}</div>
                  <div className="text-[22px] text-muted">{step.s}</div>
                </div>
              </A>
            ))}
          </div>
        </div>
        <MapScene />
      </div>
    </Frame>
  );
}

function MapScene() {
  return (
    <A v="pop" d={250} className="relative h-[660px] w-[680px] shrink-0">
      <div className="absolute inset-0 overflow-hidden rounded-[40px] border-[10px] border-white bg-secondary-50 shadow-[0_40px_80px_rgba(18,116,117,0.18)]">
        <svg viewBox="0 0 660 640" className="absolute inset-0 h-full w-full">
          <path d="M-40 640 C 60 470, 10 300, 90 160 S 60 -10, 40 -40 L -40 -40 Z" fill="#B4DCDD" />
          <ellipse cx="520" cy="540" rx="90" ry="60" fill="#CFE8D2" />
          <ellipse cx="300" cy="110" rx="60" ry="40" fill="#CFE8D2" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <g key={i}>
              <path d={`M${150 + i * 100} -20 L${90 + i * 100} 660`} stroke="white" strokeWidth="16" />
              <path d={`M60 ${40 + i * 95} L700 ${10 + i * 95}`} stroke="white" strokeWidth="12" />
            </g>
          ))}
          <path d="M120 660 C 260 420, 380 300, 700 230" stroke="#FFE1D4" strokeWidth="22" fill="none" />
        </svg>
        <div className="absolute" style={{ left: 312, top: 300 }}>
          <span className="pt-ping absolute inset-0 rounded-full bg-[#2B7FFF]" />
          <span className="relative block h-6 w-6 rounded-full border-4 border-white bg-[#2B7FFF] shadow-lg" />
        </div>
        {MAP_PINS.map((p) => {
          const c = CATEGORIES[p.c];
          return (
            <A key={`${p.x}-${p.y}`} v="drop" d={p.d} className="absolute" style={{ left: p.x, top: p.y }}>
              <Pin color={c.color} icon={c.icon} size={p.c === 0 ? 64 : 50} />
            </A>
          );
        })}
      </div>
      <A d={500} className="absolute inset-x-6 top-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-[22px] font-semibold shadow-lift">
          <Search className="h-6 w-6 shrink-0 text-primary" />
          <Typed text="veterinário aberto agora" delay={900} />
        </div>
        <div className="mt-3 flex gap-2">
          {CATEGORIES.slice(0, 3).map((c, i) => (
            <span
              key={c.label}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-[16px] font-bold shadow-soft",
                i === 0 ? "bg-secondary text-white" : "bg-white text-ink",
              )}
            >
              <c.icon className="h-4 w-4" /> {c.label}
            </span>
          ))}
        </div>
      </A>
      <A v="rise" d={2800} className="absolute inset-x-6 bottom-6">
        <div className="rounded-3xl bg-white p-5 shadow-lift">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[26px] font-black">Vet Amigo 24h</div>
              <div className="mt-1 flex items-center gap-4 text-[18px] text-muted">
                <span>Veterinário · 650 m</span>
                <span className="font-bold text-success">● Aberto agora</span>
                <span className="flex items-center gap-1 font-bold text-ink">
                  <Star className="h-4 w-4 fill-accent text-accent" /> 4,9
                </span>
              </div>
            </div>
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <div className="mt-4 flex gap-3">
            <span className="pt-glow flex flex-1 items-center justify-center gap-2 rounded-2xl bg-success py-3.5 text-[20px] font-extrabold text-white">
              <MessageCircle className="h-5 w-5" /> WhatsApp
            </span>
            <span className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[20px] font-extrabold text-white">
              <Navigation className="h-5 w-5" /> Rota
            </span>
          </div>
        </div>
      </A>
    </A>
  );
}

/* ───────────────────────── 5. produto ───────────────────────── */

function Produto() {
  return (
    <Frame blob="teal">
      <div className="flex items-end justify-between">
        <Title lines={["Tutor e lojista,", "no mesmo lugar."]} accentLast size={72} />
        <A d={500}>
          <a
            href="/explorar"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-[20px] font-extrabold text-white shadow-lift transition hover:bg-primary"
          >
            Ver ao vivo <ExternalLink className="h-5 w-5" />
          </a>
        </A>
      </div>
      <div className="mt-6 flex items-start justify-center gap-14">
        <ProductPhone d={300} label="O tutor encontra e decide" className="mt-10">
          <div className="h-[150px] bg-gradient-to-br from-[#2B7FFF] to-secondary" />
          <div className="-mt-8 px-4">
            <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-white shadow-soft">
              <Stethoscope className="h-8 w-8 text-[#2B7FFF]" />
            </div>
            <div className="mt-2 text-[20px] font-black">Vet Amigo 24h</div>
            <div className="flex items-center gap-1 text-[14px] text-muted">
              <Star className="h-4 w-4 fill-accent text-accent" /> 4,9 · 128 avaliações
            </div>
            <div className="mt-3 rounded-2xl border-2 border-dashed border-primary/50 bg-primary-50 p-3">
              <div className="flex items-center gap-2 text-[14px] font-extrabold text-primary">
                <Ticket className="h-4 w-4" /> 15% OFF na consulta
              </div>
              <div className="text-[12px] text-muted">Cupom exclusivo Premium</div>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="flex-1 rounded-xl bg-success py-2 text-center text-[13px] font-bold text-white">WhatsApp</span>
              <span className="flex-1 rounded-xl bg-primary py-2 text-center text-[13px] font-bold text-white">Rota</span>
            </div>
          </div>
        </ProductPhone>
        <ProductPhone d={500} label="O Premium cuida da saúde" featured>
          <div className="px-4 pt-12">
            <div className="flex items-center gap-2 text-[13px] font-extrabold tracking-widest text-secondary">
              <Crown className="h-4 w-4 text-accent" /> CARTEIRINHA DIGITAL
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-50">
                <PawPrint className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="text-[26px] font-black">Luna</div>
                <div className="text-[14px] text-muted">Vira-lata · 4 anos</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                ["V10", "Aplicada em mar/2026", true],
                ["Antirrábica", "Aplicada em mai/2026", true],
                ["Giárdia", "Próxima dose em 12 dias", false],
              ].map(([v, s, ok], i) => (
                <A key={v as string} v="slide-left" d={1000 + i * 180}>
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
                    <Syringe className="h-5 w-5 text-secondary" />
                    <div className="flex-1">
                      <div className="text-[15px] font-extrabold">{v}</div>
                      <div className="text-[12px] text-muted">{s}</div>
                    </div>
                    {ok ? <Check className="h-5 w-5 text-success" /> : <Clock className="h-5 w-5 text-primary" />}
                  </div>
                </A>
              ))}
            </div>
          </div>
        </ProductPhone>
        <ProductPhone d={700} label="O lojista entende o interesse" className="mt-10">
          <div className="px-4 pt-12">
            <div className="text-[13px] font-extrabold tracking-widest text-secondary">SUA LOJA · 30 DIAS</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                [Eye, "Visitas"],
                [MessageCircle, "WhatsApp"],
                [Navigation, "Rotas"],
              ].map(([Icon, l]) => {
                const I = Icon as LucideIcon;
                return (
                  <div key={l as string} className="rounded-xl bg-white p-2 text-center shadow-soft">
                    <I className="mx-auto h-5 w-5 text-primary" />
                    <div className="mt-1 text-[11px] font-bold">{l as string}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex h-[150px] items-end gap-1.5 rounded-2xl bg-white p-3 shadow-soft">
              {[0.3, 0.45, 0.38, 0.6, 0.52, 0.7, 0.85, 0.74, 0.95].map((h, i) => (
                <div
                  key={i}
                  className="pt-rise flex-1 rounded-t-md"
                  style={{
                    height: `${h * 100}%`,
                    background: i === 8 ? "#FF6B35" : "#127475",
                    opacity: 0.5 + i * 0.06,
                    animationDelay: `${1100 + i * 90}ms`,
                  }}
                />
              ))}
            </div>
            <div className="mt-3 text-center text-[11px] text-muted">Ilustração · estatísticas do plano Profissional</div>
          </div>
        </ProductPhone>
      </div>
    </Frame>
  );
}

function ProductPhone({
  children,
  label,
  d,
  featured,
  className,
}: {
  children: ReactNode;
  label: string;
  d: number;
  featured?: boolean;
  className?: string;
}) {
  return (
    <A d={d} className={cn("flex flex-col items-center", className)}>
      <Phone className={cn(featured ? "h-[520px] w-[270px]" : "h-[480px] w-[250px]", featured && "ring-8 ring-primary/20")}>
        {children}
      </Phone>
      <div className="mt-5 text-[22px] font-extrabold">{label}</div>
    </A>
  );
}

/* ───────────────────────── 6. mercado ───────────────────────── */

function Mercado() {
  return (
    <Frame>
      <A>
        <Tag>O mercado</Tag>
      </A>
      <div className="mt-7">
        <Title lines={["Um mercado gigante", "que segue crescendo."]} accentLast size={76} />
      </div>
      <div className="mt-14 grid grid-cols-3 gap-7">
        <Stat d={500} big={<>R$ <CountUp to={78} delay={700} /> bi</>} text="faturamento do setor pet no Brasil em 2025" color="#FF6B35" />
        <Stat d={700} big={<><CountUp to={160} delay={900} /> mi</>} text="animais de estimação nos lares brasileiros" color="#127475" />
        <Stat d={900} big={<>+<CountUp to={3.45} decimals={2} delay={1100} />%</>} text="de crescimento do setor em 2025" color="#5468D4" />
      </div>
      <A d={1700} className="mt-10 flex items-center justify-between rounded-3xl bg-white px-8 py-5 shadow-soft">
        <span className="flex items-center gap-4 text-[24px] font-bold">
          <MapPin className="h-8 w-8 text-primary" /> Porta de entrada: Porto Alegre, com 15 categorias de serviço
        </span>
        <span className="text-[16px] text-muted">Fontes: Abinpet e Instituto Pet Brasil</span>
      </A>
    </Frame>
  );
}

function Stat({ d, big, text, color }: { d: number; big: ReactNode; text: string; color: string }) {
  return (
    <A v="pop" d={d} className="card overflow-hidden p-9">
      <div className="h-2 w-20 rounded-full" style={{ background: color }} />
      <div className="mt-6 text-[88px] leading-none font-black tracking-[-0.04em]" style={{ color }}>
        {big}
      </div>
      <div className="mt-5 text-[24px] leading-snug text-muted">{text}</div>
    </A>
  );
}

/* ───────────────────────── 7. modelo ───────────────────────── */

const STORE_PLANS = [
  { nome: "Básico", preco: "49,90", itens: ["Perfil + pin no mapa", "Até 10 itens"] },
  { nome: "Profissional", preco: "99,90", itens: ["Itens ilimitados", "Cupons + estatísticas"] },
  { nome: "Destaque", preco: "199,90", itens: ["Topo das buscas", "Pin destacado"] },
];

function Modelo() {
  return (
    <Frame blob="teal">
      <Title lines={["Duas pontas,", "receita recorrente."]} accentLast size={72} />
      <div className="mt-10 flex gap-8">
        <A d={400} className="w-[520px] shrink-0">
          <div className="mb-4 flex items-center gap-3 text-[22px] font-extrabold tracking-[0.15em] text-secondary">
            <Heart className="h-6 w-6" /> TUTOR
          </div>
          <div className="flex gap-4">
            <div className="card flex-1 p-6">
              <div className="text-[24px] font-black">Grátis</div>
              <div className="mt-3 space-y-2 text-[18px] text-muted">
                <div>Mapa, busca e rota</div>
                <div>WhatsApp da loja</div>
                <div>Até 5 favoritos</div>
              </div>
            </div>
            <div className="flex-1 rounded-[16px] bg-secondary p-6 text-white shadow-lift">
              <div className="flex items-center gap-2 text-[24px] font-black">
                <Crown className="h-6 w-6 text-accent" /> Premium
              </div>
              <div className="mt-2 text-[40px] leading-none font-black">
                R$ 9,90<span className="text-[18px] font-semibold opacity-75">/mês</span>
              </div>
              <div className="mt-3 space-y-1.5 text-[17px] opacity-90">
                <div>Cupons exclusivos</div>
                <div>Carteirinha do pet</div>
                <div>Sem anúncios</div>
              </div>
            </div>
          </div>
        </A>
        <A d={650} className="flex-1">
          <div className="mb-4 flex items-center gap-3 text-[22px] font-extrabold tracking-[0.15em] text-primary">
            <Store className="h-6 w-6" /> LOJISTA
          </div>
          <div className="flex gap-4">
            {STORE_PLANS.map((p, i) => (
              <A
                key={p.nome}
                v="pop"
                d={800 + i * 150}
                className={cn("card flex-1 p-6", i === 2 && "border-primary bg-primary-50 ring-4 ring-primary/20")}
              >
                <div className="flex items-center justify-between text-[22px] font-black">
                  {p.nome} {i === 2 && <Star className="h-5 w-5 fill-accent text-accent" />}
                </div>
                <div className="mt-2 text-[34px] leading-none font-black">
                  R$ {p.preco}
                  <span className="text-[16px] font-semibold text-muted">/mês</span>
                </div>
                <div className="mt-3 space-y-1.5 text-[17px] text-muted">
                  {p.itens.map((t) => (
                    <div key={t}>{t}</div>
                  ))}
                </div>
              </A>
            ))}
          </div>
        </A>
      </div>
      <A d={1500} className="mt-8 flex items-center gap-6 rounded-3xl bg-ink px-8 py-6 text-white shadow-lift">
        <span className="rounded-full bg-white/10 px-4 py-1.5 text-[15px] font-bold tracking-widest text-accent">SIMULAÇÃO</span>
        <span>
          <span className="block text-[24px] font-bold">400 lojas + 300 assinantes Premium</span>
          <span className="block text-[17px] text-white/60">200 Básico · 150 Profissional · 50 Destaque</span>
        </span>
        <span className="ml-auto text-[44px] leading-none font-black text-accent">
          R$ <CountUp to={37930} delay={1800} duration={1800} />
          <span className="text-[20px] font-semibold text-white/70">/mês</span>
        </span>
      </A>
    </Frame>
  );
}

/* ───────────────────────── 8. tração ───────────────────────── */

const VALUE_DONE = [
  "Site e app Android funcionando de ponta a ponta",
  "O tutor encontra, compara e chama a loja em segundos",
  "O lojista se cadastra, escolhe o plano e acompanha resultados",
  "Toda loja é aprovada antes de aparecer no mapa",
  "Cada pessoa só acessa os próprios dados",
];

const QUALITY = [
  "Processos e responsabilidades definidos",
  "Riscos e oportunidades mapeados",
  "Critérios de aceite antes de cada versão",
  "Melhoria contínua a cada ciclo",
];

function Tracao() {
  return (
    <Frame>
      <A>
        <Tag>Onde estamos</Tag>
      </A>
      <div className="mt-7">
        <Title lines={["MVP funcionando,", "feito com qualidade."]} accentLast size={72} />
      </div>
      <div className="mt-9 flex gap-8">
        <div className="flex-1 space-y-3">
          {VALUE_DONE.map((t, i) => (
            <A key={t} v="slide-left" d={600 + i * 140} className="flex items-center gap-4 rounded-2xl bg-white px-6 py-3.5 shadow-soft">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success text-white">
                <Check className="h-6 w-6" strokeWidth={3} />
              </span>
              <span className="text-[23px] font-bold">{t}</span>
            </A>
          ))}
        </div>
        <A v="pop" d={1300} className="w-[520px] shrink-0 rounded-[28px] bg-secondary p-8 text-white shadow-lift">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/15">
              <BadgeCheck className="h-9 w-9 text-accent" />
            </div>
            <div>
              <div className="text-[28px] leading-tight font-black">Qualidade como método</div>
              <div className="text-[18px] text-white/75">Gestão da qualidade com base na ISO 9001</div>
            </div>
          </div>
          <div className="mt-6 space-y-3.5">
            {QUALITY.map((t, i) => (
              <A key={t} v="slide-left" d={1600 + i * 150} className="flex items-center gap-3 text-[21px] font-semibold">
                <Check className="h-6 w-6 shrink-0 text-accent" strokeWidth={3} /> {t}
              </A>
            ))}
          </div>
        </A>
      </div>
      <A d={2400} className="mt-6 flex items-center gap-4 rounded-2xl border-2 border-accent bg-accent-50 px-6 py-3.5">
        <ShieldCheck className="h-7 w-7 shrink-0 text-[#B98300]" />
        <span className="text-[21px]">
          <b>Transparência:</b> pagamentos ainda simulados e app iOS em desenvolvimento. Os dois chegam antes do lançamento oficial.
        </span>
      </A>
    </Frame>
  );
}

/* ───────────────────────── 9. propósito ───────────────────────── */

const VALUES: { icon: LucideIcon; t: string }[] = [
  { icon: PawPrint, t: "Bem-estar animal em primeiro lugar" },
  { icon: ShieldCheck, t: "Responsabilidade" },
  { icon: HeartHandshake, t: "Empatia" },
  { icon: Eye, t: "Informação clara" },
  { icon: Star, t: "Avaliações honestas" },
];

function Proposito() {
  return (
    <Frame blob="none">
      <div className="grid h-[470px] grid-cols-[1.25fr_1fr] gap-7">
        <A v="pop" d={150} className="relative overflow-hidden rounded-[32px] bg-primary p-11 text-white shadow-lift">
          <Quote className="absolute -right-6 -bottom-10 h-56 w-56 rotate-180 text-white/10" />
          <div className="flex items-center gap-3 text-[22px] font-extrabold tracking-[0.2em] text-white/80">
            <Target className="h-7 w-7" /> MISSÃO
          </div>
          <p className="mt-7 text-[46px] leading-[1.15] font-black tracking-[-0.02em]">
            Aproximar cada pet do cuidado certo, ajudando tutores a encontrar com rapidez e segurança os profissionais que vão cuidar
            bem dele.
          </p>
        </A>
        <A v="pop" d={450} className="rounded-[32px] bg-secondary p-11 text-white shadow-lift">
          <div className="flex items-center gap-3 text-[22px] font-extrabold tracking-[0.2em] text-white/80">
            <Rocket className="h-7 w-7" /> VISÃO
          </div>
          <p className="mt-7 text-[40px] leading-[1.18] font-black tracking-[-0.02em]">
            Ser a plataforma que mais contribui para o bem-estar dos pets nas cidades onde atua.
          </p>
        </A>
      </div>
      <A d={800} className="mt-9 text-[22px] font-extrabold tracking-[0.2em] text-secondary">
        VALORES
      </A>
      <div className="mt-4 flex gap-4">
        {VALUES.map((v, i) => (
          <A
            key={v.t}
            v="pop"
            d={950 + i * 150}
            className={cn("card flex flex-1 flex-col gap-3 p-5", i === 0 && "border-primary bg-primary-50")}
          >
            <v.icon className="h-8 w-8 text-primary" />
            <span className="text-[21px] leading-tight font-extrabold">{v.t}</span>
          </A>
        ))}
      </div>
    </Frame>
  );
}

/* ───────────────────────── 10. equipe ───────────────────────── */

function Equipe() {
  return (
    <Frame>
      <Title lines={["Quem faz acontecer."]} size={80} />
      <A d={250}>
        <p className="mt-4 text-[28px] text-muted">Cinco pessoas que se completam. Um MVP construído do zero.</p>
      </A>
      <div className="mt-16 grid grid-cols-5 gap-6">
        {TEAM.map((m, i) => (
          <A key={m.id} v="pop" d={500 + i * 180} className="card flex flex-col items-center px-5 pt-9 pb-8 text-center">
            <div
              className="grid h-[132px] w-[132px] place-items-center rounded-full text-[60px] font-black text-white shadow-lift"
              style={{ background: m.cor }}
            >
              {m.nome[0]}
            </div>
            <div className="mt-6 text-[34px] font-black">{m.nome}</div>
            <div className="mt-1 rounded-full px-4 py-1 text-[18px] font-extrabold" style={{ background: `${m.cor}1F`, color: m.cor }}>
              {m.papel}
            </div>
            <div className="mt-4 text-[19px] leading-snug text-muted">{m.area}</div>
          </A>
        ))}
      </div>
    </Frame>
  );
}

/* ───────────────────────── 11. pedido ───────────────────────── */

const FUNDS = [
  { t: "Comercial: trazer lojistas", p: 40, c: "#FF6B35" },
  { t: "Marketing para tutores", p: 25, c: "#127475" },
  { t: "Produto: iOS e pagamentos reais", p: 25, c: "#5468D4" },
  { t: "Operação e LGPD", p: 10, c: "#E0A100" },
];

const MILESTONES = [
  { quando: "3 meses", t: "Lançamento oficial: app iOS, pagamentos reais e 100 lojas parceiras" },
  { quando: "6 meses", t: "400 lojas pagantes e 5 mil tutores ativos em Porto Alegre" },
  { quando: "12 meses", t: "1.000 lojas, R$ 1 mi/ano de receita recorrente e Grande Porto Alegre" },
];

function Pedido() {
  return (
    <Frame dark blob="none">
      <div className="flex gap-16">
        <div className="w-[640px] shrink-0">
          <A>
            <Tag dark>O pedido</Tag>
          </A>
          <A v="pop" d={250}>
            <div className="mt-8 text-[150px] leading-[0.95] font-black tracking-[-0.05em]">
              R$ <CountUp to={300} delay={400} duration={1300} />
              <span className="text-[90px]"> mil</span>
            </div>
          </A>
          <A d={1300}>
            <div className="mt-4 text-[84px] leading-none font-black text-primary">por 10%</div>
          </A>
          <A d={1700}>
            <div className="mt-6 text-[26px] text-white/60">do EasyPet · valuation de R$ 3 milhões</div>
          </A>
        </div>
        <div className="flex-1 pt-6">
          <A d={600} className="text-[20px] font-extrabold tracking-[0.2em] text-white/50">
            USO DOS RECURSOS
          </A>
          <div className="mt-5 space-y-5">
            {FUNDS.map((f, i) => (
              <A key={f.t} d={700 + i * 150}>
                <div className="flex items-baseline justify-between text-[24px] font-bold">
                  <span>{f.t}</span>
                  <span className="text-[30px] font-black" style={{ color: f.c }}>
                    {f.p}%
                  </span>
                </div>
                <div className="mt-2 h-4 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="pt-grow-x h-full rounded-full"
                    style={{ width: `${f.p * 2.5}%`, background: f.c, animationDelay: `${900 + i * 150}ms` }}
                  />
                </div>
              </A>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-6">
        {MILESTONES.map((m, i) => (
          <A key={m.quando} d={2000 + i * 200} className="rounded-3xl bg-white/[0.07] p-6">
            <div className="text-[18px] font-extrabold tracking-[0.15em] text-accent uppercase">{m.quando}</div>
            <div className="mt-2 text-[24px] leading-snug font-bold">{m.t}</div>
          </A>
        ))}
      </div>
    </Frame>
  );
}

/* ───────────────────────── 12. fechamento ───────────────────────── */

function Fechamento({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (cancelled) return;
      const colors = ["#FF6B35", "#127475", "#FFC857", "#E85D9A", "#2B7FFF"];
      confetti({ particleCount: 140, spread: 80, origin: { x: 0.2, y: 0.7 }, colors });
      confetti({ particleCount: 140, spread: 80, origin: { x: 0.8, y: 0.7 }, colors });
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active]);

  return (
    <Frame blob="orange">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <A v="pop" className="relative">
          <span className="pt-ping absolute inset-[30%] rounded-full bg-primary/40" />
          <div className="pt-float relative">
            <LogoMark className="h-[200px] w-[200px] drop-shadow-[0_18px_24px_rgba(255,107,53,0.35)]" />
          </div>
        </A>
        <div className="mt-8">
          <Title lines={["Cada pet merece o cuidado certo.", "Perto de casa."]} d={300} size={86} accentLast />
        </div>
        <A v="pop" d={1100}>
          <div className="pt-glow mt-12 rounded-full bg-ink px-12 py-5 text-[34px] font-black text-white">
            Tubarões, quem vem com a gente?
          </div>
        </A>
        <A v="fade" d={1500} className="mt-10 flex gap-6 text-[22px] font-bold text-muted">
          {TEAM.map((m) => (
            <span key={m.id} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: m.cor }} />
              {m.nome}
            </span>
          ))}
        </A>
      </div>
    </Frame>
  );
}

/* ───────────────────────── registro ───────────────────────── */

export const SLIDE_VIEWS: Record<SlideId, (props: { active: boolean }) => ReactNode> = {
  capa: Capa,
  gancho: Gancho,
  problema: Problema,
  solucao: Solucao,
  produto: Produto,
  mercado: Mercado,
  modelo: Modelo,
  tracao: Tracao,
  proposito: Proposito,
  equipe: Equipe,
  pedido: Pedido,
  fechamento: Fechamento,
};
