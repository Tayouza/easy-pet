import type { Metadata } from "next";
import { ItemsManager } from "./ItemsManager";

export const metadata: Metadata = { title: "Produtos e serviços" };

export default function PainelItensPage() {
  return <ItemsManager />;
}
