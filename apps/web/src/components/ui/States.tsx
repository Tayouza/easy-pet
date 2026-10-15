import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-6 animate-spin text-primary", className)} />;
}

export function PageLoader({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner className="size-8" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/60 px-6 py-12 text-center", className)}>
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-primary-50 text-primary">
        <Icon className="size-8" />
      </div>
      <h3 className="text-lg font-extrabold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-danger/20 bg-danger-50 px-6 py-10 text-center">
      <AlertTriangle className="mb-3 size-8 text-danger" />
      <h3 className="font-extrabold">Não foi possível carregar</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{message ?? "Verifique sua conexão e tente novamente."}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-full bg-surface px-4 py-2 text-sm font-bold text-danger shadow-soft hover:bg-white">
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}
