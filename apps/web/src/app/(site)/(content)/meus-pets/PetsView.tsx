"use client";

import { CalendarClock, Crown, IdCard, Pencil, PawPrint, Plus, Syringe, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, PageLoader, Skeleton } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Pet, PetVaccine } from "@/lib/types";
import { formatDate } from "@/shared";

type PetWithVaccines = Pet & { pet_vaccines: PetVaccine[] };

const ESPECIES = ["Cachorro", "Gato", "Pássaro", "Peixe", "Roedor", "Réptil", "Outro"];
const EMOJI: Record<string, string> = { Cachorro: "🐶", Gato: "🐱", Pássaro: "🐦", Peixe: "🐠", Roedor: "🐹", Réptil: "🦎" };
const CARD_COLORS = ["from-primary to-[#ff9a6b]", "from-secondary to-[#2aa3a4]", "from-[#8E5CD9] to-[#b48ae8]", "from-[#2B7FFF] to-[#6aa6ff]"];

function daysUntil(date: string) {
  const d = new Date(`${date}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

function age(nascimento: string | null) {
  if (!nascimento) return null;
  const n = new Date(`${nascimento}T12:00:00`);
  const now = new Date();
  let m = (now.getFullYear() - n.getFullYear()) * 12 + now.getMonth() - n.getMonth();
  if (now.getDate() < n.getDate()) m--;
  if (m < 12) return `${Math.max(m, 0)} ${m === 1 ? "mês" : "meses"}`;
  const a = Math.floor(m / 12);
  return `${a} ${a === 1 ? "ano" : "anos"}`;
}

function relDays(n: number) {
  if (n === 0) return "hoje";
  if (n === 1) return "amanhã";
  if (n > 0) return `em ${n} dias`;
  return `atrasada há ${-n} ${n === -1 ? "dia" : "dias"}`;
}

export function PetsView() {
  const { user, isPremium, loading } = useAuth();
  const { toast, showError } = useFeedback();
  const { data, error, initialLoading, reload } = useQuery(
    async () => unwrap(await supabaseBrowser().from("pets").select("*, pet_vaccines(*)").eq("owner_id", user!.id).order("created_at")) as PetWithVaccines[],
    [user?.id],
    !!user && isPremium,
  );
  const [petForm, setPetForm] = useState<Partial<Pet> | null>(null);
  const [vacForm, setVacForm] = useState<(Partial<PetVaccine> & { pet_id: string }) | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) return <PageLoader />;
  if (!isPremium) return <LockedPets />;

  const pets = data ?? [];
  const upcoming = pets
    .flatMap((p) => p.pet_vaccines.filter((v) => v.proxima_dose).map((v) => ({ pet: p, v, dias: daysUntil(v.proxima_dose!) })))
    .sort((a, b) => a.dias - b.dias);
  const next = upcoming.find((u) => u.dias >= -60);

  const savePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petForm?.nome) return;
    setSaving(true);
    const payload = {
      nome: petForm.nome.trim(),
      especie: petForm.especie || "Cachorro",
      raca: petForm.raca?.trim() || null,
      nascimento: petForm.nascimento || null,
      peso_kg: petForm.peso_kg ? Number(petForm.peso_kg) : null,
    };
    const sb = supabaseBrowser();
    const { error } = petForm.id ? await sb.from("pets").update(payload).eq("id", petForm.id) : await sb.from("pets").insert({ ...payload, owner_id: user!.id });
    setSaving(false);
    if (error) return showError(error);
    toast(petForm.id ? "Pet atualizado!" : `${payload.nome} entrou para a família! 🐾`);
    setPetForm(null);
    reload();
  };

  const deletePet = async (p: Pet) => {
    if (!confirm(`Remover ${p.nome} e todas as vacinas?`)) return;
    const { error } = await supabaseBrowser().from("pets").delete().eq("id", p.id);
    if (error) return showError(error);
    toast("Pet removido");
    reload();
  };

  const saveVac = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacForm?.nome || !vacForm.aplicada_em) return;
    setSaving(true);
    const payload = { pet_id: vacForm.pet_id, nome: vacForm.nome.trim(), aplicada_em: vacForm.aplicada_em, proxima_dose: vacForm.proxima_dose || null };
    const sb = supabaseBrowser();
    const { error } = vacForm.id ? await sb.from("pet_vaccines").update(payload).eq("id", vacForm.id) : await sb.from("pet_vaccines").insert(payload);
    setSaving(false);
    if (error) return showError(error);
    toast("Vacina salva!");
    setVacForm(null);
    reload();
  };

  const deleteVac = async (v: PetVaccine) => {
    const { error } = await supabaseBrowser().from("pet_vaccines").delete().eq("id", v.id);
    if (error) return showError(error);
    reload();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
            <IdCard className="size-8 text-primary" /> Carteirinha do pet
          </h1>
          <p className="mt-1 text-muted">Vacinas e próximas doses de toda a família.</p>
        </div>
        <Button onClick={() => setPetForm({ especie: "Cachorro" })}>
          <Plus className="size-5" /> Adicionar pet
        </Button>
      </div>

      {next && (
        <div className={cn("mt-6 flex items-center gap-4 rounded-card border p-5", next.dias < 0 ? "border-danger/30 bg-danger-50" : next.dias <= 30 ? "border-accent bg-accent-50" : "border-secondary/20 bg-secondary-50")}>
          <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl text-white", next.dias < 0 ? "bg-danger" : next.dias <= 30 ? "bg-[#e0a100]" : "bg-secondary")}>
            <CalendarClock className="size-6" />
          </span>
          <div>
            <div className="text-sm font-bold uppercase tracking-wide text-muted">Próxima dose</div>
            <div className="text-lg font-extrabold">
              {next.v.nome} de {next.pet.nome} · {formatDate(next.v.proxima_dose)} <span className={next.dias < 0 ? "text-danger" : ""}>({relDays(next.dias)})</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : initialLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : pets.length === 0 ? (
          <EmptyState icon={PawPrint} title="Cadastre seu primeiro pet" description="Guarde vacinas, peso e datas importantes. A gente te lembra da próxima dose." action={<Button onClick={() => setPetForm({ especie: "Cachorro" })}>Adicionar pet</Button>} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {pets.map((p, i) => {
              const vacs = [...p.pet_vaccines].sort((a, b) => b.aplicada_em.localeCompare(a.aplicada_em));
              return (
                <div key={p.id} className="card overflow-hidden">
                  <div className={cn("relative bg-gradient-to-br p-6 text-white", CARD_COLORS[i % CARD_COLORS.length])}>
                    <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
                    <div className="relative flex items-start gap-4">
                      <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/90 text-4xl shadow-soft">{EMOJI[p.especie] ?? "🐾"}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold uppercase tracking-[0.15em] text-white/75">Carteirinha EasyPet</div>
                        <div className="truncate text-2xl font-black">{p.nome}</div>
                        <div className="text-sm font-semibold text-white/85">
                          {[p.especie, p.raca].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setPetForm(p)} className="rounded-full bg-white/20 p-2 hover:bg-white/30" aria-label="Editar">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => deletePet(p)} className="rounded-full bg-white/20 p-2 hover:bg-white/30" aria-label="Excluir">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    <div className="relative mt-5 grid grid-cols-3 gap-3 text-sm">
                      <Info label="Idade" value={age(p.nascimento) ?? "—"} />
                      <Info label="Nascimento" value={p.nascimento ? formatDate(p.nascimento) : "—"} />
                      <Info label="Peso" value={p.peso_kg ? `${String(p.peso_kg).replace(".", ",")} kg` : "—"} />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-extrabold">
                        <Syringe className="size-4 text-primary" /> Vacinas
                      </h3>
                      <button onClick={() => setVacForm({ pet_id: p.id })} className="flex items-center gap-1 text-sm font-extrabold text-secondary hover:underline">
                        <Plus className="size-4" /> Registrar
                      </button>
                    </div>
                    {vacs.length === 0 ? (
                      <p className="rounded-xl bg-bg px-4 py-6 text-center text-sm text-muted">Nenhuma vacina registrada.</p>
                    ) : (
                      <ul className="divide-y divide-line">
                        {vacs.map((v) => {
                          const d = v.proxima_dose ? daysUntil(v.proxima_dose) : null;
                          return (
                            <li key={v.id} className="group flex items-center gap-3 py-2.5">
                              <div className="min-w-0 flex-1">
                                <div className="font-bold">{v.nome}</div>
                                <div className="text-xs text-muted">Aplicada em {formatDate(v.aplicada_em)}</div>
                              </div>
                              {d != null && (
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-xs font-extrabold",
                                    d < 0 ? "bg-danger-50 text-danger" : d <= 30 ? "bg-accent-50 text-[#9a6b00]" : "bg-success-50 text-success",
                                  )}
                                >
                                  {formatDate(v.proxima_dose)} · {relDays(d)}
                                </span>
                              )}
                              <span className="flex opacity-0 transition group-hover:opacity-100">
                                <button onClick={() => setVacForm(v)} className="rounded-full p-1.5 text-muted hover:bg-ink/5" aria-label="Editar vacina">
                                  <Pencil className="size-3.5" />
                                </button>
                                <button onClick={() => deleteVac(v)} className="rounded-full p-1.5 text-muted hover:bg-danger-50 hover:text-danger" aria-label="Excluir vacina">
                                  <Trash2 className="size-3.5" />
                                </button>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!petForm} onClose={() => setPetForm(null)} title={petForm?.id ? "Editar pet" : "Novo pet"}>
        {petForm && (
          <form onSubmit={savePet} className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input required className="input" value={petForm.nome ?? ""} onChange={(e) => setPetForm({ ...petForm, nome: e.target.value })} placeholder="Ex.: Luna" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Espécie</label>
                <select className="input" value={petForm.especie ?? "Cachorro"} onChange={(e) => setPetForm({ ...petForm, especie: e.target.value })}>
                  {ESPECIES.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Raça</label>
                <input className="input" value={petForm.raca ?? ""} onChange={(e) => setPetForm({ ...petForm, raca: e.target.value })} placeholder="SRD" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nascimento</label>
                <input type="date" className="input" value={petForm.nascimento ?? ""} onChange={(e) => setPetForm({ ...petForm, nascimento: e.target.value })} />
              </div>
              <div>
                <label className="label">Peso (kg)</label>
                <input type="number" step="0.1" min="0" className="input" value={petForm.peso_kg ?? ""} onChange={(e) => setPetForm({ ...petForm, peso_kg: e.target.value === "" ? null : Number(e.target.value) })} />
              </div>
            </div>
            <Button type="submit" loading={saving} className="w-full">
              Salvar
            </Button>
          </form>
        )}
      </Modal>

      <Modal open={!!vacForm} onClose={() => setVacForm(null)} title={vacForm?.id ? "Editar vacina" : "Registrar vacina"}>
        {vacForm && (
          <form onSubmit={saveVac} className="space-y-4">
            <div>
              <label className="label">Vacina</label>
              <input required list="vacinas" className="input" value={vacForm.nome ?? ""} onChange={(e) => setVacForm({ ...vacForm, nome: e.target.value })} placeholder="Ex.: V10, Antirrábica" />
              <datalist id="vacinas">
                {["V8", "V10", "Antirrábica", "Gripe canina", "Giárdia", "Leishmaniose", "V3 felina", "V4 felina", "V5 felina", "Vermífugo", "Antipulgas"].map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Aplicada em</label>
                <input required type="date" className="input" value={vacForm.aplicada_em ?? ""} onChange={(e) => setVacForm({ ...vacForm, aplicada_em: e.target.value })} />
              </div>
              <div>
                <label className="label">Próxima dose</label>
                <input type="date" className="input" value={vacForm.proxima_dose ?? ""} onChange={(e) => setVacForm({ ...vacForm, proxima_dose: e.target.value })} />
              </div>
            </div>
            <Button type="submit" loading={saving} className="w-full">
              Salvar vacina
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2 backdrop-blur">
      <div className="text-[11px] font-bold uppercase tracking-wide text-white/70">{label}</div>
      <div className="font-extrabold">{value}</div>
    </div>
  );
}

function LockedPets() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="card grid items-center gap-8 overflow-hidden p-8 md:grid-cols-2">
        <div className="relative">
          <div className="rotate-[-3deg] rounded-3xl bg-gradient-to-br from-primary to-[#ff9a6b] p-6 text-white shadow-lift blur-[1.5px]">
            <div className="text-xs font-extrabold uppercase tracking-[0.15em] text-white/75">Carteirinha EasyPet</div>
            <div className="mt-1 text-2xl font-black">Seu pet</div>
            <div className="mt-6 space-y-2">
              {["V10 · próxima em 20 dias", "Antirrábica · em dia", "Vermífugo · em 5 dias"].map((t) => (
                <div key={t} className="rounded-xl bg-white/20 px-3 py-2 text-sm font-bold">
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-accent text-ink shadow-lift">
              <Crown className="size-8" />
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Carteirinha digital do pet</h1>
          <p className="mt-3 text-muted">Registre vacinas, peso e datas importantes de todos os seus pets e veja a próxima dose em destaque. Exclusivo para assinantes Premium.</p>
          <ButtonLink href="/premium" variant="premium" size="lg" className="mt-6">
            <Crown className="size-5" /> Desbloquear com Premium
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
