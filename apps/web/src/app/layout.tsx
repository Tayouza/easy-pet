import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { FeedbackProvider } from "@/components/ui/Feedback";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "EasyPet — tudo para o seu pet, pertinho de você",
    template: "%s · EasyPet",
  },
  description: "Encontre pet shops, veterinários, banho e tosa, hotéis e muito mais perto de você em Porto Alegre.",
};

export const viewport: Viewport = {
  themeColor: "#FF6B35",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <FeedbackProvider>{children}</FeedbackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
