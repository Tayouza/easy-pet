import type { Metadata } from "next";
import { BarChart3, MapPin, MessageCircle, Ticket } from "lucide-react";
import { PlansGrid } from "@/components/store/PlansGrid";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Para lojistas" };

const PERKS = [
  { icon: MapPin, t: "No mapa de quem procura", d: "Seu pin aparece para tutores perto da sua loja, filtrados por categoria e serviço." },
  { icon: MessageCircle, t: "Contato direto", d: "WhatsApp, telefone e rota em um toque — sem intermediários e sem comissão." },
  { icon: Ticket, t: "Cupons que trazem clientes", d: "Crie cupons exclusivos para os assinantes Premium do EasyPet." },
  { icon: BarChart3, t: "Estatísticas reais", d: "Acompanhe visualizações, cliques no WhatsApp, rotas e favoritos." },
];

export default function ParaLojistasPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <span className="inline-flex rounded-full bg-primary-50 px-3.5 py-1.5 text-sm font-bold text-primary-600">Para lojistas</span>
          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Sua loja no mapa de <span className="text-primary">milhares de tutores</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">Pet shop, clínica, banho e tosa, hotel, adestramento… Cadastre-se em minutos e comece a receber contatos de quem está perto.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/cadastro?perfil=lojista" size="lg">
              Cadastrar minha loja
            </ButtonLink>
            <ButtonLink href="#planos" variant="outline" size="lg">
              Ver planos
            </ButtonLink>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {PERKS.map((p) => (
          <div key={p.t} className="card p-6">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary text-white">
              <p.icon className="size-6" />
            </span>
            <h3 className="mt-4 text-lg font-extrabold">{p.t}</h3>
            <p className="mt-1 text-sm text-muted">{p.d}</p>
          </div>
        ))}
      </section>
      <section id="planos" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">Planos simples, sem fidelidade</h2>
        <p className="mt-2 text-center text-muted">Comece no Básico e faça upgrade quando quiser.</p>
        <div className="mt-10">
          <PlansGrid />
        </div>
      </section>
    </div>
  );
}
