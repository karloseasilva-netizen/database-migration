import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { reportTopProducts } from "@/lib/admin-extra.functions";
import { brl } from "@/lib/shop-data";

const topQuery = queryOptions({
  queryKey: ["admin", "report-top"],
  queryFn: () => reportTopProducts(),
});

export const Route = createFileRoute("/_authenticated/admin/relatorios/mais-vendidos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(topQuery),
  component: TopProducts,
});

function TopProducts() {
  const { data } = useSuspenseQuery(topQuery);
  const max = data[0]?.units ?? 1;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Produtos mais vendidos</h1>
        <p className="text-sm text-muted-foreground">Ranking por unidades vendidas</p>
      </div>
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Produto</th>
              <th className="p-3 text-right">Unidades</th>
              <th className="p-3 text-right">Receita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((p, i) => (
              <tr key={p.name}>
                <td className="p-3 text-muted-foreground">{i + 1}</td>
                <td className="p-3">
                  <div>{p.name}</div>
                  <div className="h-1 bg-secondary rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(p.units / max) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="p-3 text-right font-medium">{p.units}</td>
                <td className="p-3 text-right">{brl(p.revenue)}</td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Nenhuma venda registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
