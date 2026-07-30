import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/uploads.functions";

type Props = {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
};

export function ImageUpload({
  value,
  onChange,
  folder = "products",
  label = "Enviar imagem",
  className,
}: Props) {
  const upload = useServerFn(uploadImage);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await upload({ data: fd });
      onChange(res.url);
      toast.success("Imagem enviada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background hover:bg-secondary text-sm disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "Enviando..." : label}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" /> remover
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP, GIF ou AVIF • máx 5MB</p>
    </div>
  );
}
