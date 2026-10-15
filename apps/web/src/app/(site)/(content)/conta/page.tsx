import type { Metadata } from "next";
import { AccountView } from "./AccountView";

export const metadata: Metadata = { title: "Minha conta" };

export default function ContaPage() {
  return <AccountView />;
}
