"use client";

import { Eye, EyeOff, Lock, Pencil, Plus, Ticket, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/Shell";
import { CouponCard } from "@/components/store/CouponCard";
import { Badge } from "@/components/ui/Badges";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Coupon } from "@/lib/types";
import { formatDate } from "@/shared";
import { IconBtn } from "../itens/ItemsManager";
import { usePainel } from "../PainelContext";

const SUGESTOES = ["10% OFF", "15% OFF", "20% OFF", "R$ 20 OFF", "Frete grátis", "Leve 3 pague 2"];

function isExpired(c: Pick<Coupon, "validade">) {
  if (!c.validade) return false;
  return c.validade < new Date().toISOString().slice(0, 10);
}

export function CouponsManager() {
  const { store, plan } = usePainel();
  const { toast, showError } = useFeedback();
  const [draft, setDraft] = useState<Partial<Coupon> | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Coupon | null>(null);

  const { data, error, initialLoading, reload, mutate } = useQuery(
    async () => unwrap(await supabaseBrowser().from("coupons").select("*").eq("store_id", store!.id).order("created_at", { ascending: false })) as Coupon[],
    [store?.id],
    !!store,
  );

  if (!store)
    return <EmptyState icon={Ticket} title="Cadastre sua loja primeiro" description="Depois você poderá criar cupons para assinantes Premium." action={<ButtonLink href="/painel/loja">Cadastrar loja</ButtonLink>} />;

  const allowed = !!plan?.permite_cupons;
  const openNew = () => setDraft({ ativo: true, desconto: "10% OFF", codigo: "" });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft?.codigo || !draft.titulo || !draft.desconto) return;
    setSaving(true);
    const payload = {
      store_id: store.id,
      codigo: draft.codigo.trim().toUpperCase().replace(/\s+/g, ""),
      titulo: draft.titulo.trim(),
      descricao: (draft.descricao ?? "").trim(),
      desconto: draft.desconto.trim(),
      validade: draft.validade || null,
      ativo: draft.ativo ?? true,
    };
    const sb = supabaseBrowser();
    const { error } = draft.id ? await sb.from("coupons").update(payload).eq("id", draft.id) : await sb.from("coupons").insert(payload);
    setSaving(false);
    if (error) {
      showError(error);
      return;
    }
    toast(draft.id ? "Cupom atualizado!" : "Cupom criado! 🎟️");
    setDraft(null);
    reload();
  };

  const toggle = async (c: Coupon) => {
    const { error } = await supabaseBrowser().from("coupons").update({ ativo: !c.ativo }).eq("id", c.id);
    if (error) return showError(error);
    mutate((l) => l?.map((x) => (x.id === c.id ? { ...x, ativo: !c.ativo } : x)));
  };

  const remove = async () => {
    if (!confirmDel) return;
    const { error } = await supabaseBrowser().from("coupons").delete().eq("id", confirmDel.id);
    if (error) return showError(error);
    mutate((l) => l?.filter((x) => x.id !== confirmDel.id));
    setConfirmDel(null);
    toast("Cupom excluído");
  };

  const coupons = data ?? [];

  return (
    <>
      <PageHeader
        title="Cupons"
        subtitle="Cupons aparecem na sua página e na aba Cupons — o código é liberado para assinantes Premium."
        action={
          <Button onClick={openNew}>
            <Plus className="size-5" /> Novo cupom
          </Button>
        }
      />

      {!allowed && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-card border border-primary/25 bg-primary-50 p-4">
          <Lock className="size-6 shrink-0 text-primary" />
          <div className="flex-1">
            <div className="font-extrabold">Cupons a partir do plano Profissional</div>
            <div className="text-sm text-muted">{plan ? `Seu plano ${plan.nome} não inclui cupons.` : "Sua loja ainda não tem um plano ativo."} Faça upgrade para atrair os clientes Premium do EasyPet.</div>
          </div>
          <ButtonLink href="/painel/plano" size="sm">
            Ver planos
          </ButtonLink>
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : initialLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="Nenhum cupom criado" description="Ofereça um desconto e apareça para quem está procurando economizar." action={<Button onClick={openNew}>Criar primeiro cupom</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {coupons.map((c) => {
            const expired = isExpired(c);
            return (
              <div key={c.id} className={cn("space-y-2", (!c.ativo || expired) && "opacity-60")}>
                <CouponCard c={{ ...c, bloqueado: false }} />
                <div className="flex items-center justify-between px-1">
                  <div className="flex gap-1.5">
                    {expired ? <Badge tone="danger">Vencido em {formatDate(c.validade)}</Badge> : c.ativo ? <Badge tone="success">Ativo</Badge> : <Badge>Pausado</Badge>}
                  </div>
                  <div className="flex">
                    <IconBtn label="Editar" onClick={() => setDraft(c)}>
                      <Pencil className="size-4" />
                    </IconBtn>
                    <IconBtn label={c.ativo ? "Pausar" : "Ativar"} onClick={() => toggle(c)}>
                      {c.ativo ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </IconBtn>
                    <IconBtn label="Excluir" danger onClick={() => setConfirmDel(c)}>
                      <Trash2 className="size-4" />
                    </IconBtn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Editar cupom" : "Novo cupom"} size="lg">
        {draft && (
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Desconto</label>
              <input required className="input" value={draft.desconto ?? ""} onChange={(e) => setDraft({ ...draft, desconto: e.target.value })} placeholder="Ex.: 15% OFF" />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGESTOES.map((s) => (
                  <button key={s} type="button" onClick={() => setDraft({ ...draft, desconto: s })} className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", draft.desconto === s ? "border-primary bg-primary-50 text-primary-600" : "border-line hover:border-ink/20")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Título</label>
                <input required className="input" value={draft.titulo ?? ""} onChange={(e) => setDraft({ ...draft, titulo: e.target.value })} placeholder="Ex.: 15% no primeiro banho" />
              </div>
              <div>
                <label className="label">Código</label>
                <input required className="input font-mono uppercase" value={draft.codigo ?? ""} onChange={(e) => setDraft({ ...draft, codigo: e.target.value.toUpperCase() })} placeholder="EASYPET15" maxLength={20} />
              </div>
            </div>
            <div>
              <label className="label">Regras / descrição</label>
              <input className="input" value={draft.descricao ?? ""} onChange={(e) => setDraft({ ...draft, descricao: e.target.value })} placeholder="Ex.: Válido de segunda a quinta, não cumulativo." />
            </div>
            <div className="grid items-end gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Validade</label>
                <input type="date" className="input" value={draft.validade ?? ""} onChange={(e) => setDraft({ ...draft, validade: e.target.value || null })} />
              </div>
              <label className="flex cursor-pointer items-center gap-2 pb-3 text-sm font-bold">
                <input type="checkbox" className="size-4 accent-[var(--color-primary)]" checked={draft.ativo ?? true} onChange={(e) => setDraft({ ...draft, ativo: e.target.checked })} />
                Cupom ativo
              </label>
            </div>
            <div>
              <div className="label">Pré-visualização</div>
              <CouponCard c={{ id: "preview", titulo: draft.titulo || "Título do cupom", descricao: draft.descricao ?? "", desconto: draft.desconto || "—", validade: draft.validade ?? null, codigo: draft.codigo || "CODIGO", bloqueado: false, categoria_id: store.categoria_id }} />
            </div>
            <Button type="submit" loading={saving} className="w-full">
              {draft.id ? "Salvar cupom" : "Criar cupom"}
            </Button>
          </form>
        )}
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Excluir cupom?" size="sm">
        <p className="text-muted">O cupom {confirmDel?.codigo} deixará de aparecer para os clientes.</p>
        <div className="mt-6 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmDel(null)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={remove}>
            Excluir
          </Button>
        </div>
      </Modal>
    </>
  );
}
