"use client";

import { BarChart3, Crown, LayoutDashboard, Package, Store as StoreIcon, Ticket } from "lucide-react";
import { createContext, useContext } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardShell } from "@/components/dashboard/Shell";
import { PageLoader } from "@/components/ui/States";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store, StorePlan, Subscription } from "@/lib/types";

interface PainelValue {
  store: Store | null;
  plan: StorePlan | null;
  subscription: Subscription | null;
  reload: () => void;
}

const Ctx = createContext<PainelValue | null>(null);

export function usePainel() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePainel fora do painel");
  return v;
}

const NAV = [
  { href: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { href: "/painel/loja", label: "Minha loja", icon: StoreIcon },
  { href: "/painel/itens", label: "Produtos e serviços", icon: Package },
  { href: "/painel/cupons", label: "Cupons", icon: Ticket },
  { href: "/painel/plano", label: "Plano e pagamentos", icon: Crown },
];

export function PainelLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { data, initialLoading, reload } = useQuery(
    async () => {
      const sb = supabaseBrowser();
      const store = unwrap(await sb.from("stores").select("*").eq("owner_id", user!.id).order("created_at").limit(1).maybeSingle()) as Store | null;
      if (!store) return { store: null, plan: null, subscription: null };
      const sub = unwrap(await sb.from("subscriptions").select("*, plan:store_plans(*)").eq("store_id", store.id).eq("status", "ativa").maybeSingle());
      const { plan, ...subscription } = (sub ?? { plan: null }) as Subscription & { plan: StorePlan | null };
      return { store, plan: plan ?? null, subscription: sub ? (subscription as Subscription) : null };
    },
    [user?.id],
    !!user,
  );

  const plan = data?.plan;
  const extra = data?.store ? (
    <div className="rounded-2xl bg-bg p-4">
      <div className="text-xs font-extrabold uppercase tracking-wider text-muted">Plano atual</div>
      <div className="mt-1 flex items-center gap-2 font-extrabold">
        <BarChart3 className="size-4 text-primary" /> {plan?.nome ?? "Sem plano"}
      </div>
    </div>
  ) : null;

  return (
    <DashboardShell nav={NAV} area="Painel do lojista" extra={extra}>
      {authLoading || initialLoading || !data ? (
        <PageLoader />
      ) : (
        <Ctx.Provider value={{ store: data.store, plan: data.plan, subscription: data.subscription, reload }}>{children}</Ctx.Provider>
      )}
    </DashboardShell>
  );
}
