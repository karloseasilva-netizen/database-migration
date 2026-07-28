import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { exportOrdersCsv } from "@/lib/admin-extra.functions";

export const Route = createFileRoute("/_authenticated/admin/relatorios/exportar")({
  component: ExportReports,
});

function download(name: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportReports() {
  const [busy, setBusy] = useState(false);
  const exportFn = useServerFn(exportOrdersCsv);
  async function run() {
    setBusy(true);
    try {
      const res = await exportFn();
      download(`pedidos-${new Date().toISOString().slice(0, 10)}.csv`, res.csv);
      toast.success(`${res.count} pedidos exportados`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao exportar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Exportar relatórios</h1>
        <p className="text-sm text-muted-foreground">Baixe os dados da loja em formato CSV</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-background rounded-2xl border border-border p-6">
          <div className="font-medium mb-1">Pedidos</div>
          <p className="text-sm text-muted-foreground mb-4">
            Exporta todos os pedidos com data, status, cliente e total.
          </p>
          <button
            onClick={run}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {busy ? "Gerando..." : "Baixar CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
