import type { Metadata } from "next";
import { PremiumView } from "./PremiumView";

export const metadata: Metadata = { title: "Premium" };

export default function PremiumPage() {
  return <PremiumView />;
}
