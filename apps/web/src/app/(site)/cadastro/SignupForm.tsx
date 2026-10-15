"use client";

import { Check, PawPrint, Store } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { supabaseBrowser } from "@/lib/supabase/client";

type Perfil = "cliente" | "lojista";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshProfile } = useAuth();
  const [perfil, setPerfil] = useState<Perfil>(params.get("perfil") === "lojista" ? "lojista" : "cliente");
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.senha.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");
    setLoading(true);
    setError(null);
    const { data, error } = await supabaseBrowser().auth.signUp({
      email: form.email.trim(),
      password: form.senha,
      options: { data: { nome: form.nome.trim(), telefone: form.telefone.trim() || null, role: perfil } },
    });
    if (error) {
      setLoading(false);
      setError(error.message.includes("already registered") ? "Este e-mail já tem conta. Que tal entrar?" : error.message);
      return;
    }
    if (!data.session) {
      setLoading(false);
      setCheckEmail(true);
      return;
    }
    await refreshProfile();
    router.replace(perfil === "lojista" ? "/painel/loja" : "/explorar");
    router.refresh();
  };

  if (checkEmail)
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-success-50 text-success">
          <Check className="size-7" />
        </div>
        <h2 className="text-xl font-extrabold">Confirme seu e-mail</h2>
        <p className="mt-2 text-muted">Enviamos um link para {form.email}. Depois é só entrar.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { id: "cliente", icon: PawPrint, t: "Sou tutor", d: "Quero encontrar lugares para meu pet" },
            { id: "lojista", icon: Store, t: "Sou lojista", d: "Quero divulgar minha loja" },
          ] as const
        ).map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPerfil(o.id)}
            className={cn("relative rounded-card border-2 p-4 text-left transition", perfil === o.id ? "border-primary bg-primary-50" : "border-line bg-surface hover:border-primary/30")}
          >
            {perfil === o.id && (
              <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-white">
                <Check className="size-3.5" />
              </span>
            )}
            <o.icon className={cn("size-7", perfil === o.id ? "text-primary" : "text-muted")} />
            <div className="mt-2 font-extrabold">{o.t}</div>
            <div className="text-xs text-muted">{o.d}</div>
          </button>
        ))}
      </div>
      <div>
        <label className="label">{perfil === "lojista" ? "Seu nome (responsável)" : "Seu nome"}</label>
        <input required value={form.nome} onChange={set("nome")} className="input" placeholder="Como podemos te chamar?" autoComplete="name" />
      </div>
      <div>
        <label className="label">E-mail</label>
        <input required type="email" value={form.email} onChange={set("email")} className="input" placeholder="voce@email.com" autoComplete="email" />
      </div>
      <div>
        <label className="label">Telefone {perfil === "cliente" && <span className="font-semibold text-muted">(opcional)</span>}</label>
        <input required={perfil === "lojista"} value={form.telefone} onChange={set("telefone")} className="input" placeholder="(51) 99999-9999" autoComplete="tel" />
      </div>
      <div>
        <label className="label">Senha</label>
        <input required type="password" value={form.senha} onChange={set("senha")} className="input" placeholder="Mínimo de 6 caracteres" autoComplete="new-password" />
      </div>
      {error && <p className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-bold text-danger">{error}</p>}
      <Button type="submit" loading={loading} size="lg" className="w-full">
        {perfil === "lojista" ? "Criar conta e cadastrar loja" : "Criar minha conta"}
      </Button>
      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-extrabold text-secondary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
