import { Crown, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatRating } from "@/shared";

export function Badge({ children, className, tone = "neutral" }: { children: React.ReactNode; className?: string; tone?: "neutral" | "success" | "danger" | "primary" | "secondary" | "accent" }) {
  const tones = {
    neutral: "bg-ink/5 text-ink",
    success: "bg-success-50 text-success",
    danger: "bg-danger-50 text-danger",
    primary: "bg-primary-50 text-primary-600",
    secondary: "bg-secondary-50 text-secondary",
    accent: "bg-accent-50 text-[#9a6b00]",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", tones[tone], className)}>{children}</span>;
}

export function PremiumBadge({ className, small }: { className?: string; small?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent to-[#ffb020] font-extrabold text-ink", small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs", className)}>
      <Crown className={small ? "size-3" : "size-3.5"} /> Premium
    </span>
  );
}

export function Rating({ nota, total, className }: { nota: number | string; total?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-bold", className)}>
      <Star className="size-4 fill-accent text-accent" />
      {Number(nota) > 0 ? formatRating(nota) : "Novo"}
      {total != null && total > 0 && <span className="font-semibold text-muted">({total})</span>}
    </span>
  );
}

export function Stars({ value, size = "size-4", onChange }: { value: number; size?: string; onChange?: (v: number) => void }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} className="transition hover:scale-110" aria-label={`${n} estrelas`}>
            <Star className={cn(size, n <= value ? "fill-accent text-accent" : "text-line")} />
          </button>
        ) : (
          <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-accent text-accent" : "text-line")} />
        ),
      )}
    </span>
  );
}
