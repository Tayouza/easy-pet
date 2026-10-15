"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/explorar?q=${encodeURIComponent(q.trim())}` : "/explorar");
      }}
      className="flex w-full max-w-xl items-center gap-2 rounded-full border border-line bg-surface p-2 shadow-lift"
    >
      <Search className="ml-2 size-5 shrink-0 text-muted sm:ml-3" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Banho, vacina, ração…"
        className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted/70"
      />
      <button className="h-11 shrink-0 rounded-full bg-primary px-5 font-extrabold sm:h-12 sm:px-6 text-white transition hover:bg-primary-600">Buscar</button>
    </form>
  );
}
