"use client";

import { MapPin, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { Rating } from "@/components/ui/Badges";
import { cn } from "@/lib/cn";
import type { StoreCardData } from "@/lib/types";
import { formatDistance } from "@/shared";
import { CategoryChip, OpenStatus, StoreCover, StoreLogo } from "./StoreVisuals";

export function SponsoredTag({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-ink/75 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur", className)}>
      <Sparkles className="size-3 text-accent" /> Patrocinado
    </span>
  );
}

export function FeaturedTag({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-extrabold text-ink", className)}>
      <Star className="size-3 fill-ink" /> Destaque
    </span>
  );
}

/** Card vertical (grades). */
export function StoreCard({ store, sponsored, className }: { store: StoreCardData; sponsored?: boolean; className?: string }) {
  return (
    <Link
      href={`/loja/${store.id}`}
      className={cn("group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift", sponsored && "ring-2 ring-accent/70", className)}
    >
      <div className="relative h-32 overflow-hidden">
        <StoreCover url={store.capa_url} categoriaId={store.categoria_id} className="transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {sponsored ? <SponsoredTag /> : store.destaque && <FeaturedTag />}
        </div>
      </div>
      <div className="relative flex flex-1 flex-col px-4 pb-4 pt-8">
        <StoreLogo url={store.logo_url} nome={store.nome} categoriaId={store.categoria_id} className="absolute -top-7 left-4 size-14 text-lg" />
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[17px] font-extrabold leading-snug group-hover:text-primary-600">{store.nome}</h3>
          <Rating nota={store.nota_media} total={store.total_avaliacoes} className="shrink-0" />
        </div>
        <div className="mt-1.5">
          <CategoryChip id={store.categoria_id} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-sm text-muted">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{store.bairro || store.endereco}</span>
            {store.distancia_m != null && <span className="shrink-0 font-bold text-ink">· {formatDistance(store.distancia_m)}</span>}
          </span>
        </div>
        <div className="mt-2">
          <OpenStatus horarios={store.horarios} aberto24h={store.aberto_24h} short />
        </div>
      </div>
    </Link>
  );
}

/** Linha horizontal (lista ao lado do mapa). */
export function StoreRow({
  store,
  sponsored,
  active,
  onHover,
}: {
  store: StoreCardData;
  sponsored?: boolean;
  active?: boolean;
  onHover?: (id: string | null) => void;
}) {
  return (
    <Link
      href={`/loja/${store.id}`}
      onMouseEnter={() => onHover?.(store.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group flex gap-3 rounded-card border bg-surface p-3 transition hover:shadow-lift",
        active ? "border-primary shadow-lift" : "border-line shadow-soft",
        sponsored && "bg-gradient-to-r from-accent-50 to-surface",
      )}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
        <StoreCover url={store.capa_url} categoriaId={store.categoria_id} iconSize="size-9" />
        <StoreLogo url={store.logo_url} nome={store.nome} categoriaId={store.categoria_id} className="absolute bottom-1.5 left-1.5 size-9 border-2 text-[11px]" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          {sponsored ? <SponsoredTag className="bg-ink" /> : store.destaque && <FeaturedTag />}
        </div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-extrabold leading-snug group-hover:text-primary-600">{store.nome}</h3>
          <Rating nota={store.nota_media} total={store.total_avaliacoes} className="shrink-0 text-[13px]" />
        </div>
        <CategoryChip id={store.categoria_id} className="mt-1 self-start !px-2 !py-0.5 text-[11px]" />
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 text-xs text-muted">
          <OpenStatus horarios={store.horarios} aberto24h={store.aberto_24h} short />
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{store.bairro}</span>
            {store.distancia_m != null && <b className="shrink-0 text-ink">{formatDistance(store.distancia_m)}</b>}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-32 rounded-none" />
      <div className="space-y-2.5 p-4 pt-8">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}

export function StoreRowSkeleton() {
  return (
    <div className="flex gap-3 rounded-card border border-line bg-surface p-3">
      <div className="skeleton size-24 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}
