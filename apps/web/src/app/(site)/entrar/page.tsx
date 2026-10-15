import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <AuthShell title="Que bom te ver! 🐾" subtitle="Entre para salvar favoritos, avaliar lojas e muito mais.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
