import type { Metadata } from "next";
import { PlanManager } from "./PlanManager";

export const metadata: Metadata = { title: "Plano e pagamentos" };

export default function PainelPlanoPage() {
  return <PlanManager />;
}
