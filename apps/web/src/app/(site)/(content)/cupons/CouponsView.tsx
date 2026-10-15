"use client";

import { Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CouponCard, PremiumCouponBanner } from "@/components/store/CouponCard";
import { PremiumBadge } from "@/components/ui/Badges";
import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import { categoryMeta } from "@/shared";

export function CouponsView() {
  const { user, isPremium, loading: authLoading } = useAuth();
  const { data, error, initialLoading, reload } = useQuery(
    async () => {
      const sb = supabaseBrowser();
      const coupons = unwrap(await sb.rpc("all_coupons"));
      // all_coupons não traz o logo: busca os logos das lojas envolvidas.
      const ids = [...new Set(coupons.map((c) => c.store_id))];
      const { data: logos } = ids.length ? await sb.from("stores").select("id,logo_url").in("id", ids) : { data: [] };
      const byId = new Map((logos ?? []).map((s) => [s.id, s.logo_url]));
      return coupons.map((c) => ({ ...c, store_logo: byId.get(c.store_id) ?? null }));
    },
    [user?.id, isPremium],
    !authLoading,
  );
  const [cat, setCat] = useState<string | null>(null);
  const cats = useMemo(() => [...new Set((data ?? []).map((c) => c.categoria_id))], [data]);
  const list = (data ?? []).filter((c) => !cat || c.categoria_id === cat);
  const locked = data?.some((c) => c.bloqueado);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
            <Ticket className="size-8 text-primary" /> Cupons
          </h1>
          <p className="mt-1 text-muted">Descontos de verdade nas lojas parceiras do EasyPet.</p>
        </div>
        {isPremium && <PremiumBadge />}
      </div>

      {locked && (
        <div className="mt-6">
          <PremiumCouponBanner />
        </div>
      )}

      {cats.length > 1 && (
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCat(null)} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-bold", !cat ? "border-secondary bg-secondary text-white" : "border-line bg-surface")}>
            Todos ({data?.length})
          </button>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold", cat === c ? "border-transparent text-white" : "border-line bg-surface")}
              style={cat === c ? { background: categoryMeta(c).cor } : undefined}
            >
              <CategoryIcon id={c} className="size-4" /> {categoryMeta(c).nome}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : initialLoading || authLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={Ticket} title="Nenhum cupom ativo agora" description="Volte em breve — as lojas parceiras sempre lançam novidades." action={<ButtonLink href="/explorar">Explorar lojas</ButtonLink>} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((c) => (
              <CouponCard key={c.id} c={c} showStore />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
