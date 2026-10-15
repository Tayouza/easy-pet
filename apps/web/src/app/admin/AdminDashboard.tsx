"use client";

import { ArrowRight, Crown, Hourglass, Store as StoreIcon, TrendingUp, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { CHART, HBarChart, Legend, RevenueChart } from "@/components/dashboard/charts";
import { PageHeader, StatCard } from "@/components/dashboard/Shell";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { AdminStats } from "@/lib/types";
import { formatPrice } from "@/shared";

// Cor por plano (identidade do plano, não ranking) — trio validado.
const PLAN_COLORS: Record<string, string> = { Básico: CHART.b, Profissional: CHART.a, Destaque: CHART.c };

export function AdminDashboard() {
  const { data: s, error, initialLoading, reload } = useQuery(async () => unwrap(await supabaseBrowser().rpc("admin_stats")) as unknown as AdminStats, ["admin-stats"]);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  const mrr = s ? s.mrr_lojas + s.mrr_premium : 0;
  return (
    <>
      <PageHeader title="Visão geral" subtitle="Indicadores do EasyPet em tempo real." />

      {initialLoading || !s ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          {s.lojas_pendentes > 0 && (
            <Link href="/admin/lojas?status=pendente" className="mb-6 flex items-center gap-4 rounded-card border border-accent bg-accent-50 p-4 transition hover:shadow-soft">
              <Hourglass className="size-6 shrink-0 text-[#b07800]" />
              <span className="flex-1 font-bold">
                {s.lojas_pendentes} {s.lojas_pendentes === 1 ? "loja aguardando" : "lojas aguardando"} aprovação
              </span>
              <span className="flex items-center gap-1 font-extrabold text-[#8a5d00]">
                Revisar <ArrowRight className="size-4" />
              </span>
            </Link>
          )}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Lojas ativas" value={s.lojas_ativas} icon={StoreIcon} tone="primary" />
            <StatCard label="Pendentes" value={s.lojas_pendentes} icon={Hourglass} tone="accent" />
            <StatCard label="Clientes" value={s.clientes} icon={Users} tone="secondary" hint={`+ ${s.lojistas} lojistas`} />
            <StatCard label="Premium ativos" value={s.premium} icon={Crown} tone="accent" hint={s.clientes ? `${Math.round((s.premium / s.clientes) * 100)}% dos clientes` : undefined} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="card bg-ink p-6 text-white md:col-span-1">
              <div className="flex items-center gap-2 text-sm font-bold text-white/70">
                <Wallet className="size-4" /> MRR total
              </div>
              <div className="mt-2 text-3xl font-black tabular-nums sm:text-4xl">{formatPrice(mrr)}</div>
              <div className="mt-1 text-sm text-white/60">receita recorrente mensal</div>
            </div>
            <StatCard label="MRR lojas" value={formatPrice(s.mrr_lojas)} icon={TrendingUp} tone="primary" hint="assinaturas de lojas ativas" />
            <StatCard label="MRR Premium" value={formatPrice(s.mrr_premium)} icon={Crown} tone="secondary" hint={`${s.premium} × ${formatPrice(990)}`} />
          </div>

          <div className="card mt-6 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-extrabold">Receita mensal (últimos 6 meses)</h2>
              <Legend
                items={[
                  { label: "Assinaturas de lojas", color: CHART.a },
                  { label: "Premium", color: CHART.b },
                ]}
              />
            </div>
            <RevenueChart data={s.receita_mensal} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="card p-6">
              <h2 className="mb-4 font-extrabold">Lojas ativas por categoria</h2>
              <HBarChart data={s.lojas_por_categoria.map((c) => ({ label: c.categoria, total: c.total, cor: c.cor }))} />
            </div>
            <div className="card p-6">
              <h2 className="mb-4 font-extrabold">Assinaturas ativas por plano</h2>
              <HBarChart data={s.assinaturas_por_plano.map((p) => ({ label: p.plano, total: p.total, cor: PLAN_COLORS[p.plano] }))} />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {s.assinaturas_por_plano.map((p) => (
                  <div key={p.plano} className="rounded-xl bg-bg p-3">
                    <div className="text-2xl font-black">{p.total}</div>
                    <div className="text-xs font-bold text-muted">{p.plano}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
