import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/States";
import { StoreDetail } from "./StoreDetail";

export const metadata: Metadata = { title: "Loja" };

export default function LojaPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <StoreDetail />
    </Suspense>
  );
}
