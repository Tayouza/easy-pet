"use client";

import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { isProfilePremium } from "@/components/auth/AuthProvider";
import { PageHeader, StatCard } from "@/components/dashboard/Shell";
import { Avatar } from "@/components/layout/UserMenu";
import { Badge, PremiumBadge } from "@/components/ui/Badges";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/lib/types";
import { formatDate, formatPhone } from "@/shared";

const ROLE: Record<UserRole, { label: string; tone: "secondary" | "primary" | "neutral" }> = {
  cliente: { label: "Cliente", tone: "secondary" },
  lojista: { label: "Lojista", tone: "primary" },
  admin: { label: "Admin", tone: "neutral" },
};

type Row = Profile & { stores: { id: string; nome: string }[] };

export function UsersAdmin() {
  const [role, setRole] = useState<UserRole | "todos" | "premium">("todos");
  const [q, setQ] = useState("");
  const { data, error, initialLoading, reload } = useQuery(
    async () => unwrap(await supabaseBrowser().from("profiles").select("*, stores!stores_owner_id_fkey(id,nome)").order("created_at", { ascending: false })) as unknown as Row[],
    ["admin-users"],
  );

  const all = useMemo(() => data ?? [], [data]);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all.filter(
      (p) =>
        (role === "todos" || (role === "premium" ? isProfilePremium(p) : p.role === role)) &&
        (!term || [p.nome, p.email, p.telefone].some((v) => v?.toLowerCase().includes(term))),
    );
  }, [all, role, q]);

  const count = (fn: (p: Row) => boolean) => all.filter(fn).length;

  return (
    <>
      <PageHeader title="Usuários" subtitle="Clientes, lojistas e administradores cadastrados." />
      {error && <ErrorState message={error} onRetry={reload} />}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={initialLoading ? "—" : all.length} icon={Users} tone="primary" />
        <StatCard label="Clientes" value={initialLoading ? "—" : count((p) => p.role === "cliente")} icon={Users} tone="secondary" />
        <StatCard label="Premium" value={initialLoading ? "—" : count(isProfilePremium)} icon={Users} tone="accent" />
        <StatCard label="Lojistas" value={initialLoading ? "—" : count((p) => p.role === "lojista")} icon={Users} tone="success" />
      </div>

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["todos", "Todos"],
              ["cliente", "Clientes"],
              ["premium", "Premium"],
              ["lojista", "Lojistas"],
              ["admin", "Admins"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} onClick={() => setRole(k)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-bold", role === k ? "bg-ink text-white" : "text-muted hover:bg-ink/5 hover:text-ink")}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone" className="input !py-2 !pl-9" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {initialLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum usuário encontrado" className="m-4 border-0" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-bg text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">Perfil</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nome={p.nome} />
                        <div className="min-w-0">
                          <div className="font-extrabold">{p.nome || "—"}</div>
                          <div className="text-xs text-muted">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={ROLE[p.role].tone}>{ROLE[p.role].label}</Badge>
                      {p.role === "lojista" && p.stores?.length > 0 && <div className="mt-1 max-w-44 truncate text-xs text-muted">{p.stores.map((s) => s.nome).join(", ")}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {isProfilePremium(p) ? (
                        <span className="flex flex-col items-start gap-0.5">
                          <PremiumBadge small />
                          {p.premium_ate && <span className="text-xs text-muted">até {formatDate(p.premium_ate)}</span>}
                        </span>
                      ) : (
                        <span className="text-muted">Grátis</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatPhone(p.telefone) || <span className="text-muted">—</span>}</td>
                    <td className="px-4 py-3">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!initialLoading && <p className="mt-3 text-right text-xs text-muted">{list.length} de {all.length} usuários</p>}
    </>
  );
}
