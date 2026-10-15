import { AtSign, MapPin } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const COLS = [
  {
    titulo: "Para você",
    links: [
      { href: "/explorar", label: "Explorar o mapa" },
      { href: "/cupons", label: "Cupons" },
      { href: "/premium", label: "EasyPet Premium" },
      { href: "/meus-pets", label: "Carteirinha do pet" },
    ],
  },
  {
    titulo: "Para lojistas",
    links: [
      { href: "/para-lojistas", label: "Planos" },
      { href: "/cadastro?perfil=lojista", label: "Cadastrar minha loja" },
      { href: "/painel", label: "Painel do lojista" },
    ],
  },
  {
    titulo: "EasyPet",
    links: [
      { href: "/entrar", label: "Entrar" },
      { href: "/cadastro", label: "Criar conta" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            A vitrine dos melhores lugares para o seu pet em Porto Alegre. Pet shops, veterinários, banho e tosa, hotéis e muito mais — pertinho de você.
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm text-white/60">
            <MapPin className="size-4 text-primary" /> Porto Alegre · RS
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.titulo}>
            <h4 className="mb-3 font-extrabold text-white">{c.titulo}</h4>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/50 sm:flex-row sm:px-6">
          <span>© {2026} EasyPet. Feito com 🧡 para pets e seus humanos.</span>
          <span className="flex items-center gap-1.5">
            <AtSign className="size-4" /> @easypet.poa
          </span>
        </div>
      </div>
    </footer>
  );
}
