import type { Metadata } from "next";
import { PresenterClient } from "@/components/pitch/client";

export const metadata: Metadata = { title: "Modo apresentador · EasyPet" };

export default function PresenterPage() {
  return <PresenterClient />;
}
