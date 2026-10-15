"use client";

import { ExternalLink, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
}

/** Layout com barra lateral para /painel e /admin. */
export function DashboardShell({ nav, area, extra, children }: { nav: NavItem[]; area: string; extra?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const sidebar = (
    <nav className="flex flex-col gap-1 p-3">
      <Suspense fallback={<SideLinks nav={nav} pathname="" onNavigate={close} />}>
        <ActiveSideLinks nav={nav} onNavigate={close} />
      </Suspense>
      {extra && <div className="mt-4">{extra}</div>}
    </nav>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-[500] flex h-16 items-center gap-4 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
        <button className="rounded-full p-2 hover:bg-ink/5 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
        <Link href="/" className="flex items-center gap-3">
          <Logo size="sm" />
        </Link>
        <span className="hidden rounded-full bg-secondary-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-secondary sm:inline">{area}</span>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/explorar" className="hidden items-center gap-1.5 text-sm font-bold text-muted hover:text-ink sm:flex">
            Ver site <ExternalLink className="size-4" />
          </Link>
          <UserMenu />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:block">
          <div className="sticky top-16">{sidebar}</div>
        </aside>
        {open && (
          <div className="fixed inset-0 top-16 z-[450] lg:hidden">
            <div className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
            <aside className="relative h-full w-72 animate-pop-in bg-surface shadow-lift">{sidebar}</aside>
          </div>
        )}
        <main className="min-w-0 flex-1 bg-bg">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function ActiveSideLinks(props: { nav: NavItem[]; onNavigate: () => void }) {
  return <SideLinks {...props} pathname={usePathname()} />;
}

function SideLinks({ nav, pathname, onNavigate }: { nav: NavItem[]; pathname: string; onNavigate: () => void }) {
  const isActive = (href: string) => (href === nav[0].href ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <>
      {nav.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-bold transition",
            isActive(n.href) ? "bg-primary text-white shadow-[0_6px_16px_rgba(255,107,53,.25)]" : "text-ink/75 hover:bg-primary-50 hover:text-ink",
          )}
        >
          <n.icon className="size-5" />
          <span className="flex-1">{n.label}</span>
          {n.badge}
        </Link>
      ))}
    </>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "primary", hint }: { label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }>; tone?: "primary" | "secondary" | "success" | "accent" | "danger"; hint?: React.ReactNode }) {
  const tones = {
    primary: "bg-primary-50 text-primary-600",
    secondary: "bg-secondary-50 text-secondary",
    success: "bg-success-50 text-success",
    accent: "bg-accent-50 text-[#b07800]",
    danger: "bg-danger-50 text-danger",
  };
  return (
    <div className="card min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-muted">{label}</span>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl sm:size-10", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-2 break-words text-[22px] font-black leading-tight tabular-nums sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs font-semibold text-muted">{hint}</div>}
    </div>
  );
}
