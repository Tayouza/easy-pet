"use client";

import { Clock, ExternalLink, ImageIcon, Info, MapPin, Search, Tag, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/dashboard/Shell";
import { LocationPicker } from "@/components/map";
import { Badge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useFeedback } from "@/components/ui/Feedback";
import { cn } from "@/lib/cn";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Store } from "@/lib/types";
import { CATEGORIES, DEFAULT_LOCATION, type Horarios } from "@/shared";
import { usePainel } from "../PainelContext";
import { HoursEditor } from "./HoursEditor";
import { ImageUpload } from "./ImageUpload";

const STATUS_TONE = { ativa: "success", pendente: "accent", suspensa: "danger", recusada: "danger" } as const;

type Form = Pick<
  Store,
  "nome" | "categoria_id" | "descricao" | "endereco" | "bairro" | "cidade" | "uf" | "cep" | "lat" | "lng" | "telefone" | "whatsapp" | "instagram" | "site" | "aberto_24h" | "tags" | "logo_url" | "capa_url"
> & { horarios: Horarios };

function initial(store: Store | null): Form {
  return {
    nome: store?.nome ?? "",
    categoria_id: store?.categoria_id ?? "pet-shop",
    descricao: store?.descricao ?? "",
    endereco: store?.endereco ?? "",
    bairro: store?.bairro ?? "",
    cidade: store?.cidade ?? "Porto Alegre",
    uf: store?.uf ?? "RS",
    cep: store?.cep ?? "",
    lat: store?.lat ?? DEFAULT_LOCATION.lat,
    lng: store?.lng ?? DEFAULT_LOCATION.lng,
    telefone: store?.telefone ?? "",
    whatsapp: store?.whatsapp ?? "",
    instagram: store?.instagram ?? "",
    site: store?.site ?? "",
    aberto_24h: store?.aberto_24h ?? false,
    tags: store?.tags ?? [],
    logo_url: store?.logo_url ?? null,
    capa_url: store?.capa_url ?? null,
    horarios: (store?.horarios as Horarios) ?? { "1": [["09:00", "18:00"]], "2": [["09:00", "18:00"]], "3": [["09:00", "18:00"]], "4": [["09:00", "18:00"]], "5": [["09:00", "18:00"]], "6": [["09:00", "13:00"]] },
  };
}

