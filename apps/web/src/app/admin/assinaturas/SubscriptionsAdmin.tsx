"use client";

import { Crown, CreditCard, Receipt, Store as StoreIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader, StatCard } from "@/components/dashboard/Shell";
import { CategoryChip, StoreLogo } from "@/components/store/StoreVisuals";
import { Badge, PremiumBadge } from "@/components/ui/Badges";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Payment, Profile, Subscription } from "@/lib/types";
import { formatDate, formatPrice } from "@/shared";

type SubRow = Subscription & { store: { id: string; nome: string; categoria_id: string; logo_url: string | null } | null; plan: { nome: string } | null };
type PayRow = Payment & { user: { nome: string; email: string } | null; store: { nome: string } | null };

const METODO: Record<string, string> = { pix: "Pix", cartao: "Cartão", boleto: "Boleto" };

export function SubscriptionsAdmin() {
  const [tab, setTab] = useState<"lojas" | "premium" | "pagamentos">("lojas");
  const { data, error, initialLoading, reload } = useQuery(async () => {
    const sb = supabaseBrowser();
    const [subs, premium, pays] = await Promise.all([
      sb.from("subscriptions").select("*, store:stores(id,nome,categoria_id,logo_url), plan:store_plans(nome)").eq("status", "ativa").order("inicio", { ascending: false }),
      sb.from("profiles").select("*").eq("plano", "premium").order("premium_desde", { ascending: false }),
      sb.from("payments").select("*, user:profiles(nome,email), store:stores(nome)").order("created_at", { ascending: false }).limit(100),
    ]);
    const now = Date.now();
    return {
      subs: unwrap(subs) as unknown as SubRow[],
      premium: (unwrap(premium) as Profile[]).filter((p) => !p.premium_ate || new Date(p.premium_ate).getTime() > now),
      pays: unwrap(pays) as unknown as PayRow[],
    };
  }, ["admin-subs"]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  const mrrLojas = data?.subs.reduce((s, x) => s + x.valor_centavos, 0) ?? 0;
  const mrrPremium = (data?.premium.length ?? 0) * 990;
  const totalPays = data?.pays.reduce((s, p) => s + p.valor_centavos, 0) ?? 0;

  return (
    <>
      <PageHeader title="Assinaturas" subtitle="Planos de lojas, assinantes Premium e pagamentos recebidos." />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Lojas assinantes" value={data ? data.subs.length : "—"} icon={StoreIcon} tone="primary" hint={`MRR ${formatPrice(mrrLojas)}`} />
        <StatCard label="Clientes Premium" value={data ? data.premium.length : "—"} icon={Crown} tone="accent" hint={`MRR ${formatPrice(mrrPremium)}`} />
        <StatCard label="MRR total" value={formatPrice(mrrLojas + mrrPremium)} icon={Wallet} tone="success" />
        <StatCard label="Últimos pagamentos" value={formatPrice(totalPays)} icon={Receipt} tone="secondary" hint={`${data?.pays.length ?? 0} transações recentes`} />
      </div>

      <div className="no-scrollbar mb-4 flex max-w-full overflow-x-auto"><div className="inline-flex shrink-0 rounded-full border border-line bg-surface p-1">
        {(
          [
            ["lojas", "Planos de lojas", StoreIcon],
            ["premium", "Premium", Crown],
            ["pagamentos", "Pagamentos", CreditCard],
          ] as const
        ).map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-bold", tab === k ? "bg-ink text-white" : "text-muted hover:text-ink")}>
            <Icon className="size-4" /> {l}
          </button>
        ))}
      </div></div>

      <div className="card overflow-hidden">
        {initialLoading || !data ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {tab === "lojas" && (
              <Table head={["Loja", "Categoria", "Plano", "Valor", "Desde"]}>
                {data.subs.map((s) => (
                  <tr key={s.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3 font-extrabold">
                      {s.store ? (
                        <Link href={`/loja/${s.store.id}`} className="flex items-center gap-3 hover:text-primary-600">
                          <StoreLogo url={s.store.logo_url} nome={s.store.nome} categoriaId={s.store.categoria_id} className="size-9 border-2 text-xs" />
                          {s.store.nome}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">{s.store && <CategoryChip id={s.store.categoria_id} className="!py-0.5 text-[11px]" />}</td>
                    <td className="px-4 py-3">
                      <Badge tone={s.plan_id === "destaque" ? "accent" : s.plan_id === "profissional" ? "primary" : "secondary"}>{s.plan?.nome ?? s.plan_id}</Badge>
                    </td>
                    <td className="px-4 py-3 font-extrabold tabular-nums">{formatPrice(s.valor_centavos)}/mês</td>
                    <td className="px-4 py-3">{formatDate(s.inicio)}</td>
                  </tr>
                ))}
              </Table>
            )}
            {tab === "premium" && (
              <Table head={["Cliente", "E-mail", "Plano", "Desde", "Renova em"]}>
                {data.premium.map((p) => (
                  <tr key={p.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3 font-extrabold">{p.nome}</td>
                    <td className="px-4 py-3 text-muted">{p.email}</td>
                    <td className="px-4 py-3">
                      <PremiumBadge small />
                    </td>
                    <td className="px-4 py-3">{formatDate(p.premium_desde)}</td>
                    <td className="px-4 py-3">{p.premium_ate ? formatDate(p.premium_ate) : "—"}</td>
                  </tr>
                ))}
              </Table>
            )}
            {tab === "pagamentos" && (
              <Table head={["Data", "Pagador", "Tipo", "Método", "Valor", "Status"]}>
                {data.pays.map((p) => (
                  <tr key={p.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="font-extrabold">{p.user?.nome ?? "—"}</div>
                      <div className="text-xs text-muted">{p.store?.nome ?? p.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">{p.tipo === "premium_cliente" ? <Badge tone="accent">Premium</Badge> : <Badge tone="primary">Plano {p.plan_id}</Badge>}</td>
                    <td className="px-4 py-3">{METODO[p.metodo]}</td>
                    <td className="px-4 py-3 font-extrabold tabular-nums">{formatPrice(p.valor_centavos)}</td>
                    <td className="px-4 py-3">
                      <Badge tone="success">{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full min-w-[720px] text-sm">
      <thead className="bg-bg text-left text-xs uppercase tracking-wide text-muted">
        <tr>
          {head.map((h) => (
            <th key={h} className="px-4 py-3">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">{children}</tbody>
    </table>
  );
}
