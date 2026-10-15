"use client";

import { CheckCircle2, Crown, Info, Lock, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { toFriendlyError, type FriendlyError } from "@/shared";
import { Button } from "./Button";
import { Modal } from "./Modal";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface FeedbackValue {
  toast: (message: string, kind?: ToastKind) => void;
  /** Mostra modal amigável para erros de regra de negócio (LIMITE_*, PLANO_*) ou toast para os demais. */
  showError: (err: unknown) => FriendlyError;
}

const FeedbackContext = createContext<FeedbackValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<FriendlyError | null>(null);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const showError = useCallback(
    (err: unknown) => {
      const fe = toFriendlyError(err);
      if (fe.code === "GENERICO") toast(fe.mensagem, "error");
      else setModal(fe);
      return fe;
    },
    [toast],
  );

  const value = useMemo(() => ({ toast, showError }), [toast, showError]);
  const premium = modal?.cta?.destino === "premium";

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[1100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex max-w-md animate-pop-in items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-lift",
              t.kind === "success" && "bg-ink",
              t.kind === "error" && "bg-danger",
              t.kind === "info" && "bg-secondary",
            )}
          >
            {t.kind === "success" && <CheckCircle2 className="size-5 shrink-0 text-[#7be0a5]" />}
            {t.kind === "error" && <XCircle className="size-5 shrink-0" />}
            {t.kind === "info" && <Info className="size-5 shrink-0" />}
            {t.message}
          </div>
        ))}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} size="sm">
        {modal && (
          <div className="text-center">
            <div className={cn("mx-auto mb-4 grid size-16 place-items-center rounded-full", premium ? "bg-accent-50 text-[#c58a00]" : "bg-primary-50 text-primary")}>
              {premium ? <Crown className="size-8" /> : <Lock className="size-8" />}
            </div>
            <h2 className="text-xl font-extrabold">{modal.titulo}</h2>
            <p className="mt-2 text-muted">{modal.mensagem}</p>
            <div className="mt-6 flex flex-col gap-2">
              {modal.cta && (
                <Button
                  variant={premium ? "premium" : "primary"}
                  onClick={() => {
                    setModal(null);
                    router.push(premium ? "/premium" : "/painel/plano");
                  }}
                >
                  {modal.cta.label}
                </Button>
              )}
              <Button variant="ghost" onClick={() => setModal(null)}>
                Agora não
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback precisa estar dentro de <FeedbackProvider>");
  return ctx;
}
