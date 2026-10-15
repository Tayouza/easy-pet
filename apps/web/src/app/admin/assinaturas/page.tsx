import type { Metadata } from "next";
import { SubscriptionsAdmin } from "./SubscriptionsAdmin";

export const metadata: Metadata = { title: "Assinaturas" };

export default function AdminAssinaturasPage() {
  return <SubscriptionsAdmin />;
}
