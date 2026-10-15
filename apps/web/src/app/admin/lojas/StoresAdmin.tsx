"use client";

import { Ban, Check, ExternalLink, Eye, Hourglass, MapPin, RotateCcw, Search, Store as StoreIcon, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/Shell";
import { StoresMap } from "@/components/map";
import { CategoryChip, StoreCover, StoreLogo } from "@/components/store/StoreVisuals";
import { Badge, Rating } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store, StoreStatus } from "@/lib/types";
import { CATEGORIES, formatDate, formatPhone } from "@/shared";
import { useAdminPending } from "../AdminShell";

type Row = Store & {
  owner: { nome: string; email: string } | null;
  subscriptions: { plan_id: string; status: string }[];
};

const STATUS: Record<StoreStatus, { label: string; tone: "success" | "accent" | "danger" | "neutral" }> = {
  ativa: { label: "Ativa", tone: "success" },
  pendente: { label: "Pendente", tone: "accent" },
  suspensa: { label: "Suspensa", tone: "danger" },
  recusada: { label: "Recusada", tone: "neutral" },
};

type Action = { store: Row; status: StoreStatus; title: string; needsReason: boolean; cta: string; tone: "primary" | "danger" | "secondary" };

export function StoresAdmin() {
  const params = useSearchParams();
  const { toast, showError } = useFeedback();
  const { reloadPendentes } = useAdminPending();
  const [status, setStatus] = useState<StoreStatus | "todas">((params.get("status") as StoreStatus) ?? "todas");
  const [categoria, setCategoria] = useState("");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Row | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, error, initialLoading, reload } = useQuery(
    async () =>
      unwrap(
        await supabaseBrowser()
          .from("stores")
          .select("*, owner:profiles!stores_owner_id_fkey(nome,email), subscriptions(plan_id,status)")
          .order("created_at", { ascending: false }),
      ) as unknown as Row[],
    ["admin-stores"],
  );

  const all = useMemo(() => data ?? [], [data]);
  const pendentes = all.filter((s) => s.status === "pendente");
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (s) =>
        (status === "todas" || s.status === status) &&
        (!categoria || s.categoria_id === categoria) &&
        (!term || [s.nome, s.bairro, s.endereco, s.owner?.nome, s.owner?.email].some((v) => v?.toLowerCase().includes(term))),
    );
  }, [data, status, categoria, q]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { todas: all.length };
    for (const s of all) c[s.status] = (c[s.status] ?? 0) + 1;
    return c;
  }, [all]);

  const open = (store: Row, st: StoreStatus) => {
    setMotivo("");
    const map: Record<StoreStatus, Omit<Action, "store" | "status">> = {
      ativa: { title: store.status === "pendente" ? `Aprovar “${store.nome}”?` : `Reativar “${store.nome}”?`, needsReason: false, cta: store.status === "pendente" ? "Aprovar loja" : "Reativar", tone: "primary" },
      recusada: { title: `Recusar “${store.nome}”?`, needsReason: true, cta: "Recusar cadastro", tone: "danger" },
      suspensa: { title: `Suspender “${store.nome}”?`, needsReason: true, cta: "Suspender loja", tone: "danger" },
      pendente: { title: "Voltar para pendente?", needsReason: false, cta: "Confirmar", tone: "secondary" },
    };
    setAction({ store, status: st, ...map[st] });
  };

  const confirm = async () => {
    if (!action) return;
    if (action.needsReason && !motivo.trim()) return;
    setBusy(true);
    const { error } = await supabaseBrowser().rpc("moderar_loja", { p_store_id: action.store.id, p_status: action.status, p_motivo: motivo.trim() || undefined });
    setBusy(false);
    if (error) return showError(error);
    toast(action.status === "ativa" ? "Loja aprovada e no ar! ✅" : `Loja ${STATUS[action.status].label.toLowerCase()}.`, action.status === "ativa" ? "success" : "info");
    setAction(null);
    setDetail(null);
    reload();
    reloadPendentes();
  };

  const actionsFor = (s: Row) => (
    <div className="flex flex-wrap justify-end gap-1.5">
      {s.status === "pendente" && (
        <>
          <Button size="sm" onClick={() => open(s, "ativa")}>
            <Check className="size-4" /> Aprovar
          </Button>
          <Button size="sm" variant="outline" onClick={() => open(s, "recusada")}>
            <X className="size-4" /> Recusar
          </Button>
        </>
      )}
      {s.status === "ativa" && (
        <Button size="sm" variant="outline" className="text-danger" onClick={() => open(s, "suspensa")}>
          <Ban className="size-4" /> Suspender
        </Button>
      )}
      {(s.status === "suspensa" || s.status === "recusada") && (
        <Button size="sm" variant="secondary" onClick={() => open(s, "ativa")}>
          <RotateCcw className="size-4" /> Reativar
        </Button>
      )}
    </div>
  );

  return (
    <>
      <PageHeader title="Lojas" subtitle="Aprove novos cadastros e modere lojas do EasyPet." />

      {error && <ErrorState message={error} onRetry={reload} />}

      {/* Fila de pendentes */}
      {pendentes.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold">
            <Hourglass className="size-5 text-[#b07800]" /> Fila de aprovação
            <span className="rounded-full bg-accent px-2 py-0.5 text-sm font-black">{pendentes.length}</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendentes.map((s) => (
              <div key={s.id} className="card overflow-hidden border-accent">
                <div className="relative h-20">
                  <StoreCover url={s.capa_url} categoriaId={s.categoria_id} iconSize="size-8" />
                </div>
                <div className="relative p-4 pt-3">
                  <div className="flex items-start gap-3">
                    <StoreLogo url={s.logo_url} nome={s.nome} categoriaId={s.categoria_id} className="-mt-9 size-14 text-base" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-extrabold">{s.nome}</div>
                      <div className="text-xs text-muted">
                        {s.owner?.nome} · {s.owner?.email}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{formatDate(s.created_at)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <CategoryChip id={s.categoria_id} />
                    <span className="flex items-center gap-1 text-muted">
                      <MapPin className="size-3.5" /> {s.bairro || s.endereco}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button onClick={() => setDetail(s)} className="flex items-center gap-1 text-sm font-bold text-secondary hover:underline">
                      <Eye className="size-4" /> Detalhes
                    </button>
                    {actionsFor(s)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filtros */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="flex flex-wrap gap-1">
          {(["todas", "ativa", "pendente", "suspensa", "recusada"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={cn("rounded-full px-3.5 py-1.5 text-sm font-bold transition", status === st ? "bg-ink text-white" : "text-muted hover:bg-ink/5 hover:text-ink")}
            >
              {st === "todas" ? "Todas" : STATUS[st].label} <span className="opacity-60">{counts[st] ?? 0}</span>
            </button>
          ))}
        </div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input !w-auto !py-2">
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por loja, bairro ou dono" className="input !py-2 !pl-9" />
        </div>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        {initialLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={StoreIcon} title="Nenhuma loja encontrada" description="Ajuste os filtros." className="m-4 border-0" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-bg text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Loja</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Nota</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((s) => {
                  const plan = s.subscriptions?.find((x) => x.status === "ativa")?.plan_id;
                  return (
                    <tr key={s.id} className="hover:bg-bg/60">
                      <td className="px-4 py-3">
                        <button onClick={() => setDetail(s)} className="flex items-center gap-3 text-left">
                          <StoreLogo url={s.logo_url} nome={s.nome} categoriaId={s.categoria_id} className="size-10 border-2 text-xs" />
                          <span className="min-w-0">
                            <span className="block font-extrabold hover:text-primary-600">{s.nome}</span>
                            <span className="block text-xs text-muted">
                              {s.bairro} · {s.owner?.nome}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryChip id={s.categoria_id} className="!py-0.5 text-[11px]" />
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
                        {s.motivo_status && s.status !== "ativa" && <div className="mt-1 max-w-48 truncate text-xs text-muted" title={s.motivo_status}>{s.motivo_status}</div>}
                      </td>
                      <td className="px-4 py-3 capitalize">{plan ?? <span className="text-muted">—</span>}</td>
                      <td className="px-4 py-3">
                        <Rating nota={s.nota_media} total={s.total_avaliacoes} className="text-[13px]" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setDetail(s)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink" title="Detalhes e mapa" aria-label="Detalhes">
                            <Eye className="size-4" />
                          </button>
                          {actionsFor(s)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalhes */}
      <Modal open={!!detail} onClose={() => setDetail(null)} size="xl">
        {detail && (
          <div>
            <div className="-mx-6 -mt-6 mb-4 h-32 overflow-hidden rounded-t-3xl">
              <StoreCover url={detail.capa_url} categoriaId={detail.categoria_id} />
            </div>
            <div className="flex items-start gap-4">
              <StoreLogo url={detail.logo_url} nome={detail.nome} categoriaId={detail.categoria_id} className="-mt-12 size-20 text-xl" />
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black leading-tight">{detail.nome}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <CategoryChip id={detail.categoria_id} />
                  <Badge tone={STATUS[detail.status].tone}>{STATUS[detail.status].label}</Badge>
                </div>
              </div>
            </div>
            {detail.motivo_status && <p className="mt-3 rounded-xl bg-danger-50 px-3 py-2 text-sm text-danger">Motivo: {detail.motivo_status}</p>}
            <p className="mt-4 text-sm text-ink/85">{detail.descricao || "Sem descrição."}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Responsável" value={`${detail.owner?.nome ?? "—"} · ${detail.owner?.email ?? ""}`} />
              <Info label="Endereço" value={`${detail.endereco} · ${detail.bairro}, ${detail.cidade}-${detail.uf}`} />
              <Info label="WhatsApp" value={formatPhone(detail.whatsapp) || "—"} />
              <Info label="Telefone" value={formatPhone(detail.telefone) || "—"} />
              <Info label="Cadastro" value={formatDate(detail.created_at)} />
              <Info label="Aprovada em" value={detail.aprovada_em ? formatDate(detail.aprovada_em) : "—"} />
            </dl>
            <div className="mt-4 h-56 overflow-hidden rounded-2xl border border-line">
              <StoresMap stores={[detail]} center={{ lat: detail.lat, lng: detail.lng }} zoom={15} />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Link href={`/loja/${detail.id}`} target="_blank" className="flex items-center gap-1.5 text-sm font-bold text-secondary hover:underline">
                Abrir página da loja <ExternalLink className="size-4" />
              </Link>
              {actionsFor(detail)}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmação de moderação */}
      <Modal open={!!action} onClose={() => setAction(null)} title={action?.title} size="sm">
        {action && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {action.status === "ativa"
                ? "A loja passa a aparecer no mapa e nas buscas imediatamente."
                : action.status === "suspensa"
                  ? "A loja sai do mapa e o lojista verá o motivo no painel."
                  : "O lojista verá o motivo no painel e poderá corrigir os dados."}
            </p>
            <div>
              <label className="label">Motivo {action.needsReason ? "" : <span className="font-semibold text-muted">(opcional)</span>}</label>
              <textarea
                rows={3}
                className="input resize-none"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder={action.needsReason ? "Ex.: Endereço não confere / fotos inadequadas" : "Observação interna"}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setAction(null)}>
                Cancelar
              </Button>
              <Button variant={action.tone === "danger" ? "danger" : action.tone} className="flex-1" loading={busy} disabled={action.needsReason && !motivo.trim()} onClick={confirm}>
                {action.cta}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg px-3 py-2">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
