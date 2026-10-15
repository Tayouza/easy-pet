"use client";

import { CreditCard, LayoutDashboard, Store as StoreIcon, Users } from "lucide-react";
import { createContext, useContext } from "react";
import { DashboardShell } from "@/components/dashboard/Shell";
import { useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";

const PendingCtx = createContext<{ pendentes: number; reloadPendentes: () => void }>({ pendentes: 0, reloadPendentes: () => {} });
export const useAdminPending = () => useContext(PendingCtx);

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data, reload } = useQuery(async () => (await supabaseBrowser().from("stores").select("id", { count: "exact", head: true }).eq("status", "pendente")).count ?? 0, ["admin-pend"]);
  const pend = data ?? 0;
  const nav = [
    { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
    {
      href: "/admin/lojas",
      label: "Lojas",
      icon: StoreIcon,
      badge: pend > 0 ? <span className="grid min-w-6 place-items-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-black text-ink">{pend}</span> : null,
    },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
    { href: "/admin/assinaturas", label: "Assinaturas", icon: CreditCard },
  ];
  return (
    <PendingCtx.Provider value={{ pendentes: pend, reloadPendentes: reload }}>
      <DashboardShell nav={nav} area="Administração">
        {children}
      </DashboardShell>
    </PendingCtx.Provider>
  );
}
