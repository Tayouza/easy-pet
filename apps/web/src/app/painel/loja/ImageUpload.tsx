"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useFeedback } from "@/components/ui/Feedback";
import { cn } from "@/lib/cn";
import { STORE_IMAGES_BUCKET, supabaseBrowser } from "@/lib/supabase/client";

const MAX = 5 * 1024 * 1024;

/** Upload para o bucket store-images em "<uid>/...". */
export function ImageUpload({ value, onChange, kind, className, round }: { value: string | null; onChange: (url: string | null) => void; kind: "logo" | "capa"; className?: string; round?: boolean }) {
  const { user } = useAuth();
  const { toast } = useFeedback();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) return toast("Envie uma imagem (JPG, PNG ou WebP).", "error");
    if (file.size > MAX) return toast("A imagem precisa ter até 5 MB.", "error");
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const sb = supabaseBrowser();
    const { error } = await sb.storage.from(STORE_IMAGES_BUCKET).upload(path, file, { upsert: true, contentType: file.type });
    setBusy(false);
    if (error) return toast(`Falha no upload: ${error.message}`, "error");
    onChange(sb.storage.from(STORE_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl);
  };

  return (
    <div className={cn("group relative overflow-hidden border-2 border-dashed border-line bg-bg transition hover:border-primary/50", round ? "rounded-full" : "rounded-2xl", className)}>
      {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : null}
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn("absolute inset-0 flex flex-col items-center justify-center gap-1 text-sm font-bold transition", value ? "bg-ink/0 text-transparent group-hover:bg-ink/45 group-hover:text-white" : "text-muted")}
      >
        {busy ? <Loader2 className="size-6 animate-spin text-primary" /> : <ImagePlus className="size-6" />}
        {!round && (value ? "Trocar imagem" : kind === "capa" ? "Enviar foto de capa" : "Enviar logo")}
      </button>
      {value && !busy && (
        <button type="button" onClick={() => onChange(null)} className="absolute right-2 top-2 rounded-full bg-surface/90 p-1.5 text-danger opacity-0 shadow-soft transition group-hover:opacity-100" aria-label="Remover imagem">
          <Trash2 className="size-4" />
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
