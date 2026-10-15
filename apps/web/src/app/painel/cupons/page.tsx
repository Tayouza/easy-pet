import type { Metadata } from "next";
import { CouponsManager } from "./CouponsManager";

export const metadata: Metadata = { title: "Cupons" };

export default function PainelCuponsPage() {
  return <CouponsManager />;
}
