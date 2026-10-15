import type { Metadata } from "next";
import { CouponsView } from "./CouponsView";

export const metadata: Metadata = { title: "Cupons" };

export default function CuponsPage() {
  return <CouponsView />;
}
