"use client";

import { ChevronDown, Heart, LayoutDashboard, LogOut, PawPrint, Shield, Ticket, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PremiumBadge } from "@/components/ui/Badges";
import { initials } from "@/shared";

export function useRoleLinks() {
  const { profile } = useAuth();
  const role = profile?.role;
  const links: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [];
  if (role === "admin") links.push({ href: "/admin", label: "Painel admin", icon: Shield });
  if (role === "lojista") links.push({ href: "/painel", label: "Painel da loja", icon: LayoutDashboard });
  links.push(
    { href: "/favoritos", label: "Favoritos", icon: Heart },
    { href: "/cupons", label: "Cupons", icon: Ticket },
    { href: "/meus-pets", label: "Meus pets", icon: PawPrint },
    { href: "/conta", label: "Minha conta", icon: User },
  );
  return links;
}

export function Avatar({ nome, className = "size-9 text-sm" }: { nome: string; className?: string }) {
  return <span className={`grid shrink-0 place-items-center rounded-full bg-secondary font-extrabold text-white ${className}`}>{initials(nome || "?") || "?"}</span>;
}

export function UserMenu() {
  const { profile, isPremium, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const links = useRoleLinks();

  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!profile) return null;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 transition hover:border-primary/40">
        <Avatar nome={profile.nome} />
        <span className="hidden max-w-32 truncate text-sm font-bold sm:block">{profile.nome.split(" ")[0]}</span>
        <ChevronDown className="size-4 text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[600] mt-2 w-64 animate-pop-in overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="truncate font-extrabold">{profile.nome}</span>
              {isPremium && <PremiumBadge small />}
            </div>
            <div className="truncate text-xs text-muted">{profile.email}</div>
          </div>
          <div className="p-1.5">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-primary-50">
                <l.icon className="size-4 text-muted" /> {l.label}
              </Link>
            ))}
            <button
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.push("/");
                router.refresh();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger-50"
            >
              <LogOut className="size-4" /> Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
