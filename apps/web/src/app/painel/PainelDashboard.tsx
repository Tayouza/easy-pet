"use client";

import { Camera, Check, Clock, Eye, Heart, Lock, MapPinned, MessageCircle, Package, Store as StoreIcon, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActivityChart, CHART, Legend } from "@/components/dashboard/charts";
import { PageHeader, StatCard } from "@/components/dashboard/Shell";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { StoreStats } from "@/lib/types";
import { usePainel } from "./PainelContext";
import { StoreStatusBanner } from "./StoreStatusBanner";

export function PainelDashboard() {
  const { store, plan } = usePainel();
  const [dias, setDias] = useState(30);
  const canStats = !!plan?.estatisticas;
  const { data: stats, error, initialLoading, reload } = useQuery(
    async () => unwrap(await supabaseBrowser().rpc("store_stats", { p_store_id: store!.id, p_dias: dias })) as unknown as StoreStats,
    [store?.id, dias],
    !!store && canStats,
  );
  const { data: itemCount } = useQuery(
    async () => (await supabaseBrowser().from("store_items").select("id", { count: "exact", head: true }).eq("store_id", store!.id)).count ?? 0,
    [store?.id],
    !!store,
  );

  if (!store)
    return (
      <>
        <PageHeader title="Bem-vindo ao EasyPet! 👋" subtitle="Vamos colocar sua loja no mapa." />
        <EmptyState
          icon={StoreIcon}
          title="Cadastre sua loja"
          description="Preencha os dados, horários e a localização. Depois de aprovada, sua loja aparece para tutores de toda Porto Alegre."
          action={<ButtonLink href="/painel/loja">Cadastrar minha loja</ButtonLink>}
        />
      </>
    );

  const horariosOk = store.aberto_24h || Object.values((store.horarios ?? {}) as Record<string, unknown[]>).some((v) => v?.length);
  const checklist = [
    { ok: !!store.logo_url && !!store.capa_url, label: "Logo e foto de capa", href: "/painel/loja", icon: Camera },
    { ok: horariosOk, label: "Horários de funcionamento", href: "/painel/loja", icon: Clock },
    { ok: !!store.whatsapp, label: "WhatsApp para contato", href: "/painel/loja", icon: MessageCircle },
    { ok: (itemCount ?? 0) > 0, label: "Produtos e serviços", href: "/painel/itens", icon: Package },
  ];
  const done = checklist.filter((c) => c.ok).length;

  return (
    <>
      <PageHeader title={store.nome} subtitle="Acompanhe o desempenho da sua loja no EasyPet." />
      <StoreStatusBanner store={store} plan={plan} />

      <div className="mt-8">
        {!canStats ? (
          <LockedStats />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">Desempenho</h2>
              <div className="inline-flex rounded-full border border-line bg-surface p-1">
                {[7, 30, 90].map((d) => (
                  <button key={d} onClick={() => setDias(d)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-bold", dias === d ? "bg-ink text-white" : "text-muted hover:text-ink")}>
                    {d} dias
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {initialLoading || !stats ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
              ) : (
                <>
                  <StatCard label="Visualizações" value={stats.views} icon={Eye} tone="primary" hint={`nos últimos ${dias} dias`} />
                  <StatCard label="Cliques no WhatsApp" value={stats.whatsapp} icon={MessageCircle} tone="success" hint={`+ ${stats.telefone} ligações`} />
                  <StatCard label="Rotas traçadas" value={stats.rota} icon={MapPinned} tone="secondary" />
                  <StatCard label="Favoritos" value={stats.favoritos} icon={Heart} tone="accent" hint="tutores salvaram sua loja" />
                </>
              )}
            </div>
            <div className="card mt-4 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-extrabold">Visualizações e contatos por dia</h3>
                <Legend
                  items={[
                    { label: "Visualizações", color: CHART.a },
                    { label: "Contatos (WhatsApp, ligação, rota)", color: CHART.b },
                  ]}
                />
              </div>
              {stats ? <ActivityChart data={stats.serie} /> : <Skeleton className="h-[280px]" />}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Perfil completo</h3>
            <span className="text-sm font-bold text-muted">
              {done}/{checklist.length}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(done / checklist.length) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-2">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-bg">
                  <span className={cn("grid size-7 place-items-center rounded-full", c.ok ? "bg-success text-white" : "bg-line text-muted")}>{c.ok ? <Check className="size-4" /> : <c.icon className="size-4" />}</span>
                  <span className={cn("font-semibold", c.ok && "text-muted line-through")}>{c.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-extrabold">Atalhos</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { href: "/painel/loja", label: "Editar loja", icon: StoreIcon },
              { href: "/painel/itens", label: "Produtos e serviços", icon: Package },
              { href: "/painel/cupons", label: "Criar cupom", icon: Ticket },
              { href: `/loja/${store.id}`, label: "Página pública", icon: Eye },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="flex flex-col gap-2 rounded-2xl border border-line p-4 font-bold transition hover:border-primary/40 hover:bg-primary-50">
                <a.icon className="size-5 text-primary" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function LockedStats() {
  return (
    <div className="relative overflow-hidden rounded-card">
      <div className="pointer-events-none select-none blur-[5px]" aria-hidden>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {["Visualizações", "WhatsApp", "Rotas", "Favoritos"].map((l) => (
            <div key={l} className="card h-32 p-5">
              <div className="text-sm font-bold text-muted">{l}</div>
              <div className="mt-3 h-8 w-16 rounded-lg bg-line" />
            </div>
          ))}
        </div>
        <div className="card mt-4 h-72" />
      </div>
      <div className="absolute inset-0 grid place-items-center bg-bg/40">
        <div className="max-w-sm rounded-3xl bg-surface p-7 text-center shadow-lift">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary-50 text-primary">
            <Lock className="size-7" />
          </div>
          <h3 className="mt-4 text-xl font-extrabold">Estatísticas no plano Profissional</h3>
          <p className="mt-2 text-sm text-muted">Veja quantas pessoas visitaram sua loja, chamaram no WhatsApp e traçaram rota até você.</p>
          <ButtonLink href="/painel/plano" className="mt-5">
            Fazer upgrade
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
