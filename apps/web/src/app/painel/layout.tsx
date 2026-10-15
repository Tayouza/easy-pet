import type { Metadata } from "next";
import { PainelLayout } from "./PainelContext";

export const metadata: Metadata = { title: { default: "Painel do lojista", template: "%s · Painel EasyPet" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PainelLayout>{children}</PainelLayout>;
}
