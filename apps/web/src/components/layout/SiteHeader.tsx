"use client";

import { Crown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useRoleLinks, UserMenu } from "./UserMenu";

const NAV = [
  { href: "/explorar", label: "Explorar" },
  { href: "/cupons", label: "Cupons" },
  { href: "/premium", label: "Premium" },
  { href: "/para-lojistas", label: "Para lojistas" },
];

export function SiteHeader() {
  const { user, loading, isPremium, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const roleLinks = useRoleLinks();

  return (
    <header className="sticky top-0 z-[500] border-b border-line/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo className="max-sm:h-9" />
        </Link>
        <Suspense fallback={<NavLinks pathname="" />}>
          <ActiveNavLinks />
        </Suspense>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {loading ? (
            <div className="skeleton h-10 w-28 rounded-full" />
          ) : user ? (
            <>
              {profile?.role === "cliente" && !isPremium && (
                <ButtonLink href="/premium" variant="premium" size="sm" className="max-lg:hidden">
                  <Crown className="size-4" /> Seja Premium
                </ButtonLink>
              )}
              <UserMenu />
            </>
          ) : (
            <>
              <ButtonLink href="/entrar" variant="ghost" size="sm" className="max-sm:hidden">
                Entrar
              </ButtonLink>
              <ButtonLink href="/cadastro" size="sm">
                Criar conta
              </ButtonLink>
            </>
          )}
          <button className="rounded-full p-2 hover:bg-ink/5 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] animate-fade-in overflow-y-auto border-t border-line bg-bg px-4 pb-4 pt-2 shadow-lift md:hidden">
          {[...NAV, ...(user ? roleLinks : [{ href: "/entrar", label: "Entrar" }])]
            .filter((n, i, all) => all.findIndex((x) => x.href === n.href) === i)
            .map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 font-bold hover:bg-primary-50">
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV.map((n) => {
        const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[15px] font-bold transition",
              active ? "bg-primary-50 text-primary-600" : "text-ink/80 hover:bg-ink/5 hover:text-ink",
            )}
          >
            {n.href === "/premium" && <Crown className="size-4 text-[#e0a100]" />}
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
