"use client";

import { AlertTriangle, ArrowLeft, AtSign, Clock, Globe, Heart, MapPin, MessageCircle, Navigation, Phone, Share2, Store as StoreIcon, Tag } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { StoresMap } from "@/components/map";
import { FeaturedTag } from "@/components/store/StoreCard";
import { CategoryChip, OpenStatus, StoreCover, StoreLogo, useNow } from "@/components/store/StoreVisuals";
import { Badge, Rating } from "@/components/ui/Badges";
import { ButtonLink } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { assetUrl } from "@/lib/assetUrl";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store, StoreItem } from "@/lib/types";
import { directionsUrl, formatPhone, formatPrice, formatWeek, telUrl, whatsappUrl, type Horarios } from "@/shared";
import { CouponsSection } from "./CouponsSection";
import { ReviewsSection } from "./ReviewsSection";

type EventKind = "whatsapp" | "rota" | "telefone";

export function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { showError, toast } = useFeedback();

  const { data, error, initialLoading, reload } = useQuery(async () => {
    const sb = supabaseBrowser();
    const [store, items] = await Promise.all([
      sb.from("stores").select("*").eq("id", id).maybeSingle(),
      sb.from("store_items").select("*").eq("store_id", id).eq("ativo", true).order("tipo").order("nome"),
    ]);
    return { store: unwrap(store) as Store | null, items: (unwrap(items) ?? []) as StoreItem[] };
  }, [id]);

  const { data: fav, mutate: setFav } = useQuery(
    async () => {
      const { count } = await supabaseBrowser().from("favorites").select("store_id", { count: "exact", head: true }).eq("user_id", user!.id).eq("store_id", id);
      return (count ?? 0) > 0;
    },
    [id, user?.id],
    !!user,
  );

  // Conta a visualização uma vez por abertura.
  const viewed = useRef<string | null>(null);
  useEffect(() => {
    if (!data?.store || viewed.current === id) return;
    viewed.current = id;
    supabaseBrowser().rpc("registrar_evento", { p_store_id: id, p_tipo: "view" }).then(() => {});
  }, [data?.store, id]);

  useEffect(() => {
    if (data?.store) document.title = `${data.store.nome} · EasyPet`;
  }, [data?.store]);

  const track = (tipo: EventKind) => {
    supabaseBrowser().rpc("registrar_evento", { p_store_id: id, p_tipo: tipo }).then(() => {});
  };

  const [favBusy, setFavBusy] = useState(false);
  const toggleFav = async () => {
    if (!user) return router.push(`/entrar?next=/loja/${id}`);
    setFavBusy(true);
    const sb = supabaseBrowser();
    if (fav) {
      const { error } = await sb.from("favorites").delete().eq("user_id", user.id).eq("store_id", id);
      if (error) showError(error);
      else {
        setFav(() => false);
        toast("Removida dos favoritos");
      }
    } else {
      const { error } = await sb.from("favorites").insert({ user_id: user.id, store_id: id });
      if (error) showError(error);
      else {
        setFav(() => true);
        toast("Salva nos favoritos 🧡");
      }
    }
    setFavBusy(false);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: data?.store?.nome, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copiado!");
      }
    } catch {
      /* cancelado */
    }
  };

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} onRetry={reload} /></div>;
  if (initialLoading) return <StoreSkeleton />;
  const store = data?.store;
  if (!store)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon={StoreIcon} title="Loja não encontrada" description="Ela pode ter saído do ar ou o link está incorreto." action={<ButtonLink href="/explorar">Explorar lojas</ButtonLink>} />
      </div>
    );

  const items = data.items;
  const produtos = items.filter((i) => i.tipo === "produto");
  const servicos = items.filter((i) => i.tipo === "servico");

  return (
    <div className="pb-16">
      {/* Capa */}
      <div className="relative h-56 overflow-hidden sm:h-72">
        <StoreCover url={store.capa_url} categoriaId={store.categoria_id} iconSize="size-24" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/10" />
        <div className="absolute inset-x-0 top-0 mx-auto flex max-w-7xl justify-between p-4 sm:px-6">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 rounded-full bg-surface/90 px-3.5 py-2 text-sm font-bold shadow-soft backdrop-blur hover:bg-surface">
            <ArrowLeft className="size-4" /> Voltar
          </button>
          <div className="flex gap-2">
            <button onClick={share} className="grid size-10 place-items-center rounded-full bg-surface/90 shadow-soft backdrop-blur hover:bg-surface" aria-label="Compartilhar">
              <Share2 className="size-5" />
            </button>
            <button
              onClick={toggleFav}
              disabled={favBusy}
              className={cn("flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold shadow-soft backdrop-blur transition", fav ? "bg-primary text-white" : "bg-surface/90 hover:bg-surface")}
            >
              <Heart className={cn("size-5", fav && "fill-white")} /> {fav ? "Favorita" : "Favoritar"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {store.status !== "ativa" && (
          <div className="relative z-10 mt-4 flex items-center gap-3 rounded-card border border-accent bg-accent-50 p-4 text-sm font-semibold">
            <AlertTriangle className="size-5 shrink-0 text-[#c58a00]" />
            Esta loja está com status <b className="uppercase">{store.status}</b> e não aparece para o público.
          </div>
        )}
        {/* Cabeçalho */}
        <div className="relative -mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
          <StoreLogo url={store.logo_url} nome={store.nome} categoriaId={store.categoria_id} className="size-28 border-4 text-3xl sm:size-32" />
          <div className="min-w-0 flex-1 sm:pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryChip id={store.categoria_id} />
              {store.destaque && <FeaturedTag />}
            </div>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{store.nome}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <Rating nota={store.nota_media} total={store.total_avaliacoes} />
              <OpenStatus horarios={store.horarios} aberto24h={store.aberto_24h} className="text-sm" />
              <span className="flex items-center gap-1 text-muted">
                <MapPin className="size-4" /> {store.bairro}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-8">
            {/* Contato no mobile */}
            <div className="lg:hidden">
              <ContactButtons store={store} track={track} />
            </div>

            <section className="card p-6">
              <h2 className="text-lg font-extrabold">Sobre</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-ink/85">{store.descricao || "Esta loja ainda não escreveu uma descrição."}</p>
              {store.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {store.tags.map((t) => (
                    <Badge key={t} tone="secondary">
                      <Tag className="size-3" /> {t}
                    </Badge>
                  ))}
                </div>
              )}
            </section>

            {(servicos.length > 0 || produtos.length > 0) && (
              <section>
                <h2 className="mb-4 text-xl font-extrabold">Produtos e serviços</h2>
                <ItemsTabs servicos={servicos} produtos={produtos} />
              </section>
            )}

            <CouponsSection storeId={store.id} />
            <ReviewsSection storeId={store.id} nota={Number(store.nota_media)} total={store.total_avaliacoes} onChanged={reload} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="hidden lg:block">
              <ContactButtons store={store} track={track} />
            </div>
            <div className="card overflow-hidden">
              <div className="h-48">
                <StoresMap stores={[store]} center={{ lat: store.lat, lng: store.lng }} zoom={16} interactive={false} />
              </div>
              <div className="space-y-3 p-5 text-sm">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    {store.endereco} · {store.bairro}
                    <br />
                    <span className="text-muted">
                      {store.cidade} - {store.uf}
                      {store.cep ? ` · ${store.cep}` : ""}
                    </span>
                  </span>
                </div>
                {store.telefone && (
                  <div className="flex gap-3">
                    <Phone className="size-4 shrink-0 text-primary" /> {formatPhone(store.telefone)}
                  </div>
                )}
                {store.instagram && (
                  <a href={`https://instagram.com/${store.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-primary">
                    <AtSign className="size-4 shrink-0 text-primary" /> {store.instagram.startsWith("@") ? store.instagram : `@${store.instagram}`}
                  </a>
                )}
                {store.site && (
                  <a href={store.site.startsWith("http") ? store.site : `https://${store.site}`} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-primary">
                    <Globe className="size-4 shrink-0 text-primary" /> <span className="truncate">{store.site.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
              </div>
            </div>
            <WeekHours horarios={store.horarios as Horarios} aberto24h={store.aberto_24h} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function ContactButtons({ store, track }: { store: Store; track: (t: EventKind) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {store.whatsapp ? (
        <a
          href={whatsappUrl(store.whatsapp, store.nome)}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("whatsapp")}
          className="col-span-3 flex h-13 items-center justify-center gap-2 rounded-full bg-[#25D366] font-extrabold text-white shadow-[0_6px_16px_rgba(37,211,102,.35)] transition hover:brightness-95"
        >
          <MessageCircle className="size-5" /> Chamar no WhatsApp
        </a>
      ) : null}
      {store.telefone && (
        <a href={telUrl(store.telefone)} onClick={() => track("telefone")} className="col-span-3 flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface font-bold transition hover:bg-primary-50 sm:col-span-1 lg:col-span-1">
          <Phone className="size-4" /> Ligar
        </a>
      )}
      <a
        href={directionsUrl(store.lat, store.lng)}
        target="_blank"
        rel="noreferrer"
        onClick={() => track("rota")}
        className={cn(
          "flex h-11 items-center justify-center gap-2 rounded-full bg-secondary font-bold text-white transition hover:bg-secondary-600",
          store.telefone ? "col-span-3 sm:col-span-2 lg:col-span-2" : "col-span-3",
        )}
      >
        <Navigation className="size-4" /> Como chegar
      </a>
    </div>
  );
}

function WeekHours({ horarios, aberto24h }: { horarios: Horarios; aberto24h: boolean }) {
  const now = useNow();
  return (
    <div className="card p-5">
      <h3 className="mb-3 flex items-center gap-2 font-extrabold">
        <Clock className="size-5 text-primary" /> Horários
      </h3>
      <ul className="space-y-1 text-sm">
        {(now ? formatWeek(horarios, aberto24h) : []).map((d) => (
          <li key={d.dia} className={cn("flex justify-between rounded-lg px-2.5 py-1.5", d.hoje && "bg-primary-50 font-extrabold text-primary-600")}>
            <span>
              {d.dia}
              {d.hoje && " (hoje)"}
            </span>
            <span className={cn(d.texto === "Fechado" && !d.hoje && "text-muted")}>{d.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemsTabs({ servicos, produtos }: { servicos: StoreItem[]; produtos: StoreItem[] }) {
  const [tab, setTab] = useState<"servico" | "produto">(servicos.length ? "servico" : "produto");
  const list = tab === "servico" ? servicos : produtos;
  return (
    <div>
      <div className="mb-4 inline-flex rounded-full border border-line bg-surface p-1">
        {(
          [
            ["servico", `Serviços (${servicos.length})`],
            ["produto", `Produtos (${produtos.length})`],
          ] as const
        ).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("rounded-full px-4 py-1.5 text-sm font-bold transition", tab === k ? "bg-ink text-white" : "text-muted hover:text-ink")}>
            {l}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-muted">Nada cadastrado aqui ainda.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((i) => (
            <div key={i.id} className="card flex gap-3 p-3">
              {i.imagem_url ? (
                <img src={assetUrl(i.imagem_url)!} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-primary-50 text-2xl">{i.tipo === "servico" ? "✂️" : "🛍️"}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-extrabold leading-snug">{i.nome}</div>
                {i.descricao && <p className="mt-0.5 line-clamp-2 text-sm text-muted">{i.descricao}</p>}
                <div className="mt-1.5 font-extrabold text-primary-600">{formatPrice(i.preco_centavos, i.preco_a_partir)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StoreSkeleton() {
  return (
    <div>
      <Skeleton className="h-64 rounded-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-14 flex items-end gap-4">
          <Skeleton className="size-28 rounded-full border-4 border-white" />
          <div className="flex-1 space-y-2 pb-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  );
}
