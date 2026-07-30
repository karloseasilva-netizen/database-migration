import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { reportSales } from "@/lib/admin-extra.functions";
import { brl } from "@/lib/shop-data";

const salesQuery = (days: number) =>
  queryOptions({
    queryKey: ["admin", "report-sales", days],
    queryFn: () => reportSales({ data: { days } }),
  });

export const Route = createFileRoute("/_authenticated/admin/relatorios/vendas")({
  loader: ({ context }) => context.queryClient.ensureQueryData(salesQuery(30)),
  component: SalesReport,
});

function SalesReport() {
  const [days, setDays] = useState(30);
  const { data } = useSuspenseQuery(salesQuery(days));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-primary">Relatório de Vendas</h1>
          <p className="text-sm text-muted-foreground">Últimos {days} dias</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value={7}>7 dias</option>
          <option value={30}>30 dias</option>
          <option value={90}>90 dias</option>
          <option value={180}>180 dias</option>
        </select>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Receita", brl(data.total)],
          ["Pedidos", data.count],
          ["Ticket médio", brl(data.avg)],
          ["Cancelados", data.cancelled],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-background rounded-2xl border border-border p-4">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-serif text-primary mt-1">{value}</div>
          </div>
        ))}
      </div>
      <div className="bg-background rounded-2xl border border-border p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.series}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: any) => brl(Number(v))} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border font-medium">Pedidos recentes</div>
        <div className="divide-y divide-border">
          {data.orders.map((o: any) => (
            <div key={o.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{o.customer_name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("pt-BR")} · {o.status}
                </div>
              </div>
              <div className="font-medium">{brl(Number(o.total))}</div>
            </div>
          ))}
          {!data.orders.length && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhum pedido no período.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
