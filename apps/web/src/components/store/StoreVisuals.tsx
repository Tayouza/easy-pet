"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { categoryMeta, getOpenStatus, initials, type Horarios } from "@/shared";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

/** Capa da loja; sem imagem → gradiente da cor da categoria + ícone. */
export function StoreCover({ url, categoriaId, className, iconSize = "size-14" }: { url?: string | null; categoriaId: string; className?: string; iconSize?: string }) {
  const cor = categoryMeta(categoriaId).cor;
  if (url) return <img src={url} alt="" className={cn("h-full w-full object-cover", className)} loading="lazy" />;
  return (
    <div className={cn("relative grid h-full w-full place-items-center overflow-hidden", className)} style={{ background: `linear-gradient(135deg, ${cor} 0%, ${cor}cc 55%, ${cor}88 100%)` }}>
      <div className="absolute -right-6 -top-8 size-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-4 size-28 rounded-full bg-white/10" />
      <CategoryIcon id={categoriaId} className={cn("relative text-white/90", iconSize)} strokeWidth={1.6} />
    </div>
  );
}

/** Logo da loja; sem imagem → iniciais em círculo colorido. */
export function StoreLogo({ url, nome, categoriaId, className }: { url?: string | null; nome: string; categoriaId: string; className?: string }) {
  const cor = categoryMeta(categoriaId).cor;
  // Guarda qual URL falhou: se a loja trocar de logo, tenta de novo.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImg = !!url && failedUrl !== url;
  return (
    <div className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-white shadow-soft", className)}>
      {showImg ? (
        <img src={url} alt={nome} className="h-full w-full object-cover" loading="lazy" onError={() => setFailedUrl(url)} />
      ) : (
        <span className="grid h-full w-full place-items-center font-extrabold text-white" style={{ background: cor }}>
          {initials(nome) || nome.slice(0, 1)}
        </span>
      )}
    </div>
  );
}

export function CategoryChip({ id, className }: { id: string; className?: string }) {
  const c = categoryMeta(id);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", className)} style={{ background: `${c.cor}1a`, color: c.cor }}>
      <CategoryIcon id={id} className="size-3.5" /> {c.nome}
    </span>
  );
}

/** Atualiza a cada minuto (só no cliente) para "Aberto agora". */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function OpenStatus({ horarios, aberto24h, className, short }: { horarios: unknown; aberto24h: boolean; className?: string; short?: boolean }) {
  const now = useNow();
  if (!now) return <span className={cn("inline-block h-4 w-20 rounded bg-line/60", className)} />;
  const st = getOpenStatus(horarios as Horarios, aberto24h, now);
  const label = short ? (st.aberto ? (aberto24h ? "Aberto 24h" : "Aberto agora") : "Fechado") : st.label;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold", st.aberto ? "text-success" : "text-danger", className)}>
      <span className={cn("size-2 rounded-full", st.aberto ? "bg-success shadow-[0_0_0_3px_rgba(46,158,91,.18)]" : "bg-danger")} />
      {label}
    </span>
  );
}
