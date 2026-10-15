"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideClose?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !hideClose && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, hideClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[2px]" onClick={hideClose ? undefined : onClose} />
      <div
        className={cn(
          "relative max-h-[92vh] w-full animate-pop-in overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-lift sm:rounded-3xl",
          { sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-lg", xl: "sm:max-w-2xl" }[size],
        )}
      >
        {(title || !hideClose) && (
          <div className="mb-4 flex items-start justify-between gap-4">
            {title ? <h2 className="text-xl font-extrabold leading-tight">{title}</h2> : <span />}
            {!hideClose && (
              <button onClick={onClose} className="-m-1 rounded-full p-1.5 text-muted transition hover:bg-ink/5 hover:text-ink" aria-label="Fechar">
                <X className="size-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
