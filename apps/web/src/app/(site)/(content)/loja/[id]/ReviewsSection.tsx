"use client";

import { MessageSquareText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "@/components/layout/UserMenu";
import { Stars } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Skeleton } from "@/components/ui/States";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Review } from "@/lib/types";
import { formatDate, formatRating } from "@/shared";

const LABELS = ["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

export function ReviewsSection({ storeId, nota, total, onChanged }: { storeId: string; nota: number; total: number; onChanged: () => void }) {
  const { user, profile } = useAuth();
  const { toast, showError } = useFeedback();
  const { data, initialLoading, reload } = useQuery(
    async () => unwrap(await supabaseBrowser().from("reviews").select("*").eq("store_id", storeId).order("created_at", { ascending: false })) as Review[],
    [storeId],
  );
  const mine = data?.find((r) => r.user_id === user?.id);
  const [draft, setDraft] = useState<{ nota: number; comentario: string } | null>(null);
  const form = draft ?? { nota: mine?.nota ?? 0, comentario: mine?.comentario ?? "" };
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visible = (data ?? []).filter((r) => r.comentario || r.user_id !== user?.id);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: data?.filter((r) => r.nota === n).length ?? 0 }));
  const count = data?.length ?? total;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || form.nota < 1) return;
    setSaving(true);
    const { error } = await supabaseBrowser()
      .from("reviews")
      .upsert({ store_id: storeId, user_id: user.id, nota: form.nota, comentario: form.comentario.trim() }, { onConflict: "store_id,user_id" });
    setSaving(false);
    if (error) return showError(error);
    toast(mine ? "Avaliação atualizada!" : "Obrigado pela avaliação! 🐾");
    setDraft(null);
    reload();
    onChanged();
  };

  const remove = async () => {
    if (!mine) return;
    const { error } = await supabaseBrowser().from("reviews").delete().eq("id", mine.id);
    if (error) return showError(error);
    toast("Avaliação removida");
    setDraft(null);
    reload();
    onChanged();
  };

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
        <MessageSquareText className="size-5 text-primary" /> Avaliações
      </h2>
      <div className="card grid gap-6 p-6 sm:grid-cols-[180px_1fr]">
        <div className="text-center sm:border-r sm:border-line sm:pr-6">
          <div className="text-5xl font-black">{nota > 0 ? formatRating(nota) : "—"}</div>
          <Stars value={nota} size="size-5" />
          <div className="mt-1 text-sm text-muted">
            {count} {count === 1 ? "avaliação" : "avaliações"}
          </div>
        </div>
        <div className="space-y-1.5">
          {dist.map((d) => (
            <div key={d.n} className="flex items-center gap-3 text-sm">
              <span className="w-3 font-bold">{d.n}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line/70">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${count ? (d.c / count) * 100 : 0}%` }} />
              </div>
              <span className="w-6 text-right text-muted">{d.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div className="card mt-4 p-6">
        {user ? (
          <form onSubmit={submit} className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar nome={profile?.nome ?? ""} />
              <div>
                <div className="font-extrabold">{mine ? "Sua avaliação" : "Avalie este lugar"}</div>
                <div className="flex items-center gap-2">
                  <Stars value={form.nota} size="size-7" onChange={(n) => setDraft({ ...form, nota: n })} />
                  {form.nota > 0 && <span className="text-sm font-bold text-muted">{LABELS[form.nota]}</span>}
                </div>
              </div>
            </div>
            <textarea
              value={form.comentario}
              onChange={(e) => setDraft({ ...form, comentario: e.target.value })}
              placeholder="Conte como foi a experiência (opcional)"
              rows={3}
              maxLength={600}
              className="input resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              {mine && (
                <Button type="button" variant="ghost" size="sm" onClick={remove} className="text-danger">
                  <Trash2 className="size-4" /> Excluir
                </Button>
              )}
              <Button type="submit" size="sm" loading={saving} disabled={form.nota < 1 || (!!mine && !draft)}>
                {mine ? "Atualizar avaliação" : "Publicar avaliação"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-semibold text-muted">Já foi neste lugar? Conte para outros tutores.</span>
            <Link href={`/entrar?next=/loja/${storeId}`} className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-600">
              Entrar para avaliar
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {initialLoading
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : visible.slice(0, showAll ? undefined : 5).map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center gap-3">
                    <Avatar nome={r.autor_nome} className="size-10 text-sm" />
                    <div className="flex-1">
                      <div className="font-extrabold">
                        {r.autor_nome || "Tutor"}
                        {r.user_id === user?.id && <span className="ml-2 text-xs font-bold text-primary">(você)</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Stars value={r.nota} size="size-3.5" /> {formatDate(r.created_at)}
                      </div>
                    </div>
                  </div>
                  {r.comentario && <p className="mt-3 leading-relaxed text-ink/85">{r.comentario}</p>}
                </div>
              ))}
        {!initialLoading && !showAll && visible.length > 5 && (
          <button onClick={() => setShowAll(true)} className="w-full rounded-full border border-line bg-surface py-2.5 text-sm font-bold text-secondary hover:bg-secondary-50">
            Ver todas as {visible.length} avaliações
          </button>
        )}
        {!initialLoading && data!.length === 0 && <p className="py-4 text-center text-sm text-muted">Ainda sem avaliações. Seja o primeiro!</p>}
      </div>
    </section>
  );
}
