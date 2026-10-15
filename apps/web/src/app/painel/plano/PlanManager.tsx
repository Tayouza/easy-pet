"use client";

import { Crown, Receipt, Store as StoreIcon } from "lucide-react";
import { useState } from "react";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { PageHeader } from "@/components/dashboard/Shell";
import { PlansGrid, planFeatures } from "@/components/store/PlansGrid";
import { Badge } from "@/components/ui/Badges";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Payment, StorePlan } from "@/lib/types";
import { formatDate, formatPrice } from "@/shared";
import { usePainel } from "../PainelContext";

export const METODO_LABEL: Record<string, string> = { pix: "Pix", cartao: "Cartão", boleto: "Boleto" };

export function PlanManager() {
  const { store, plan, subscription, reload } = usePainel();
  const { toast, showError } = useFeedback();
  const [chosen, setChosen] = useState<StorePlan | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const { data: payments, initialLoading, reload: reloadPayments } = useQuery(
    async () =>
      unwrap(await supabaseBrowser().from("payments").select("*").eq("store_id", store!.id).eq("tipo", "assinatura_loja").order("created_at", { ascending: false }).limit(24)) as Payment[],
    [store?.id],
    !!store,
  );

  if (!store)
    return <EmptyState icon={StoreIcon} title="Cadastre sua loja primeiro" description="Com a loja cadastrada você escolhe o plano ideal." action={<ButtonLink href="/painel/loja">Cadastrar loja</ButtonLink>} />;

  const cancel = async () => {
    setCanceling(true);
    const { error } = await supabaseBrowser().rpc("cancelar_plano_loja", { p_store_id: store.id });
    setCanceling(false);
    if (error) return showError(error);
    setCancelOpen(false);
    toast("Plano cancelado.", "info");
    reload();
  };

  return (
    <>
      <PageHeader title="Plano e pagamentos" subtitle="Troque de plano quando quiser — a mudança vale na hora." />

      <div className={`card overflow-hidden ${plan?.destaque ? "border-accent" : ""}`}>
        <div className="flex flex-wrap items-center gap-6 p-6">
          <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${plan ? (plan.destaque ? "bg-accent text-ink" : "bg-primary text-white") : "bg-line text-muted"}`}>
            <Crown className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-muted">Plano atual</div>
            <div className="text-2xl font-black">{plan ? plan.nome : "Nenhum plano ativo"}</div>
            {plan && subscription && (
              <div className="text-sm text-muted">
                {formatPrice(subscription.valor_centavos)}/mês · desde {formatDate(subscription.inicio)}
              </div>
            )}
          </div>
          {plan && (
            <button onClick={() => setCancelOpen(true)} className="text-sm font-bold text-danger hover:underline">
              Cancelar plano
            </button>
          )}
        </div>
        {plan && (
          <div className="flex flex-wrap gap-2 border-t border-line bg-bg px-6 py-3">
            {planFeatures(plan).map((f) => (
              <Badge key={f} tone="success">
                {f}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <h2 className="mb-6 mt-10 text-xl font-extrabold">{plan ? "Comparar planos" : "Escolha seu plano"}</h2>
      <PlansGrid currentPlanId={plan?.id ?? null} onChoose={setChosen} />

      <h2 className="mb-4 mt-12 flex items-center gap-2 text-xl font-extrabold">
        <Receipt className="size-5 text-primary" /> Histórico de pagamentos
      </h2>
      <div className="card overflow-hidden">
        {initialLoading ? (
          <Skeleton className="m-4 h-24" />
        ) : !payments?.length ? (
          <p className="p-6 text-center text-sm text-muted">Nenhum pagamento ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Plano</th>
                  <th className="px-5 py-3">Método</th>
                  <th className="px-5 py-3 text-right">Valor</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-semibold">{formatDate(p.created_at)}</td>
                    <td className="px-5 py-3 capitalize">{p.plan_id}</td>
                    <td className="px-5 py-3">{METODO_LABEL[p.metodo]}</td>
                    <td className="px-5 py-3 text-right font-extrabold tabular-nums">{formatPrice(p.valor_centavos)}</td>
                    <td className="px-5 py-3">
                      <Badge tone="success">{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CheckoutModal
        open={!!chosen}
        onClose={() => setChosen(null)}
        title={plan ? `Trocar para o ${chosen?.nome}` : `Assinar o ${chosen?.nome}`}
        itemLabel={`Plano ${chosen?.nome ?? ""} · ${store.nome}`}
        amountCents={chosen?.preco_centavos ?? 0}
        onPay={async (metodo) => {
          unwrap(await supabaseBrowser().rpc("assinar_plano_loja", { p_store_id: store.id, p_plan_id: chosen!.id, p_metodo: metodo }));
          reloadPayments();
        }}
        success={{
          title: `Plano ${chosen?.nome ?? ""} ativo!`,
          text: chosen?.destaque ? "Sua loja agora aparece no topo das buscas, com pin destacado e anúncio Patrocinado." : "Os novos recursos já estão liberados no seu painel.",
          action: (
            <Button
              onClick={() => {
                setChosen(null);
                reload();
              }}
            >
              Voltar ao painel
            </Button>
          ),
        }}
      />

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancelar o plano?" size="sm">
        <p className="text-muted">Sem plano, você não poderá cadastrar novos itens, cupons nem ver estatísticas. Sua loja continua com o perfil básico.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="danger" loading={canceling} onClick={cancel}>
            Sim, cancelar
          </Button>
          <Button variant="ghost" onClick={() => setCancelOpen(false)}>
            Manter plano
          </Button>
        </div>
      </Modal>
    </>
  );
}
