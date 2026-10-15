"use client";

import { Check, Copy, Crown, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { categoryMeta, formatDate } from "@/shared";

export interface CouponView {
  id: string;
  titulo: string;
  descricao: string;
  desconto: string;
  validade: string | null;
  codigo: string | null;
  bloqueado: boolean;
  store_id?: string;
  store_nome?: string;
  categoria_id?: string;
}

export function CouponCard({ c, showStore }: { c: CouponView; showStore?: boolean }) {
  const [copied, setCopied] = useState(false);
  const cor = c.categoria_id ? categoryMeta(c.categoria_id).cor : "#FF6B35";
  const copy = async () => {
    if (!c.codigo) return;
    await navigator.clipboard.writeText(c.codigo).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="card relative flex overflow-hidden">
      <div className="relative flex w-28 shrink-0 flex-col items-center justify-center px-2 py-4 text-center text-white sm:w-32" style={{ background: `linear-gradient(160deg, ${cor}, ${cor}cc)` }}>
        <span className="text-xl font-black leading-tight sm:text-2xl">{c.desconto}</span>
        {/* recortes do ticket */}
        <span className="absolute -right-2.5 -top-2.5 size-5 rounded-full bg-bg" />
        <span className="absolute -bottom-2.5 -right-2.5 size-5 rounded-full bg-bg" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 border-l-2 border-dashed border-line p-4">
        {showStore && c.store_id && (
          <Link href={`/loja/${c.store_id}`} className="text-xs font-extrabold uppercase tracking-wide hover:underline" style={{ color: cor }}>
            {c.store_nome}
          </Link>
        )}
        <div className="font-extrabold leading-snug">{c.titulo}</div>
        {c.descricao && <p className="text-sm text-muted">{c.descricao}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-xs text-muted">{c.validade ? `Válido até ${formatDate(c.validade)}` : "Sem data de validade"}</span>
          {c.bloqueado ? (
            <Link href="/premium" className="group flex items-center gap-2 rounded-full border border-dashed border-accent bg-accent-50 py-1 pl-3 pr-1">
              <span className="select-none font-mono text-sm font-bold tracking-widest text-ink/40 blur-[3px]">EASYPET</span>
              <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-extrabold text-ink transition group-hover:brightness-105">
                <Lock className="size-3" /> Premium
              </span>
            </Link>
          ) : (
            <button onClick={copy} className={cn("flex items-center gap-2 rounded-full border border-dashed py-1 pl-3 pr-1 transition", copied ? "border-success bg-success-50" : "border-secondary/50 bg-secondary-50 hover:border-secondary")}>
              <span className="font-mono text-sm font-extrabold tracking-wider text-secondary">{c.codigo}</span>
              <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold text-white", copied ? "bg-success" : "bg-secondary")}>
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />} {copied ? "Copiado" : "Copiar"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PremiumCouponBanner() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-card border border-accent bg-gradient-to-r from-accent-50 to-surface p-4 sm:flex-row sm:items-center">
      <Crown className="size-6 shrink-0 text-[#c58a00]" />
      <div className="flex-1 text-sm">
        <b>Os códigos são exclusivos para assinantes Premium.</b> Desbloqueie todos os cupons por R$ 9,90/mês.
      </div>
      <Link href="/premium" className="rounded-full bg-gradient-to-r from-accent to-[#ffb020] px-4 py-2 text-sm font-extrabold text-ink">
        Desbloquear
      </Link>
    </div>
  );
}
