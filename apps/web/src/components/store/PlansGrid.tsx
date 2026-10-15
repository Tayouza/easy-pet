"use client";

import { Check, Star } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { StorePlan } from "@/lib/types";
import { formatPrice } from "@/shared";

export function usePlans() {
  return useQuery(async () => unwrap(await supabaseBrowser().from("store_plans").select("*").order("ordem")) as StorePlan[], ["plans"]);
}

export function planFeatures(p: StorePlan) {
  if (p.beneficios?.length) return p.beneficios;
  return [
    "Perfil completo e pin no mapa",
    p.max_itens ? `Até ${p.max_itens} produtos e serviços` : "Produtos e serviços ilimitados",
    ...(p.permite_cupons ? ["Cupons de desconto"] : []),
    ...(p.estatisticas ? ["Estatísticas de visitas e contatos"] : []),
    ...(p.destaque ? ["Topo das buscas, pin destacado e anúncio Patrocinado"] : []),
  ];
}

export function PlansGrid({ currentPlanId, onChoose, busyId }: { currentPlanId?: string | null; onChoose?: (p: StorePlan) => void; busyId?: string | null }) {
  const { profile } = useAuth();
  const { data, error, initialLoading, reload } = usePlans();
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading)
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[420px]" />
        ))}
      </div>
    );
  return (
    <div className="grid items-stretch gap-5 md:grid-cols-3">
      {data!.map((p) => {
        const popular = p.id === "profissional";
        const current = currentPlanId === p.id;
        return (
          <div
            key={p.id}
            className={cn(
              "relative flex flex-col rounded-[24px] border-2 bg-surface p-7 shadow-soft transition",
              p.destaque ? "border-accent" : popular ? "border-primary" : "border-line",
              current && "ring-4 ring-secondary/25",
            )}
          >
            {(popular || p.destaque) && (
              <span className={cn("absolute -top-3.5 left-7 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold", p.destaque ? "bg-accent text-ink" : "bg-primary text-white")}>
                {p.destaque ? (
                  <>
                    <Star className="size-3.5 fill-ink" /> Máxima visibilidade
                  </>
                ) : (
                  "Mais escolhido"
                )}
              </span>
            )}
            <h3 className="text-xl font-extrabold">{p.nome}</h3>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-4xl font-black">{formatPrice(p.preco_centavos)}</span>
              <span className="mb-1 font-bold text-muted">/mês</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {planFeatures(p).map((b) => (
                <li key={b} className="flex gap-2.5 text-[15px]">
                  <Check className="mt-0.5 size-5 shrink-0 text-success" /> {b}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              {onChoose ? (
                current ? (
                  <div className="flex h-11 items-center justify-center rounded-full bg-secondary-50 font-extrabold text-secondary">Seu plano atual</div>
                ) : (
                  <Button className="w-full" variant={p.destaque ? "premium" : popular ? "primary" : "outline"} loading={busyId === p.id} onClick={() => onChoose(p)}>
                    {currentPlanId ? "Trocar para este" : "Assinar"}
                  </Button>
                )
              ) : (
                <ButtonLink href={profile?.role === "lojista" ? "/painel/plano" : "/cadastro?perfil=lojista"} className="w-full" variant={p.destaque ? "premium" : popular ? "primary" : "outline"}>
                  Começar com o {p.nome}
                </ButtonLink>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
