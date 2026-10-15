"use client";

import { Crown, Eye, EyeOff, LayoutDashboard, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { homeForRole, safeNext } from "@/lib/redirects";
import { supabaseBrowser } from "@/lib/supabase/client";

const DEMO = [
  { email: "cliente@easypet.com", label: "Cliente", icon: User },
  { email: "premium@easypet.com", label: "Premium", icon: Crown },
  { email: "lojista@easypet.com", label: "Lojista", icon: LayoutDashboard },
  { email: "admin@easypet.com", label: "Admin", icon: Shield },
];

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (e?: React.FormEvent, creds?: { email: string; senha: string }) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: (creds?.email ?? email).trim(), password: creds?.senha ?? senha });
    if (error) {
      setLoading(false);
      setError(error.message.includes("Invalid login") ? "E-mail ou senha incorretos." : error.message);
      return;
    }
    const profile = await refreshProfile();
    router.replace(safeNext(params.get("next")) ?? homeForRole(profile?.role));
    router.refresh();
  };

  return (
    <div>
      <form onSubmit={login} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="voce@email.com" />
        </div>
        <div>
          <label className="label" htmlFor="senha">
            Senha
          </label>
          <div className="relative">
            <input id="senha" type={show ? "text" : "password"} required autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} className="input pr-11" placeholder="••••••••" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" aria-label="Mostrar senha">
              {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>
        {error && <p className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-bold text-danger">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Entrar
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-extrabold text-secondary hover:underline">
          Criar conta grátis
        </Link>
      </p>

      <div className="mt-10 rounded-card border border-dashed border-line bg-surface/70 p-4">
        <div className="mb-3 text-xs font-extrabold uppercase tracking-wider text-muted">Contas de demonstração</div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              type="button"
              disabled={loading}
              onClick={() => {
                setEmail(d.email);
                setSenha("easypet123");
                login(undefined, { email: d.email, senha: "easypet123" });
              }}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-left text-sm font-bold transition hover:border-primary/50 hover:bg-primary-50 disabled:opacity-50"
            >
              <d.icon className="size-4 text-primary" />
              <span>
                {d.label}
                <span className="block text-[11px] font-semibold text-muted">{d.email}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
