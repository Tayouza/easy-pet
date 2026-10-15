"use client";

import { Copy, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { WEEKDAYS, type Horarios } from "@/shared";

type Day = keyof Horarios;
const ORDER: Day[] = ["1", "2", "3", "4", "5", "6", "0"];

export function HoursEditor({ value, onChange, aberto24h, onToggle24h }: { value: Horarios; onChange: (h: Horarios) => void; aberto24h: boolean; onToggle24h: (v: boolean) => void }) {
  const set = (d: Day, list: [string, string][]) => onChange({ ...value, [d]: list });
  const copyToWeek = () => {
    const seg = value["1"] ?? [];
    onChange({ ...value, "2": seg.map((i) => [...i] as [string, string]), "3": seg.map((i) => [...i] as [string, string]), "4": seg.map((i) => [...i] as [string, string]), "5": seg.map((i) => [...i] as [string, string]) });
  };
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-3 font-bold">
          <span className={cn("relative h-6 w-11 rounded-full transition", aberto24h ? "bg-success" : "bg-line")}>
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", aberto24h ? "left-[22px]" : "left-0.5")} />
          </span>
          <input type="checkbox" className="sr-only" checked={aberto24h} onChange={(e) => onToggle24h(e.target.checked)} />
          Aberto 24 horas
        </label>
        {!aberto24h && (
          <button type="button" onClick={copyToWeek} className="flex items-center gap-1.5 text-sm font-bold text-secondary hover:underline">
            <Copy className="size-4" /> Copiar segunda para terça–sexta
          </button>
        )}
      </div>
      {!aberto24h && (
        <div className="divide-y divide-line rounded-2xl border border-line">
          {ORDER.map((d) => {
            const list = (value[d] ?? []) as [string, string][];
            return (
              <div key={d} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="w-20 font-bold">{WEEKDAYS[Number(d)]}</span>
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {list.length === 0 && <span className="rounded-full bg-ink/5 px-3 py-1 text-sm font-semibold text-muted">Fechado</span>}
                  {list.map(([a, b], i) => (
                    <span key={i} className="flex items-center gap-1 rounded-full border border-line bg-bg py-1 pl-2 pr-1">
                      <input type="time" value={a} onChange={(e) => set(d, list.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} className="bg-transparent text-sm font-semibold outline-none" />
                      <span className="text-muted">–</span>
                      <input type="time" value={b} onChange={(e) => set(d, list.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} className="bg-transparent text-sm font-semibold outline-none" />
                      <button type="button" onClick={() => set(d, list.filter((_, j) => j !== i))} className="rounded-full p-1 text-muted hover:bg-danger-50 hover:text-danger" aria-label="Remover intervalo">
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => set(d, [...list, list.length ? ["14:00", "18:00"] : ["09:00", "18:00"]])}
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold text-secondary hover:bg-secondary-50"
                  >
                    <Plus className="size-4" /> {list.length ? "Intervalo" : "Abrir"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
