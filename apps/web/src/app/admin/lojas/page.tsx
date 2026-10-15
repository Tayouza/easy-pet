import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/States";
import { StoresAdmin } from "./StoresAdmin";

export const metadata: Metadata = { title: "Lojas" };

export default function AdminLojasPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <StoresAdmin />
    </Suspense>
  );
}
