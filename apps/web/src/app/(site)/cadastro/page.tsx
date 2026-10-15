import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <AuthShell title="Crie sua conta" subtitle="É grátis e leva menos de um minuto.">
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
