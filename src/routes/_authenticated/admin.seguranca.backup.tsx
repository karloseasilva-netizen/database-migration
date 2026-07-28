import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Database } from "lucide-react";
import { backupSnapshot } from "@/lib/admin-extra.functions";

export const Route = createFileRoute("/_authenticated/admin/seguranca/backup")({
  component: BackupPage,
});

function BackupPage() {
  const [busy, setBusy] = useState(false);
  const fn = useServerFn(backupSnapshot);
  async function run() {
    setBusy(true);
    try {
      const res = await fn();
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup gerado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Backup</h1>
        <p className="text-sm text-muted-foreground">
          Exporte um snapshot completo dos dados essenciais da loja.
        </p>
      </div>
      <div className="bg-background rounded-2xl border border-border p-6 max-w-xl">
        <Database className="h-8 w-8 text-primary" />
        <div className="font-serif text-xl text-primary mt-3">Snapshot JSON</div>
        <p className="text-sm text-muted-foreground mt-1">
          Inclui produtos, variantes, pedidos, itens, banners, configurações e permissões.
        </p>
        <button
          onClick={run}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {busy ? "Gerando..." : "Baixar backup"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Recomenda-se baixar backups semanalmente e armazená-los em local seguro.
      </p>
    </div>
  );
}
