"use client";

import { Check, Crown, Minus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { BENEFITS } from "@/components/premiumBenefits";
import { Button, ButtonLink } from "@/components/ui/Button";
import { unwrap } from "@/lib/hooks";
import { supabaseBrowser } from "@/lib/supabase/client";
import { FREE_FAVORITES_LIMIT, formatDate, formatPrice, PREMIUM_PRICE_CENTS } from "@/shared";

const COMPARE: { item: string; free: string | boolean; premium: string | boolean }[] = [
  { item: "Mapa e busca de lojas", free: true, premium: true },
  { item: "Avaliar lojas", free: true, premium: true },
  { item: "Favoritos", free: `Até ${FREE_FAVORITES_LIMIT}`, premium: "Ilimitados" },
  { item: "Anúncios patrocinados", free: "Sim", premium: "Nenhum" },
  { item: "Cupons de desconto", free: false, premium: true },
  { item: "Filtros: aberto agora e melhor avaliadas", free: false, premium: true },
  { item: "Carteirinha digital do pet", free: false, premium: true },
  { item: "Selo Premium no perfil", free: false, premium: true },
];

export function PremiumView() {
  const router = useRouter();
  const { user, profile, isPremium, refreshProfile, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const start = () => {
    if (!user) return router.push("/entrar?next=/premium");
    setOpen(true);
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-secondary text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[30rem] rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-[26rem] rounded-full bg-white/5" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-sm font-extrabold text-ink">
              <Crown className="size-4" /> EasyPet Premium
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">Mimo pro seu pet, economia pra você.</h1>
            <p className="mt-5 max-w-lg text-lg text-white/75">Cupons exclusivos nas lojas parceiras, carteirinha de vacinas, favoritos ilimitados e zero anúncios.</p>
          </div>
          <div className="rounded-[28px] bg-surface p-8 text-ink shadow-lift">
            {isPremium ? (
              <div className="text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-ink">
                  <Crown className="size-8" />
                </div>
                <h2 className="mt-4 text-2xl font-black">Você já é Premium! 🎉</h2>
                <p className="mt-2 text-muted">{profile?.premium_ate ? `Sua assinatura está ativa até ${formatDate(profile.premium_ate)}.` : "Sua assinatura está ativa."}</p>
                <div className="mt-6 flex flex-col gap-2">
                  <ButtonLink href="/cupons">Ver meus cupons</ButtonLink>
                  <ButtonLink href="/conta" variant="outline">
                    Gerenciar assinatura
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm font-extrabold uppercase tracking-wider text-muted">Assinatura mensal</div>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-5xl font-black">{formatPrice(PREMIUM_PRICE_CENTS)}</span>
                  <span className="mb-1.5 font-bold text-muted">/mês</span>
                </div>
                <p className="mt-1 text-sm text-muted">Cancele quando quiser, sem multa.</p>
                <ul className="mt-6 space-y-2.5">
                  {BENEFITS.map((b) => (
                    <li key={b.titulo} className="flex items-center gap-3 font-semibold">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success-50 text-success">
                        <Check className="size-4" />
                      </span>
                      {b.titulo}
                    </li>
                  ))}
                </ul>
                <Button variant="premium" size="lg" className="mt-7 w-full" onClick={start} disabled={loading}>
                  <Sparkles className="size-5" /> {user ? "Assinar agora" : "Entrar para assinar"}
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-black tracking-tight">Tudo que você ganha</h2>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.titulo} className="card p-4 sm:p-6">
              <span className="grid size-10 place-items-center rounded-2xl bg-accent-50 text-[#c58a00] sm:size-12">
                <b.Icon className="size-5 sm:size-6" />
              </span>
              <h3 className="mt-3 font-extrabold sm:mt-4 sm:text-lg">{b.titulo}</h3>
              <p className="mt-1 text-sm text-muted sm:text-base">{b.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h2 className="text-center text-3xl font-black tracking-tight">Grátis × Premium</h2>
        <div className="card mt-8 overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_110px] bg-bg px-5 py-3 text-sm font-extrabold sm:grid-cols-[1fr_140px_140px]">
            <span>Recurso</span>
            <span className="text-center text-muted">Grátis</span>
            <span className="text-center text-[#c58a00]">Premium</span>
          </div>
          {COMPARE.map((r) => (
            <div key={r.item} className="grid grid-cols-[1fr_100px_110px] items-center border-t border-line px-5 py-3.5 text-sm sm:grid-cols-[1fr_140px_140px]">
              <span className="font-semibold">{r.item}</span>
              <Cell v={r.free} />
              <Cell v={r.premium} strong />
            </div>
          ))}
        </div>
      </section>

      <CheckoutModal
        open={open}
        onClose={() => setOpen(false)}
        title="Assinar Premium"
        itemLabel="EasyPet Premium · mensal"
        amountCents={PREMIUM_PRICE_CENTS}
        onPay={async (metodo) => {
          unwrap(await supabaseBrowser().rpc("assinar_premium", { p_metodo: metodo }));
          await refreshProfile();
        }}
        success={{
          title: "Bem-vindo ao Premium!",
          text: "Seus cupons já estão desbloqueados e os anúncios sumiram. Aproveite!",
          action: (
            <>
              <ButtonLink href="/cupons" variant="premium">
                Ver cupons exclusivos
              </ButtonLink>
              <ButtonLink href="/meus-pets" variant="outline">
                Criar a carteirinha do meu pet
              </ButtonLink>
            </>
          ),
        }}
      />
    </div>
  );
}

function Cell({ v, strong }: { v: string | boolean; strong?: boolean }) {
  if (v === true)
    return (
      <span className="flex justify-center">
        <Check className={strong ? "size-5 text-success" : "size-5 text-muted"} />
      </span>
    );
  if (v === false)
    return (
      <span className="flex justify-center">
        <Minus className="size-5 text-line" />
      </span>
    );
  return <span className={`text-center ${strong ? "font-extrabold" : "text-muted"}`}>{v}</span>;
}
