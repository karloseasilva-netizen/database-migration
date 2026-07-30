import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { adminListStock, adminRecordStockMovement } from "@/lib/admin.functions";

const stockQuery = queryOptions({
  queryKey: ["admin", "stock"],
  queryFn: () => adminListStock(),
});

export const Route = createFileRoute("/_authenticated/admin/estoque")({
  loader: ({ context }) => context.queryClient.ensureQueryData(stockQuery),
  component: StockAdmin,
});

type MovForm = {
  product_id: string;
  variant_id: string;
  kind: "entrada" | "saida" | "ajuste";
  quantity: string;
  reason: string;
};

function StockAdmin() {
  const { data } = useSuspenseQuery(stockQuery);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [mov, setMov] = useState<MovForm | null>(null);

  const record = useServerFn(adminRecordStockMovement);
  const submit = useMutation({
    mutationFn: (m: MovForm) =>
      record({
        data: {
          product_id: m.product_id,
          variant_id: m.variant_id || null,
          kind: m.kind,
          quantity: Number(m.quantity) || 0,
          reason: m.reason || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Movimentação registrada");
      setMov(null);
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const variantsByProduct = new Map<string, any[]>();
  for (const v of data.variants) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push(v);
    variantsByProduct.set(v.product_id, list);
  }

  const rows = data.products
    .map((p: any) => ({
      ...p,
      low: Number(p.stock ?? 0) <= Number(p.low_stock_threshold ?? 5),
      variantsList: variantsByProduct.get(p.id) ?? [],
    }))
    .filter((p) => (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (!lowOnly || p.low));

  const lowCount = data.products.filter(
    (p: any) => Number(p.stock ?? 0) <= Number(p.low_stock_threshold ?? 5),
  ).length;
  const totalUnits = data.products.reduce((s: number, p: any) => s + Number(p.stock ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Estoque</h1>
        <p className="text-sm text-muted-foreground">Controle de estoque e movimentações</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Unidades totais
          </div>
          <div className="text-2xl font-semibold text-primary mt-1">{totalUnits}</div>
        </div>
        <div className="bg-background rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">SKUs</div>
          <div className="text-2xl font-semibold text-primary mt-1">
            {data.products.length + data.variants.length}
          </div>
        </div>
        <div className="bg-background rounded-2xl border border-border p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Estoque baixo
          </div>
          <div className="text-2xl font-semibold text-amber-700 mt-1">{lowCount}</div>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produto"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          Apenas estoque baixo
        </label>
      </div>

      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground border-b border-border bg-secondary/40">
              <tr>
                <th className="text-left px-4 py-3">Produto</th>
                <th className="text-left px-4 py-3">Variações</th>
                <th className="text-left px-4 py-3">Estoque</th>
                <th className="text-left px-4 py-3">Alerta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-border/50 last:border-none">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                        {p.image_url && (
                          <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="font-semibold">{p.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.variantsList.length === 0 ? "—" : `${p.variantsList.length} variação(ões)`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.low ? "text-amber-700 font-semibold" : ""}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    ≤ {p.low_stock_threshold}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        setMov({
                          product_id: p.id,
                          variant_id: "",
                          kind: "entrada",
                          quantity: "1",
                          reason: "",
                        })
                      }
                      className="text-primary text-xs hover:underline"
                    >
                      Movimentar
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhum produto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border p-5">
        <h2 className="font-serif text-lg text-primary mb-3">Últimas movimentações</h2>
        {data.movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {data.movements.map((m: any) => {
              const product = data.products.find((p: any) => p.id === m.product_id);
              return (
                <li key={m.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {m.kind === "entrada" && <ArrowUpCircle className="h-4 w-4 text-emerald-600" />}
                    {m.kind === "saida" && <ArrowDownCircle className="h-4 w-4 text-rose-600" />}
                    {m.kind === "ajuste" && <RotateCcw className="h-4 w-4 text-sky-600" />}
                    <div>
                      <div>{product?.name ?? m.product_id}</div>
                      <div className="text-xs text-muted-foreground">{m.reason ?? m.kind}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {m.kind === "saida" ? "-" : m.kind === "entrada" ? "+" : "="}
                      {Math.abs(Number(m.quantity))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {mov && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
          onClick={() => setMov(null)}
        >
          <div
            className="bg-background rounded-2xl w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg text-primary mb-4">Movimentar estoque</h3>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                submit.mutate(mov);
              }}
            >
              <div>
                <label className="text-xs uppercase text-muted-foreground">
                  Variação (opcional)
                </label>
                <select
                  value={mov.variant_id}
                  onChange={(e) => setMov({ ...mov, variant_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">
                    Estoque geral do produto
                    {(() => {
                      const activeProduct = data.products.find((p: any) => p.id === mov.product_id);
                      return activeProduct?.sku ? ` (SKU: ${activeProduct.sku})` : "";
                    })()}
                  </option>
                  {(variantsByProduct.get(mov.product_id) ?? []).map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {[v.size, v.color, v.sku].filter(Boolean).join(" · ")} — {v.stock} un
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase text-muted-foreground">Tipo</label>
                  <select
                    value={mov.kind}
                    onChange={(e) => setMov({ ...mov, kind: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                    <option value="ajuste">Ajuste (define total)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase text-muted-foreground">Quantidade</label>
                  <input
                    type="number"
                    required
                    value={mov.quantity}
                    onChange={(e) => setMov({ ...mov, quantity: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase text-muted-foreground">Motivo</label>
                <input
                  value={mov.reason}
                  onChange={(e) => setMov({ ...mov, reason: e.target.value })}
                  placeholder="Ex.: compra do fornecedor, perda, ajuste inventário"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMov(null)}
                  className="px-4 py-2 text-sm rounded-full border border-border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submit.isPending}
                  className="px-5 py-2 text-sm font-semibold rounded-full bg-primary text-primary-foreground disabled:opacity-60"
                >
                  {submit.isPending ? "Salvando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
