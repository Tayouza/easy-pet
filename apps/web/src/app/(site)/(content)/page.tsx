import { ArrowRight, BadgeCheck, Check, Crown, MapPin, MessageCircle, Search, Store, TrendingUp } from "lucide-react";
import Link from "next/link";
import { FeaturedStores, HeroCards, HeroStats, MapPreview } from "@/components/landing/LiveBits";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { BENEFITS } from "@/components/premiumBenefits";
import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CATEGORIES, formatPrice, PREMIUM_PRICE_CENTS } from "@/shared";

const STEPS = [
  { icon: Search, titulo: "Busque", texto: "Diga o que seu pet precisa ou escolha uma categoria. A gente mostra tudo que está por perto." },
  { icon: MapPin, titulo: "Compare no mapa", texto: "Veja distância, horário de funcionamento, avaliações, produtos e serviços de cada lugar." },
  { icon: MessageCircle, titulo: "Fale direto", texto: "Chame no WhatsApp, ligue ou trace a rota com um toque. Simples assim." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-20 size-[420px] rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3.5 py-1.5 text-sm font-bold text-primary-600">
              <MapPin className="size-4" /> Agora em Porto Alegre
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Tudo para o seu pet, <span className="text-primary">pertinho</span> de você.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Pet shops, veterinários, banho e tosa, hotéis, adestradores e muito mais — com horários, avaliações e contato direto no WhatsApp.
            </p>
            <div className="mt-8">
              <HeroSearch />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/explorar?categoria=${c.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <CategoryIcon id={c.id} className="size-4" style={{ color: c.cor }} /> {c.nome}
                </Link>
              ))}
            </div>
            <HeroStats />
          </div>
          <div className="hidden lg:block">
            <HeroCards />
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle kicker="Categorias" title="O que seu pet precisa hoje?" />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/explorar?categoria=${c.id}`}
              className="group card flex min-w-0 flex-col items-start gap-2.5 p-3.5 transition hover:-translate-y-1 hover:shadow-lift sm:flex-row sm:items-center sm:gap-3 sm:p-4"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl transition group-hover:scale-110 sm:size-12" style={{ background: `${c.cor}1f`, color: c.cor }}>
                <CategoryIcon id={c.id} className="size-6" />
              </span>
              <span className="text-[15px] font-extrabold leading-tight [overflow-wrap:anywhere]">{c.nome}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Mapa */}
      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionTitle kicker="Mapa" title="Veja quem está perto, agora." align="left" />
            <p className="mt-4 text-muted">
              Cada cor é uma categoria. Os pins com estrela são lojas em destaque. Filtre por raio, busque por produto ou serviço e descubra quem está aberto agora.
            </p>
            <ul className="mt-6 space-y-3">
              {["Busca por produto, serviço ou bairro", "Distância e horários atualizados", "Rota, WhatsApp e telefone em um toque"].map((t) => (
                <li key={t} className="flex items-center gap-3 font-semibold">
                  <span className="grid size-6 place-items-center rounded-full bg-success-50 text-success">
                    <Check className="size-4" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <MapPreview />
        </div>
      </section>

      {/* Destaques */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle kicker="Bem avaliados" title="Queridinhos dos tutores" align="left" />
          <Link href="/explorar" className="inline-flex items-center gap-1.5 font-extrabold text-secondary hover:underline">
            Ver todos <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-8">
          <FeaturedStores />
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle kicker="Como funciona" title="Três passos e pronto" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.titulo} className="card relative p-7">
              <span className="absolute right-6 top-5 text-6xl font-black text-primary/10">{i + 1}</span>
              <span className="grid size-14 place-items-center rounded-2xl bg-primary text-white shadow-[0_8px_20px_rgba(255,107,53,.3)]">
                <s.icon className="size-7" />
              </span>
              <h3 className="mt-5 text-xl font-extrabold">{s.titulo}</h3>
              <p className="mt-2 text-muted">{s.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium */}
      <section className="px-4 py-16 sm:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-secondary px-6 py-14 text-white sm:px-12">
          <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-accent/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 size-96 rounded-full bg-white/5" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-sm font-extrabold text-ink">
                <Crown className="size-4" /> EasyPet Premium
              </span>
              <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">Mais vantagens para quem ama o seu pet.</h2>
              <p className="mt-4 text-white/75">Cupons de desconto, carteirinha de vacinas, favoritos ilimitados e nenhum anúncio.</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-black">{formatPrice(PREMIUM_PRICE_CENTS)}</span>
                <span className="mb-1.5 font-bold text-white/70">/mês</span>
              </div>
              <ButtonLink href="/premium" variant="premium" size="lg" className="mt-6">
                Quero ser Premium <ArrowRight className="size-5" />
              </ButtonLink>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <div key={b.titulo} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <b.Icon className="size-6 text-accent" />
                  <div className="mt-3 font-extrabold">{b.titulo}</div>
                  <div className="mt-1 text-sm text-white/70">{b.descricao}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lojista */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="card grid items-center gap-8 overflow-hidden p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3.5 py-1.5 text-sm font-bold text-primary-600">
              <Store className="size-4" /> Sou lojista
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Coloque sua loja no mapa de quem procura por você.</h2>
            <p className="mt-3 max-w-xl text-muted">
              Perfil completo, produtos e serviços, cupons, estatísticas de visitas e contatos. Planos a partir de {formatPrice(4990)}/mês.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/cadastro?perfil=lojista" size="lg">
                Cadastrar minha loja
              </ButtonLink>
              <ButtonLink href="/para-lojistas" variant="outline" size="lg">
                Ver planos
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { icon: MapPin, t: "Pin no mapa e perfil completo" },
              { icon: TrendingUp, t: "Estatísticas de visitas e contatos" },
              { icon: BadgeCheck, t: "Destaque no topo das buscas" },
            ].map((x) => (
              <div key={x.t} className="flex items-center gap-3 rounded-2xl bg-bg p-4 font-bold">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
                  <x.icon className="size-5" />
                </span>
                {x.t}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ kicker, title, align = "center" }: { kicker: string; title: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className="text-sm font-extrabold uppercase tracking-[0.14em] text-primary">{kicker}</div>
      <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
