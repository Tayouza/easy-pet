import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/States";
import { Explorer } from "./Explorer";

export const metadata: Metadata = { title: "Explorar" };

export default function ExplorarPage() {
  return (
    <Suspense fallback={<PageLoader label="Abrindo o mapa…" />}>
      <Explorer />
    </Suspense>
  );
}
