"use client";

import { Crown, Heart, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { StoreCard, StoreCardSkeleton } from "@/components/store/StoreCard";
import { ButtonLink } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { StoreCardData } from "@/lib/types";
import { FREE_FAVORITES_LIMIT } from "@/shared";

export function FavoritesView() {
  const { user, isPremium } = useAuth();
  const { toast, showError } = useFeedback();
  const { data, error, initialLoading, reload, mutate } = useQuery(
    async () => {
      const rows = unwrap(
        await supabaseBrowser()
          .from("favorites")
          .select("created_at, store:stores(id,nome,categoria_id,endereco,bairro,aberto_24h,horarios,logo_url,capa_url,destaque,nota_media,total_avaliacoes,lat,lng,tags)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
      );
      return (rows ?? []).map((r) => r.store).filter(Boolean) as StoreCardData[];
    },
    [user?.id],
    !!user,
  );

  const remove = async (id: string) => {
    const { error } = await supabaseBrowser().from("favorites").delete().eq("user_id", user!.id).eq("store_id", id);
    if (error) return showError(error);
    mutate((list) => list?.filter((s) => s.id !== id));
    toast("Removida dos favoritos");
  };

  const count = data?.length ?? 0;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
            <Heart className="size-8 fill-primary text-primary" /> Favoritos
          </h1>
          <p className="mt-1 text-muted">Os lugares que você mais gosta, sempre à mão.</p>
        </div>
        {!isPremium && user && (
          <div className="flex items-center gap-3 rounded-full border border-line bg-surface py-1.5 pl-4 pr-1.5">
            <span className="text-sm font-bold">
              {count}/{FREE_FAVORITES_LIMIT} na versão grátis
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (count / FREE_FAVORITES_LIMIT) * 100)}%` }} />
            </div>
            <ButtonLink href="/premium" variant="premium" size="sm">
              <Crown className="size-4" /> Ilimitados
            </ButtonLink>
          </div>
        )}
      </div>
      <div className="mt-8">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : initialLoading || !user ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StoreCardSkeleton key={i} />
            ))}
          </div>
        ) : count === 0 ? (
          <EmptyState icon={Heart} title="Nenhum favorito ainda" description="Toque no coração na página de uma loja para salvá-la aqui." action={<ButtonLink href="/explorar">Explorar lojas</ButtonLink>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data!.map((s) => (
              <div key={s.id} className="relative">
                <StoreCard store={s} className="h-full" />
                <button
                  onClick={() => remove(s.id)}
                  className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-surface/95 text-primary shadow-soft transition hover:bg-danger hover:text-white"
                  aria-label="Remover dos favoritos"
                  title="Remover"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
