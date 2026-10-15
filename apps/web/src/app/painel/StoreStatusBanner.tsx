"use client";

import { AlertTriangle, Ban, CheckCircle2, Crown, Hourglass } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Store, StorePlan } from "@/lib/types";

export function StoreStatusBanner({ store, plan }: { store: Store; plan: StorePlan | null }) {
  const banners: React.ReactNode[] = [];
  const box = (tone: string, Icon: React.ComponentType<{ className?: string }>, title: string, text: React.ReactNode, action?: React.ReactNode) => (
    <div key={title} className={cn("flex flex-wrap items-center gap-4 rounded-card border p-4", tone)}>
      <Icon className="size-6 shrink-0" />
      <div className="min-w-0 flex-1 basis-56">
        <div className="font-extrabold">{title}</div>
        <div className="text-sm opacity-85">{text}</div>
      </div>
      {action}
    </div>
  );
  if (store.status === "pendente")
    banners.push(box("border-accent bg-accent-50 text-[#8a5d00]", Hourglass, "Aguardando aprovação", "Nossa equipe está revisando sua loja. Assim que aprovada, ela aparece no mapa para todos."));
  if (store.status === "suspensa")
    banners.push(box("border-danger/30 bg-danger-50 text-danger", Ban, "Loja suspensa", store.motivo_status ? `Motivo: ${store.motivo_status}` : "Sua loja não está visível. Fale com o suporte EasyPet."));
  if (store.status === "recusada")
    banners.push(box("border-danger/30 bg-danger-50 text-danger", AlertTriangle, "Cadastro recusado", store.motivo_status ? `Motivo: ${store.motivo_status}. Ajuste os dados e fale com o suporte.` : "Ajuste os dados da loja e fale com o suporte."));
  if (store.status === "ativa" && plan)
    banners.push(box("border-success/25 bg-success-50 text-success", CheckCircle2, "Sua loja está no ar", <>Visível no mapa do EasyPet · plano {plan.nome}</>, <Link href={`/loja/${store.id}`} className="rounded-full bg-success px-4 py-2 text-sm font-bold text-white">Ver página pública</Link>));
  if (!plan)
    banners.push(
      box(
        "border-primary/25 bg-primary-50 text-primary-600",
        Crown,
        "Escolha um plano",
        "Com um plano ativo você cadastra produtos e serviços, cupons e acompanha suas estatísticas.",
        <Link href="/painel/plano" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white">Ver planos</Link>,
      ),
    );
  return <div className="space-y-3">{banners}</div>;
}
