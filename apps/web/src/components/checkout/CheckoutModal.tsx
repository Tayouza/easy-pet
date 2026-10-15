"use client";

import confetti from "canvas-confetti";
import { Check, Copy, CreditCard, Loader2, Lock, QrCode, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type { PaymentMethod } from "@/lib/types";
import { formatPrice, onlyDigits } from "@/shared";
import { FakeQr } from "./FakeQr";

type Step = "metodo" | "processando" | "sucesso";

export function CheckoutModal({
  open,
  onClose,
  title,
  itemLabel,
  amountCents,
  onPay,
  success,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  itemLabel: string;
  amountCents: number;
  /** Chama a RPC; deve lançar em caso de erro. */
  onPay: (metodo: PaymentMethod) => Promise<void>;
  success: { title: string; text: string; action: React.ReactNode };
}) {
  const [step, setStep] = useState<Step>("metodo");
  const [metodo, setMetodo] = useState<"pix" | "cartao">("pix");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [card, setCard] = useState({ numero: "", nome: "", validade: "", cvv: "" });

  // Reinicia ao abrir de novo
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("metodo");
      setError(null);
      setCopied(false);
    }
  }

  const pixCode = useMemo(
    () => `00020126580014BR.GOV.BCB.PIX0136easypet-${amountCents}-${title.length}5204000053039865406${(amountCents / 100).toFixed(2)}5802BR5907EASYPET6012PORTO ALEGRE62070503***6304A1B2`,
    [amountCents, title],
  );

  useEffect(() => {
    if (step !== "sucesso") return;
    const colors = ["#FF6B35", "#FFC857", "#127475", "#2E9E5B", "#E85D9A"];
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors, zIndex: 2000 });
    const t = setTimeout(() => confetti({ particleCount: 90, spread: 120, origin: { y: 0.5 }, colors, zIndex: 2000 }), 350);
    return () => clearTimeout(t);
  }, [step]);

  const cardValid = onlyDigits(card.numero).length >= 15 && card.nome.trim().length > 2 && /^\d{2}\/\d{2}$/.test(card.validade) && onlyDigits(card.cvv).length >= 3;

  const pay = async () => {
    setError(null);
    setStep("processando");
    try {
      await Promise.all([onPay(metodo), new Promise((r) => setTimeout(r, 1500))]);
      setStep("sucesso");
    } catch (e) {
      setError((e as { message?: string })?.message ?? "Pagamento não aprovado");
      setStep("metodo");
    }
  };

  const maskCard = (v: string) => onlyDigits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const maskExp = (v: string) => {
    const d = onlyDigits(v).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <Modal open={open} onClose={onClose} size="md" hideClose={step === "processando"} title={step === "metodo" ? title : undefined}>
      {step === "metodo" && (
        <div>
          <div className="flex items-center justify-between rounded-2xl bg-bg p-4">
            <div>
              <div className="text-sm text-muted">Você está assinando</div>
              <div className="font-extrabold">{itemLabel}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">{formatPrice(amountCents)}</div>
              <div className="text-xs text-muted">por mês</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-full border border-line bg-bg p-1">
            {(
              [
                ["pix", "Pix", QrCode],
                ["cartao", "Cartão", CreditCard],
              ] as const
            ).map(([k, l, Icon]) => (
              <button key={k} onClick={() => setMetodo(k)} className={cn("flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-extrabold transition", metodo === k ? "bg-surface shadow-soft" : "text-muted")}>
                <Icon className="size-4" /> {l}
              </button>
            ))}
          </div>

          {metodo === "pix" ? (
            <div className="mt-5 flex flex-col items-center text-center">
              <div className="rounded-2xl border border-line p-3">
                <FakeQr seed={pixCode} />
              </div>
              <p className="mt-3 text-sm text-muted">Escaneie o QR Code no app do seu banco ou use o Pix copia e cola:</p>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(pixCode).catch(() => {});
                  setCopied(true);
                }}
                className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-line bg-bg px-3 py-2.5 text-left"
              >
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted">{pixCode}</span>
                <span className={cn("flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold text-white", copied ? "bg-success" : "bg-secondary")}>
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />} {copied ? "Copiado" : "Copiar"}
                </span>
              </button>
              <Button className="mt-5 w-full" size="lg" onClick={pay}>
                Já paguei
              </Button>
            </div>
          ) : (
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (cardValid) pay();
              }}
            >
              <div>
                <label className="label">Número do cartão</label>
                <input className="input font-mono" inputMode="numeric" placeholder="0000 0000 0000 0000" value={card.numero} onChange={(e) => setCard({ ...card, numero: maskCard(e.target.value) })} />
              </div>
              <div>
                <label className="label">Nome impresso</label>
                <input className="input uppercase" placeholder="NOME COMO NO CARTÃO" value={card.nome} onChange={(e) => setCard({ ...card, nome: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Validade</label>
                  <input className="input font-mono" inputMode="numeric" placeholder="MM/AA" value={card.validade} onChange={(e) => setCard({ ...card, validade: maskExp(e.target.value) })} />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input className="input font-mono" inputMode="numeric" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: onlyDigits(e.target.value).slice(0, 4) })} />
                </div>
              </div>
              <Button type="submit" className="mt-2 w-full" size="lg" disabled={!cardValid}>
                <Lock className="size-4" /> Pagar {formatPrice(amountCents)}
              </Button>
            </form>
          )}
          {error && <p className="mt-3 rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm font-bold text-danger">{error}</p>}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-4 text-success" /> Ambiente de demonstração — nenhuma cobrança real.
          </p>
        </div>
      )}

      {step === "processando" && (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="relative grid size-20 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <Loader2 className="size-12 animate-spin text-primary" />
          </div>
          <h3 className="mt-6 text-xl font-extrabold">Processando pagamento…</h3>
          <p className="mt-1 text-muted">Só um instante 🐾</p>
        </div>
      )}

      {step === "sucesso" && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="grid size-20 animate-pop-in place-items-center rounded-full bg-success text-white shadow-[0_10px_30px_rgba(46,158,91,.35)]">
            <Check className="size-10" strokeWidth={3} />
          </div>
          <h3 className="mt-6 text-2xl font-black">{success.title}</h3>
          <p className="mt-2 max-w-sm text-muted">{success.text}</p>
          <div className="mt-6 flex w-full flex-col gap-2">{success.action}</div>
        </div>
      )}
    </Modal>
  );
}
