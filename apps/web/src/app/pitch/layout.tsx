import type { Metadata } from "next";
import "./pitch.css";

export const metadata: Metadata = {
  title: "Pitch",
  description: "Apresentação do EasyPet para investidores.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
