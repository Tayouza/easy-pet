import type { Metadata } from "next";
import { StoreForm } from "./StoreForm";

export const metadata: Metadata = { title: "Minha loja" };

export default function PainelLojaPage() {
  return <StoreForm />;
}