export function StoreForm() {
  const { user } = useAuth();
  const { store, reload } = usePainel();
  const { toast, showError } = useFeedback();
  const [form, setForm] = useState<Form>(() => initial(store));
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [located, setLocated] = useState(!!store);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const field = (k: "nome" | "descricao" | "endereco" | "bairro" | "cidade" | "uf" | "cep" | "telefone" | "whatsapp" | "instagram" | "site") => ({
    value: (form[k] ?? "") as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value),
  });

  const geocode = async () => {
    const q = [form.endereco, form.bairro, form.cidade, form.uf, "Brasil"].filter(Boolean).join(", ");
    if (!form.endereco) return toast("Preencha o endereço primeiro.", "info");
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as { lat: string; lon: string; display_name: string }[];
      if (!json.length) toast("Endereço não encontrado. Ajuste o texto ou clique no mapa.", "info");
      else {
        setForm((f) => ({ ...f, lat: Number(json[0].lat), lng: Number(json[0].lon) }));
        setLocated(true);
        toast("Localização encontrada! Ajuste o pin se precisar.");
      }
    } catch {
      toast("Não foi possível buscar o endereço agora.", "error");
    } finally {
      setGeocoding(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t) && form.tags.length < 12) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!located) return toast("Confirme a localização da loja no mapa.", "info");
    setSaving(true);
    const clean = <T,>(v: T) => (typeof v === "string" && v.trim() === "" ? null : v);
    const horarios = Object.fromEntries(Object.entries(form.horarios).map(([d, list]) => [d, (list ?? []).filter(([a, b]) => a && b && a < b)]));
    const payload = {
      ...form,
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      cep: clean(form.cep),
      telefone: clean(form.telefone),
      whatsapp: clean(form.whatsapp),
      instagram: clean(form.instagram),
      site: clean(form.site),
      horarios,
    };
    const sb = supabaseBrowser();
    const { error } = store ? await sb.from("stores").update(payload).eq("id", store.id) : await sb.from("stores").insert({ ...payload, owner_id: user.id });
    setSaving(false);
    if (error) return showError(error);
    toast(store ? "Loja atualizada!" : "Loja cadastrada! Agora é aguardar a aprovação 🎉");
    reload();
  };

  return (
    <form onSubmit={save}>
      <PageHeader
        title={store ? "Minha loja" : "Cadastrar loja"}
        subtitle={
          store ? (
            <span className="flex flex-wrap items-center gap-2">
              Status: <Badge tone={STATUS_TONE[store.status]}>{store.status}</Badge>
              <Link href={`/loja/${store.id}`} className="inline-flex items-center gap-1 font-bold text-secondary hover:underline">
                Ver página <ExternalLink className="size-3.5" />
              </Link>
            </span>
          ) : (
            "Preencha os dados abaixo. Sua loja passa por uma aprovação rápida antes de aparecer no mapa."
          )
        }
        action={
          <Button type="submit" loading={saving} size="lg">
            {store ? "Salvar alterações" : "Cadastrar loja"}
          </Button>
        }
      />

      <div className="space-y-6">
        <Section icon={ImageIcon} title="Imagens">
          <div className="relative">
            <ImageUpload kind="capa" value={form.capa_url} onChange={(u) => set("capa_url", u)} className="h-44 w-full sm:h-56" />
            <div className="absolute -bottom-10 left-6">
              <ImageUpload kind="logo" round value={form.logo_url} onChange={(u) => set("logo_url", u)} className="size-24 border-4 border-surface bg-surface" />
            </div>
          </div>
          <p className="mt-12 text-xs text-muted">Capa em formato paisagem (ideal 1200×500) e logo quadrado. Até 5 MB cada. Sem imagem, usamos a cor da categoria.</p>
        </Section>

        <Section icon={Info} title="Dados da loja">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Nome da loja</label>
              <input required className="input" placeholder="Ex.: Patas & Cia Pet Shop" {...field("nome")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Categoria</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => set("categoria_id", c.id)}
                    className={cn("flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition", form.categoria_id === c.id ? "bg-surface" : "border-line bg-bg hover:border-ink/15")}
                    style={form.categoria_id === c.id ? { borderColor: c.cor, color: c.cor } : undefined}
                  >
                    <CategoryIcon id={c.id} className="size-4 shrink-0" style={{ color: c.cor }} />
                    <span className="leading-tight">{c.nome}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Descrição</label>
              <textarea rows={4} className="input resize-y" placeholder="Conte o que sua loja oferece, diferenciais, raças atendidas…" {...field("descricao")} />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" placeholder="(51) 99999-9999" {...field("whatsapp")} />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" placeholder="(51) 3333-3333" {...field("telefone")} />
            </div>
            <div>
              <label className="label">Instagram</label>
              <input className="input" placeholder="@sualoja" {...field("instagram")} />
            </div>
            <div>
              <label className="label">Site</label>
              <input className="input" placeholder="www.sualoja.com.br" {...field("site")} />
            </div>
          </div>
        </Section>

        <Section icon={MapPin} title="Endereço e localização">
          <div className="grid gap-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label className="label">Endereço</label>
              <input required className="input" placeholder="Rua, número" {...field("endereco")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">CEP</label>
              <input className="input" placeholder="90000-000" {...field("cep")} />
            </div>
            <div className="sm:col-span-3">
              <label className="label">Bairro</label>
              <input className="input" {...field("bairro")} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Cidade</label>
              <input className="input" {...field("cidade")} />
            </div>
            <div>
              <label className="label">UF</label>
              <input className="input" maxLength={2} {...field("uf")} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={geocode} loading={geocoding}>
              <Search className="size-4" /> Localizar endereço no mapa
            </Button>
            <span className="text-sm text-muted">Depois, clique no mapa ou arraste o pin para o ponto exato.</span>
          </div>
          <div className="mt-4 h-80 overflow-hidden rounded-2xl border border-line">
            <LocationPicker
              value={{ lat: form.lat, lng: form.lng }}
              categoriaId={form.categoria_id}
              logoUrl={form.logo_url}
              nome={form.nome}
              onChange={(p) => {
                setForm((f) => ({ ...f, lat: p.lat, lng: p.lng }));
                setLocated(true);
              }}
            />
          </div>
          <p className={cn("mt-2 text-xs font-semibold", located ? "text-muted" : "text-[#b07800]")}>
            {located ? `Coordenadas: ${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}` : "Ainda não localizada — use o botão acima ou clique no mapa."}
          </p>
        </Section>

        <Section icon={Clock} title="Horários de funcionamento">
          <HoursEditor value={form.horarios} onChange={(h) => set("horarios", h)} aberto24h={form.aberto_24h} onToggle24h={(v) => set("aberto_24h", v)} />
        </Section>

        <Section icon={Tag} title="Tags">
          <p className="-mt-2 mb-3 text-sm text-muted">Palavras que ajudam na busca: “castração”, “gatos”, “delivery”, “aceita pix”…</p>
          <div className="flex flex-wrap items-center gap-2 rounded-input border border-line bg-surface p-2">
            {form.tags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-secondary-50 py-1 pl-3 pr-1 text-sm font-bold text-secondary">
                {t}
                <button type="button" onClick={() => set("tags", form.tags.filter((x) => x !== t))} className="rounded-full p-0.5 hover:bg-secondary/15" aria-label={`Remover ${t}`}>
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder={form.tags.length ? "Adicionar…" : "Digite e pressione Enter"}
              className="min-w-40 flex-1 bg-transparent px-2 py-1 outline-none"
            />
          </div>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            {store ? "Salvar alterações" : "Cadastrar loja"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold">
        <Icon className="size-5 text-primary" /> {title}
      </h2>
      {children}
    </section>
  );
}
