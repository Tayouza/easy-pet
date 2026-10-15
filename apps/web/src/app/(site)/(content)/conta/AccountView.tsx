"use client";

import { Crown, LayoutDashboard, LogOut, Receipt, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "@/components/layout/UserMenu";
import { Badge, PremiumBadge } from "@/components/ui/Badges";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { PageLoader, Skeleton } from "@/components/ui/States";
import { unwrap, useQuery } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Payment } from "@/lib/types";
import { formatDate, formatPrice } from "@/shared";

const METODO: Record<string, string> = { pix: "Pix", cartao: "Cartão", boleto: "Boleto" };
const ROLE: Record<string, string> = { cliente: "Tutor", lojista: "Lojista", admin: "Administrador" };

export function AccountView() {
  const router = useRouter();
  const { user, profile, isPremium, refreshProfile, signOut } = useAuth();
  const { toast, showError } = useFeedback();
  const [draft, setDraft] = useState<{ nome: string; telefone: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const { data: payments, initialLoading: payLoading, reload: reloadPayments } = useQuery(
    async () => unwrap(await supabaseBrowser().from("payments").select("*").eq("user_id", user!.id).eq("tipo", "premium_cliente").order("created_at", { ascending: false }).limit(12)) as Payment[],
    [user?.id],
    !!user,
  );

  if (!profile) return <PageLoader />;
  const form = draft ?? { nome: profile.nome, telefone: profile.telefone ?? "" };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabaseBrowser().from("profiles").update({ nome: form.nome.trim(), telefone: form.telefone.trim() || null }).eq("id", profile.id);
    setSaving(false);
    if (error) return showError(error);
    await refreshProfile();
    setDraft(null);
    toast("Dados atualizados!");
  };

  const cancel = async () => {
    setCanceling(true);
    const { error } = await supabaseBrowser().rpc("cancelar_premium");
    setCanceling(false);
    if (error) return showError(error);
    await refreshProfile();
    reloadPayments();
    setCancelOpen(false);
    toast("Assinatura cancelada. Sentiremos sua falta!", "info");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <Avatar nome={profile.nome} className="size-16 text-xl" />
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-3xl font-black tracking-tight">
            {profile.nome} {isPremium && <PremiumBadge />}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-muted">
            {profile.email} · <Badge tone="secondary">{ROLE[profile.role]}</Badge>
          </div>
        </div>
      </div>

      {profile.role !== "cliente" && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-secondary/20 bg-secondary-50 p-4">
          <span className="font-bold">{profile.role === "admin" ? "Você é administrador do EasyPet." : "Gerencie sua loja, itens, cupons e plano no painel."}</span>
          <ButtonLink href={profile.role === "admin" ? "/admin" : "/painel"} variant="secondary" size="sm">
            {profile.role === "admin" ? <Shield className="size-4" /> : <LayoutDashboard className="size-4" />} Abrir painel
          </ButtonLink>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <form onSubmit={save} className="card space-y-4 p-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <User className="size-5 text-primary" /> Seus dados
          </h2>
          <div>
            <label className="label">Nome</label>
            <input required className="input" value={form.nome} onChange={(e) => setDraft({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input disabled className="input" value={profile.email} />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input className="input" value={form.telefone} onChange={(e) => setDraft({ ...form, telefone: e.target.value })} placeholder="(51) 99999-9999" />
          </div>
          <Button type="submit" loading={saving} disabled={!draft}>
            Salvar alterações
          </Button>
        </form>

        <div className="space-y-6">
          <div className={`card overflow-hidden ${isPremium ? "border-accent" : ""}`}>
            <div className={isPremium ? "bg-gradient-to-r from-accent to-[#ffb020] p-6" : "p-6"}>
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Crown className="size-5" /> Seu plano
              </h2>
              <div className="mt-2 text-3xl font-black">{isPremium ? "Premium" : "Grátis"}</div>
              {isPremium && (
                <div className="mt-1 text-sm font-semibold text-ink/75">
                  Assinante desde {formatDate(profile.premium_desde)}
                  {profile.premium_ate && ` · renova em ${formatDate(profile.premium_ate)}`}
                </div>
              )}
            </div>
            <div className="p-6 pt-4">
              {isPremium ? (
                <button onClick={() => setCancelOpen(true)} className="text-sm font-bold text-danger hover:underline">
                  Cancelar assinatura
                </button>
              ) : (
                <>
                  <p className="text-sm text-muted">Cupons exclusivos, carteirinha do pet, favoritos ilimitados e sem anúncios por {formatPrice(990)}/mês.</p>
                  <ButtonLink href="/premium" variant="premium" className="mt-4">
                    <Crown className="size-4" /> Seja Premium
                  </ButtonLink>
                </>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <Receipt className="size-5 text-primary" /> Pagamentos
            </h2>
            {payLoading ? (
              <Skeleton className="mt-4 h-16" />
            ) : !payments?.length ? (
              <p className="mt-3 text-sm text-muted">Nenhum pagamento ainda.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2.5">
                    <span>
                      <b>Premium mensal</b>
                      <span className="block text-xs text-muted">
                        {formatDate(p.created_at)} · {METODO[p.metodo]}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <b>{formatPrice(p.valor_centavos)}</b>
                      <Badge tone="success">{p.status}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full text-danger"
            onClick={async () => {
              await signOut();
              router.push("/");
              router.refresh();
            }}
          >
            <LogOut className="size-4" /> Sair da conta
          </Button>
        </div>
      </div>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancelar o Premium?" size="sm">
        <p className="text-muted">Você perde os cupons exclusivos, a carteirinha do pet e volta a ver anúncios. Seus pets continuam salvos caso volte.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="danger" loading={canceling} onClick={cancel}>
            Sim, cancelar
          </Button>
          <Button variant="ghost" onClick={() => setCancelOpen(false)}>
            Manter Premium
          </Button>
        </div>
      </Modal>
    </div>
  );
}
