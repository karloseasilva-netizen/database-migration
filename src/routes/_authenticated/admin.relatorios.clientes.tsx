import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { reportCustomers } from "@/lib/admin-extra.functions";
import { brl } from "@/lib/shop-data";

const custQuery = queryOptions({
  queryKey: ["admin", "report-customers"],
  queryFn: () => reportCustomers(),
});

export const Route = createFileRoute("/_authenticated/admin/relatorios/clientes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(custQuery),
  component: CustReport,
});

function CustReport() {
  const { data } = useSuspenseQuery(custQuery);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Relatório de Clientes</h1>
        <p className="text-sm text-muted-foreground">Ticket médio, receita e recorrência</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Usuários", data.totalUsers],
          ["Compradores", data.buyers],
          ["Receita total", brl(data.revenue)],
          ["LTV médio", brl(data.avgLtv)],
        ].map(([l, v]) => (
          <div key={String(l)} className="bg-background rounded-2xl border border-border p-4">
            <div className="text-xs text-muted-foreground">{l}</div>
            <div className="text-xl font-serif text-primary mt-1">{v}</div>
          </div>
        ))}
      </div>
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-right">Pedidos</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3">Última compra</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.list.map((c, i) => (
              <tr key={i}>
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.email}</td>
                <td className="p-3 text-right">{c.count}</td>
                <td className="p-3 text-right font-medium">{brl(c.spent)}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {c.last ? new Date(c.last).toLocaleDateString("pt-BR") : "—"}
                </td>
              </tr>
            ))}
            {!data.list.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Nenhum cliente com pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
