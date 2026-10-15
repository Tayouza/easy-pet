import type { Metadata } from "next";
import { PetsView } from "./PetsView";

export const metadata: Metadata = { title: "Meus pets" };

export default function MeusPetsPage() {
  return <PetsView />;
}
