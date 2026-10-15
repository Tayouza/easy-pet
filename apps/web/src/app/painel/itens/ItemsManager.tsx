"use client";

import { Eye, EyeOff, Package, Pencil, Plus, Scissors, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badges";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { assetUrl } from "@/lib/assetUrl";
import { centsToInput, parseBRL } from "@/lib/money";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { StoreItem } from "@/lib/types";
import { formatPrice } from "@/shared";
import { ImageUpload } from "../loja/ImageUpload";
import { usePainel } from "../PainelContext";

type Draft = Partial<StoreItem> & { preco: string };

export function ItemsManager() {
  const { store, plan } = usePainel();
  const { toast, showError } = useFeedback();
  const [tab, setTab] = useState<"todos" | "produto" | "servico">("todos");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<StoreItem | null>(null);

  const { data, error, initialLoading, reload, mutate } = useQuery(
    async () => unwrap(await supabaseBrowser().from("store_items").select("*").eq("store_id", store!.id).order("created_at", { ascending: false })) as StoreItem[],
    [store?.id],
    !!store,
  );

  if (!store)
    return <EmptyState icon={Package} title="Cadastre sua loja primeiro" description="Depois você poderá adicionar produtos e serviços." action={<ButtonLink href="/painel/loja">Cadastrar loja</ButtonLink>} />;

  const items = data ?? [];
  const list = items.filter((i) => tab === "todos" || i.tipo === tab);
  const max = plan?.max_itens ?? null;

  // Mesma regra do trigger enforce_item_limit, checada antes para já mostrar o modal certo.
  const planBlock = () => (!plan ? "PLANO_NECESSARIO" : max != null && items.length >= max ? "LIMITE_ITENS" : null);
  const openNew = () => {
    const block = planBlock();
    if (block) return void showError(block);
    setDraft({ tipo: "servico", ativo: true, preco_a_partir: false, preco: "" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft?.nome) return;
    const block = draft.id ? null : planBlock();
    if (block) return void showError(block);
    setSaving(true);
    const payload = {
      store_id: store.id,
      tipo: draft.tipo ?? "produto",
      nome: draft.nome.trim(),
      descricao: (draft.descricao ?? "").trim(),
      preco_centavos: parseBRL(draft.preco),
      preco_a_partir: !!draft.preco_a_partir,
      imagem_url: draft.imagem_url ?? null,
      ativo: draft.ativo ?? true,
    };
    const sb = supabaseBrowser();
    const { error } = draft.id ? await sb.from("store_items").update(payload).eq("id", draft.id) : await sb.from("store_items").insert(payload);
    setSaving(false);
    if (error) {
      showError(error);
      return;
    }
    toast(draft.id ? "Item atualizado!" : "Item adicionado!");
    setDraft(null);
    reload();
  };

  const toggle = async (i: StoreItem) => {
    const { error } = await supabaseBrowser().from("store_items").update({ ativo: !i.ativo }).eq("id", i.id);
    if (error) return showError(error);
    mutate((l) => l?.map((x) => (x.id === i.id ? { ...x, ativo: !i.ativo } : x)));
  };

  const remove = async () => {
    if (!confirmDel) return;
    const { error } = await supabaseBrowser().from("store_items").delete().eq("id", confirmDel.id);
    if (error) return showError(error);
    mutate((l) => l?.filter((x) => x.id !== confirmDel.id));
    setConfirmDel(null);
    toast("Item excluído");
  };

  return (
    <>
      <PageHeader
        title="Produtos e serviços"
        subtitle="O que aparece na página da sua loja. Itens também entram na busca do mapa."
        action={
          <Button onClick={openNew}>
            <Plus className="size-5" /> Novo item
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-line bg-surface p-1">
          {(
            [
              ["todos", `Todos (${items.length})`],
              ["servico", `Serviços (${items.filter((i) => i.tipo === "servico").length})`],
              ["produto", `Produtos (${items.filter((i) => i.tipo === "produto").length})`],
            ] as const
          ).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("rounded-full px-4 py-1.5 text-sm font-bold", tab === k ? "bg-ink text-white" : "text-muted hover:text-ink")}>
              {l}
            </button>
          ))}
        </div>
        {plan ? (
          max != null ? (
            <div className="flex items-center gap-3 text-sm font-bold">
              <span>
                {items.length}/{max} itens no plano {plan.nome}
              </span>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-line">
                <div className={cn("h-full rounded-full", items.length >= max ? "bg-danger" : "bg-primary")} style={{ width: `${Math.min(100, (items.length / max) * 100)}%` }} />
              </div>
              {items.length >= max && (
                <ButtonLink href="/painel/plano" size="sm" variant="outline">
                  Fazer upgrade
                </ButtonLink>
              )}
            </div>
          ) : (
            <Badge tone="success">Itens ilimitados · {plan.nome}</Badge>
          )
        ) : (
          <Badge tone="danger">Sem plano ativo</Badge>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : initialLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum item por aqui" description="Cadastre serviços como banho, consulta ou hospedagem, e produtos com preço." action={<Button onClick={openNew}>Adicionar o primeiro</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((i) => (
            <div key={i.id} className={cn("card flex min-w-0 gap-3 p-4 transition sm:gap-4", !i.ativo && "opacity-60")}>
              {i.imagem_url ? (
                <img src={assetUrl(i.imagem_url)!} alt="" className="size-16 shrink-0 rounded-xl object-cover sm:size-20" />
              ) : (
                <div className="grid size-16 shrink-0 sm:size-20 place-items-center rounded-xl bg-primary-50 text-primary">{i.tipo === "servico" ? <Scissors className="size-7" /> : <ShoppingBag className="size-7" />}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge tone={i.tipo === "servico" ? "secondary" : "primary"}>{i.tipo === "servico" ? "Serviço" : "Produto"}</Badge>
                  {!i.ativo && <Badge>Oculto</Badge>}
                </div>
                <div className="mt-1 truncate font-extrabold">{i.nome}</div>
                {i.descricao && <p className="line-clamp-1 text-sm text-muted">{i.descricao}</p>}
                <div className="mt-1 font-extrabold text-primary-600">{formatPrice(i.preco_centavos, i.preco_a_partir)}</div>
              </div>
              <div className="flex flex-col gap-1">
                <IconBtn label="Editar" onClick={() => setDraft({ ...i, preco: centsToInput(i.preco_centavos) })}>
                  <Pencil className="size-4" />
                </IconBtn>
                <IconBtn label={i.ativo ? "Ocultar" : "Mostrar"} onClick={() => toggle(i)}>
                  {i.ativo ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </IconBtn>
                <IconBtn label="Excluir" danger onClick={() => setConfirmDel(i)}>
                  <Trash2 className="size-4" />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? "Editar item" : "Novo item"} size="lg">
        {draft && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-full border border-line bg-bg p-1">
              {(
                [
                  ["servico", "Serviço", Scissors],
                  ["produto", "Produto", ShoppingBag],
                ] as const
              ).map(([k, l, Icon]) => (
                <button key={k} type="button" onClick={() => setDraft({ ...draft, tipo: k })} className={cn("flex items-center justify-center gap-2 rounded-full py-2 text-sm font-extrabold", draft.tipo === k ? "bg-surface shadow-soft" : "text-muted")}>
                  <Icon className="size-4" /> {l}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-[112px_1fr]">
              <ImageUpload kind="logo" value={draft.imagem_url ?? null} onChange={(u) => setDraft({ ...draft, imagem_url: u })} className="size-28" />
              <div className="space-y-3">
                <div>
                  <label className="label">Nome</label>
                  <input required className="input" value={draft.nome ?? ""} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} placeholder={draft.tipo === "servico" ? "Ex.: Banho e tosa porte P" : "Ex.: Ração Premium 15 kg"} />
                </div>
                <div>
                  <label className="label">Descrição</label>
                  <input className="input" value={draft.descricao ?? ""} onChange={(e) => setDraft({ ...draft, descricao: e.target.value })} placeholder="Detalhes curtos (opcional)" />
                </div>
              </div>
            </div>
            <div className="grid items-end gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Preço (R$)</label>
                <input className="input" inputMode="decimal" value={draft.preco} onChange={(e) => setDraft({ ...draft, preco: e.target.value })} placeholder="Vazio = sob consulta" />
              </div>
              <label className="flex cursor-pointer items-center gap-2 pb-3 text-sm font-bold">
                <input type="checkbox" className="size-4 accent-[var(--color-primary)]" checked={!!draft.preco_a_partir} onChange={(e) => setDraft({ ...draft, preco_a_partir: e.target.checked })} />
                Mostrar como “a partir de”
              </label>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
              <input type="checkbox" className="size-4 accent-[var(--color-primary)]" checked={draft.ativo ?? true} onChange={(e) => setDraft({ ...draft, ativo: e.target.checked })} />
              Visível na página da loja
            </label>
            <Button type="submit" loading={saving} className="w-full">
              {draft.id ? "Salvar item" : "Adicionar item"}
            </Button>
          </form>
        )}
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Excluir item?" size="sm">
        <p className="text-muted">“{confirmDel?.nome}” será removido da sua loja.</p>
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

export function IconBtn({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={cn("grid size-9 place-items-center rounded-full text-muted transition", danger ? "hover:bg-danger-50 hover:text-danger" : "hover:bg-ink/5 hover:text-ink")}>
      {children}
    </button>
  );
}
