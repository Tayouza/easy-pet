"use client";

import { Crown, List, LocateFixed, Lock, Map as MapIcon, MapPinOff, Search, SlidersHorizontal, Star, Timer, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { StoresMap } from "@/components/map";
import { StoreRow, StoreRowSkeleton } from "@/components/store/StoreCard";
import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useDebounced, useGeolocation, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { StoreCardData } from "@/lib/types";
import { CATEGORIES, categoryMeta, DEFAULT_LOCATION, DEFAULT_RADIUS_M, getOpenStatus, MAX_RADIUS_M, MIN_RADIUS_M, type Horarios } from "@/shared";

const SPONSOR_EVERY = 4;

export function Explorer() {
  const params = useSearchParams();
  const { isPremium, loading: authLoading } = useAuth();
  const geo = useGeolocation();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [categoria, setCategoria] = useState<string | null>(params.get("categoria"));
  const [raio, setRaio] = useState(DEFAULT_RADIUS_M);
  const [abertoAgora, setAbertoAgora] = useState(false);
  const [melhores, setMelhores] = useState(false);
  const [view, setView] = useState<"lista" | "mapa">("lista");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lockedOpen, setLockedOpen] = useState(false);
  const busca = useDebounced(q.trim(), 350);
  const raioDebounced = useDebounced(raio, 250);

  const { data, error, loading, initialLoading, reload } = useQuery(
    async () =>
      unwrap(
        await supabaseBrowser().rpc("nearby_stores", {
          p_lat: geo.pos.lat,
          p_lng: geo.pos.lng,
          p_raio_m: raioDebounced,
          p_categoria: categoria ?? undefined,
          p_busca: busca || undefined,
        }),
      ) as StoreCardData[],
    [geo.pos.lat, geo.pos.lng, raioDebounced, categoria, busca],
    geo.status !== "pending",
  );

  // Lojas do plano Destaque usadas como "Patrocinado" para quem é free.
  const showAds = !authLoading && !isPremium;
  const { data: sponsors } = useQuery(
    async () =>
      unwrap(
        await supabaseBrowser()
          .from("stores")
          .select("id,nome,categoria_id,endereco,bairro,aberto_24h,horarios,logo_url,capa_url,destaque,nota_media,total_avaliacoes,lat,lng,tags")
          .eq("status", "ativa")
          .eq("destaque", true)
          .limit(12),
      ) as StoreCardData[],
    ["sponsors"],
    showAds,
  );

  const stores = useMemo(() => {
    let list = data ?? [];
    if (isPremium && abertoAgora) {
      const now = new Date();
      list = list.filter((s) => getOpenStatus(s.horarios as Horarios, s.aberto_24h, now).aberto);
    }
    if (isPremium && melhores) {
      list = [...list].sort((a, b) => Number(b.nota_media) - Number(a.nota_media) || b.total_avaliacoes - a.total_avaliacoes);
    }
    return list;
  }, [data, isPremium, abertoAgora, melhores]);

  const feed = useMemo(() => {
    const out: { store: StoreCardData; sponsored: boolean; key: string }[] = [];
    const pool = showAds ? (sponsors ?? []) : [];
    let ad = 0;
    stores.forEach((s, i) => {
      out.push({ store: s, sponsored: false, key: s.id });
      if (pool.length && (i + 1) % SPONSOR_EVERY === 0) {
        const sp = pool[ad++ % pool.length];
        if (sp.id !== s.id && sp.id !== stores[i + 1]?.id) out.push({ store: sp, sponsored: true, key: `ad-${i}-${sp.id}` });
      }
    });
    return out;
  }, [stores, sponsors, showAds]);

  const toggleAdvanced = (which: "aberto" | "melhores") => {
    if (!isPremium) return setLockedOpen(true);
    if (which === "aberto") setAbertoAgora((v) => !v);
    else setMelhores((v) => !v);
  };

  const geoNote =
    geo.status === "pending"
      ? "Buscando sua localização…"
      : geo.status === "ok"
        ? "Perto de você"
        : geo.status === "far"
          ? `Você está fora de POA — mostrando a partir da ${DEFAULT_LOCATION.label}`
          : `Mostrando a partir da ${DEFAULT_LOCATION.label}`;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Filtros */}
      <div className="z-[400] border-b border-line bg-surface/95 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-2 px-4 pt-3 sm:px-6 lg:flex-row lg:items-center lg:gap-2.5">
          <div className="relative min-w-0 lg:flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar ração, banho, vacina, bairro…"
              className="input !rounded-full !pl-11 !pr-10"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-ink/5" aria-label="Limpar">
                <X className="size-4" />
              </button>
            )}
          </div>
          {/* No mobile vira uma linha rolável */}
          <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
            <div className="flex h-10 shrink-0 items-center gap-3 rounded-full border border-line bg-bg px-4">
              <span className="whitespace-nowrap text-sm font-bold">
                Raio <span className="text-secondary">{(raio / 1000).toFixed(0)} km</span>
              </span>
              <input type="range" min={MIN_RADIUS_M} max={MAX_RADIUS_M} step={1000} value={raio} onChange={(e) => setRaio(Number(e.target.value))} className="w-24 sm:w-36" aria-label="Raio de busca" />
            </div>
            <AdvancedButton active={isPremium && abertoAgora} locked={!isPremium} onClick={() => toggleAdvanced("aberto")} icon={Timer} label="Aberto agora" />
            <AdvancedButton active={isPremium && melhores} locked={!isPremium} onClick={() => toggleAdvanced("melhores")} icon={Star} label="Melhor avaliadas" />
            <button
              onClick={geo.locate}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm font-bold text-secondary transition hover:bg-secondary-50"
              title="Usar minha localização"
              aria-label="Usar minha localização"
            >
              <LocateFixed className="size-4" /> <span className="hidden xl:inline">Minha localização</span>
            </button>
          </div>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 pt-2 sm:px-6 lg:pt-3">
          <Chip active={!categoria} onClick={() => setCategoria(null)}>
            <SlidersHorizontal className="size-4" /> Todas
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} active={categoria === c.id} color={c.cor} onClick={() => setCategoria(categoria === c.id ? null : c.id)}>
              <CategoryIcon id={c.id} className="size-4" /> {c.nome}
            </Chip>
          ))}
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Lista */}
        <aside className={cn("w-full overflow-y-auto bg-bg lg:w-[480px] lg:shrink-0 lg:border-r lg:border-line", view === "mapa" && "hidden lg:block")}>
          <div className="space-y-3 p-4 pb-24 sm:p-5 lg:pb-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold">
                  {initialLoading ? "Procurando lugares…" : `${stores.length} ${stores.length === 1 ? "lugar" : "lugares"} ${categoria ? `de ${categoryMeta(categoria).nome}` : ""}`}
                </h1>
                <p className="text-sm leading-snug text-muted">
                  {geoNote} · até {raio / 1000} km
                </p>
              </div>
              {loading && !initialLoading && <span className="text-xs font-bold text-muted">Atualizando…</span>}
            </div>

            {!isPremium && !authLoading && (
              <div className="flex items-center gap-3 rounded-card border border-accent/60 bg-accent-50 p-3 text-sm">
                <Crown className="size-5 shrink-0 text-[#c58a00]" />
                <span className="flex-1">
                  <b>Premium</b>: sem anúncios, filtros avançados e cupons exclusivos.
                </span>
                <ButtonLink href="/premium" variant="premium" size="sm">
                  Ver
                </ButtonLink>
              </div>
            )}

            {error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : initialLoading || geo.status === "pending" ? (
              Array.from({ length: 5 }).map((_, i) => <StoreRowSkeleton key={i} />)
            ) : feed.length === 0 ? (
              <EmptyState
                icon={MapPinOff}
                title="Nenhum lugar encontrado"
                description="Tente aumentar o raio, trocar a categoria ou buscar outro termo."
                action={
                  <button
                    onClick={() => {
                      setQ("");
                      setCategoria(null);
                      setRaio(MAX_RADIUS_M);
                      setAbertoAgora(false);
                    }}
                    className="font-bold text-secondary hover:underline"
                  >
                    Limpar filtros
                  </button>
                }
              />
            ) : (
              feed.map((f) => <StoreRow key={f.key} store={f.store} sponsored={f.sponsored} active={!f.sponsored && activeId === f.store.id} onHover={setActiveId} />)
            )}
          </div>
        </aside>

        {/* Mapa */}
        <div className={cn("relative isolate flex-1", view === "lista" && "hidden lg:block")}>
          <StoresMap stores={stores} center={geo.pos} me={geo.status === "ok" ? geo.pos : null} radiusM={raio} fitRadius activeId={activeId} onSelect={setActiveId} />
          <MapLegend />
        </div>

        {/* Alternar no mobile */}
        <button
          onClick={() => setView((v) => (v === "lista" ? "mapa" : "lista"))}
          className="fixed bottom-8 left-1/2 z-[450] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 font-bold text-white shadow-lift lg:hidden"
        >
          {view === "lista" ? (
            <>
              <MapIcon className="size-5" /> Ver mapa
            </>
          ) : (
            <>
              <List className="size-5" /> Ver lista
            </>
          )}
        </button>
      </div>

      <Modal open={lockedOpen} onClose={() => setLockedOpen(false)} size="sm">
        <div className="text-center">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-accent-50 text-[#c58a00]">
            <Crown className="size-8" />
          </div>
          <h2 className="text-xl font-extrabold">Filtros avançados são Premium</h2>
          <p className="mt-2 text-muted">Encontre quem está aberto agora e as lojas mais bem avaliadas da cidade por apenas R$ 9,90/mês.</p>
          <div className="mt-6 flex flex-col gap-2">
            <ButtonLink href="/premium" variant="premium">
              Conhecer o Premium
            </ButtonLink>
            <button onClick={() => setLockedOpen(false)} className="py-2 text-sm font-bold text-muted hover:text-ink">
              Agora não
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Chip({ active, color, onClick, children }: { active: boolean; color?: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-bold transition",
        active ? "border-transparent text-white shadow-soft" : "border-line bg-surface text-ink/80 hover:border-ink/20",
      )}
      style={active ? { background: color ?? "#127475" } : undefined}
    >
      {children}
    </button>
  );
}

function AdvancedButton({ active, locked, onClick, icon: Icon, label }: { active: boolean; locked: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-bold transition",
        active ? "border-secondary bg-secondary text-white" : "border-line bg-surface hover:border-secondary/40",
        locked && "text-muted",
      )}
    >
      <Icon className="size-4" />
      {label}
      {locked && <Lock className="size-3.5 text-[#c58a00]" />}
    </button>
  );
}

function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-[400] hidden rounded-2xl bg-surface/95 px-3.5 py-2.5 text-xs font-semibold shadow-lift backdrop-blur xl:block">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#2b7fff] ring-4 ring-[#2b7fff]/20" /> Você
        </span>
        <span className="flex items-center gap-1.5">
          <span className="grid size-4 place-items-center rounded-full bg-accent text-[9px]">★</span> Loja destaque
        </span>
        <span className="text-muted">Cores = categorias</span>
      </div>
    </div>
  );
}
