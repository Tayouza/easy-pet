"use client";

import { Ticket } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CouponCard, PremiumCouponBanner } from "@/components/store/CouponCard";
import { Skeleton } from "@/components/ui/States";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";

export function CouponsSection({ storeId }: { storeId: string }) {
  const { user } = useAuth();
  const { data, initialLoading } = useQuery(async () => unwrap(await supabaseBrowser().rpc("store_coupons", { p_store_id: storeId })), [storeId, user?.id]);
  if (!initialLoading && (!data || data.length === 0)) return null;
  const locked = data?.some((c) => c.bloqueado);
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
        <Ticket className="size-5 text-primary" /> Cupons de desconto
      </h2>
      <div className="space-y-3">
        {locked && <PremiumCouponBanner />}
        {initialLoading ? <Skeleton className="h-28" /> : data!.map((c) => <CouponCard key={c.id} c={c} />)}
      </div>
    </section>
  );
}
