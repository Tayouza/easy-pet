import { Heart, MapPin, Ticket } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid flex-1 lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-[28rem] rounded-full bg-[#ff9a6b]/40" />
        <div className="relative">
          <div className="grid size-20 place-items-center rounded-3xl bg-white shadow-lift">
            <LogoMark className="h-12" />
          </div>
          <h2 className="mt-8 max-w-sm text-4xl font-black leading-tight">Seu pet merece o melhor — e ele está perto.</h2>
        </div>
        <ul className="relative space-y-4 text-lg font-bold">
          <li className="flex items-center gap-3">
            <MapPin className="size-6" /> Centenas de lugares pet no mapa
          </li>
          <li className="flex items-center gap-3">
            <Heart className="size-6" /> Salve seus favoritos
          </li>
          <li className="flex items-center gap-3">
            <Ticket className="size-6" /> Cupons exclusivos no Premium
          </li>
        </ul>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
