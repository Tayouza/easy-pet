"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { StoresMap } from "@/components/map";
import { StoreCard, StoreCardSkeleton } from "@/components/store/StoreCard";
import { CategoryChip, StoreLogo } from "@/components/store/StoreVisuals";
import { Rating } from "@/components/ui/Badges";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { StoreCardData } from "@/lib/types";
import { DEFAULT_LOCATION } from "@/shared";

const CARD_FIELDS = "id,nome,categoria_id,endereco,bairro,aberto_24h,horarios,logo_url,capa_url,destaque,nota_media,total_avaliacoes,lat,lng,tags";

function useNearCenter() {
  return useQuery(
    async () =>
      unwrap(await supabaseBrowser().rpc("nearby_stores", { p_lat: DEFAULT_LOCATION.lat, p_lng: DEFAULT_LOCATION.lng, p_raio_m: 6000 })) as StoreCardData[],
    ["landing-near"],
  );
}

export function HeroStats() {
  const { data } = useQuery(async () => {
    const sb = supabaseBrowser();
    const [{ count: lojas }, { count: categorias }, { count: avaliacoes }] = await Promise.all([
      sb.from("stores").select("id", { count: "exact", head: true }).eq("status", "ativa"),
      sb.from("categories").select("id", { count: "exact", head: true }),
      sb.from("reviews").select("id", { count: "exact", head: true }),
    ]);
    return { lojas: lojas ?? 0, categorias: categorias ?? 0, avaliacoes: avaliacoes ?? 0 };
  }, ["hero-stats"]);
  const items = [
    { v: data ? `${data.lojas}+` : "—", l: "lugares pet" },
    { v: data ? String(data.categorias) : "—", l: "categorias" },
    { v: data ? String(data.avaliacoes) : "—", l: "avaliações de tutores" },
  ];
  return (
    <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
      {items.map((i) => (
        <div key={i.l}>
          <div className="text-2xl font-black text-ink">{i.v}</div>
          <div className="text-sm font-semibold text-muted">{i.l}</div>
        </div>
      ))}
    </div>
  );
}

/** Cartões flutuantes do hero com lojas reais bem avaliadas. */
export function HeroCards() {
  const { data } = useQuery(
    async () =>
      unwrap(
        await supabaseBrowser().from("stores").select(CARD_FIELDS).eq("status", "ativa").order("destaque", { ascending: false }).order("nota_media", { ascending: false }).limit(3),
      ) as StoreCardData[],
    ["hero-cards"],
  );
  const pos = ["left-0 top-6 rotate-[-4deg]", "right-0 top-36 rotate-[3deg]", "left-10 bottom-0 rotate-[-1deg]"];
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-md">
      <div className="absolute inset-8 rounded-[48px] bg-gradient-to-br from-primary to-[#ff9a6b] opacity-90" />
      <div className="absolute inset-8 rounded-[48px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.35),transparent_45%)]" />
      {(data ?? [null, null, null]).slice(0, 3).map((s, i) => (
        <div key={s?.id ?? i} className={`absolute w-72 animate-pop-in rounded-3xl bg-surface p-4 shadow-lift ${pos[i]}`} style={{ animationDelay: `${i * 120}ms` }}>
          {s ? (
            <Link href={`/loja/${s.id}`} className="flex items-center gap-3">
              <StoreLogo url={s.logo_url} nome={s.nome} categoriaId={s.categoria_id} className="size-14 text-lg" />
              <div className="min-w-0">
                <div className="truncate font-extrabold">{s.nome}</div>
                <Rating nota={s.nota_media} total={s.total_avaliacoes} className="text-[13px]" />
                <div className="mt-1">
                  <CategoryChip id={s.categoria_id} className="!py-0.5 text-[11px]" />
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="skeleton size-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="absolute bottom-24 right-4 flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-lift">
        <MapPin className="size-4 text-primary" /> Porto Alegre
      </div>
    </div>
  );
}

export function MapPreview() {
  const { data } = useNearCenter();
  return (
    <div className="relative h-[440px] overflow-hidden rounded-[28px] border border-line shadow-lift">
      <StoresMap stores={data ?? []} center={DEFAULT_LOCATION} zoom={14} lockOnTouch />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex justify-center bg-gradient-to-t from-ink/40 to-transparent p-6">
        <Link href="/explorar" className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-extrabold text-white shadow-lift transition hover:bg-primary-600">
          Abrir o mapa completo <ArrowRight className="size-5" />
        </Link>
      </div>
    </div>
  );
}

export function FeaturedStores() {
  const { data, initialLoading } = useQuery(
    async () =>
      unwrap(
        await supabaseBrowser().from("stores").select(CARD_FIELDS).eq("status", "ativa").order("destaque", { ascending: false }).order("nota_media", { ascending: false }).limit(8),
      ) as StoreCardData[],
    ["featured"],
  );
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {initialLoading ? Array.from({ length: 4 }).map((_, i) => <StoreCardSkeleton key={i} />) : (data ?? []).slice(0, 8).map((s) => <StoreCard key={s.id} store={s} />)}
    </div>
  );
}
