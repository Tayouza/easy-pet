"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Palco lógico dos slides: tudo é desenhado em 1600×900 e escalado para caber no container. */
export const STAGE_W = 1600;
export const STAGE_H = 900;

export function Fit({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

type Motion = "rise" | "pop" | "drop" | "fade" | "slide-left";

/** Elemento com animação de entrada (classes de pitch.css) e atraso em ms. */
export function A({
  v = "rise",
  d = 0,
  className,
  style,
  children,
}: {
  v?: Motion;
  d?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className={cn(`pt-${v}`, className)} style={{ animationDelay: `${d}ms`, ...style }}>
      {children}
    </div>
  );
}

/** Conta de 0 até `to` (easing de saída) depois de `delay` ms. */
export function useCountUp(to: number, { duration = 1600, delay = 0 } = {}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setValue(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => (frame = requestAnimationFrame(step)), delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [to, duration, delay]);
  return value;
}

export function CountUp({
  to,
  decimals = 0,
  delay = 0,
  duration,
}: {
  to: number;
  decimals?: number;
  delay?: number;
  duration?: number;
}) {
  const value = useCountUp(to, { delay, duration });
  return (
    <span className="tabular-nums">
      {value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}

/** Texto que se digita sozinho, como numa busca. */
export function Typed({ text, delay = 0, speed = 55 }: { text: string; delay?: number; speed?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) clearInterval(interval);
          return Math.min(c + 1, text.length);
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [text, delay, speed]);
  return <span className="pt-caret">{text.slice(0, count)}</span>;
}

/** Pin de mapa no formato da marca, com o ícone da categoria. */
export function Pin({ color, icon: Icon, size = 52 }: { color: string; icon: LucideIcon; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size * 1.2 }}>
      <svg viewBox="0 0 40 48" className="absolute inset-0 h-full w-full drop-shadow-[0_6px_6px_rgba(30,27,24,0.3)]">
        <path d="M20 0C9 0 0 8.6 0 19.3 0 33.7 20 48 20 48s20-14.3 20-28.7C40 8.6 31 0 20 0Z" fill={color} />
        <circle cx="20" cy="19" r="12.5" fill="white" />
      </svg>
      <Icon
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: size * 0.265, width: size * 0.42, height: size * 0.42, color }}
        strokeWidth={2.4}
      />
    </div>
  );
}

/** Moldura de celular para as telas ilustrativas. */
export function Phone({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={cn("rounded-[46px] bg-ink p-[10px] shadow-[0_40px_80px_rgba(30,27,24,0.28)]", className)}>
      <div className={cn("relative h-full w-full overflow-hidden rounded-[36px]", dark ? "bg-[#12100E]" : "bg-bg")}>
        <div className="absolute top-3 left-1/2 z-10 h-[22px] w-[96px] -translate-x-1/2 rounded-full bg-ink" />
        {children}
      </div>
    </div>
  );
}

export function Tag({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2 text-[18px] font-extrabold tracking-[0.18em] uppercase",
        dark ? "bg-white/10 text-accent" : "bg-secondary text-white",
      )}
    >
      {children}
    </span>
  );
}
