import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { adminDashboardStats } from "@/lib/admin.functions";
import { brl } from "@/lib/shop-data";

const statsQuery = queryOptions({
  queryKey: ["admin", "stats"],
  queryFn: () => adminDashboardStats(),
});

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  component: Dashboard,
});

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendentes",
  pago: "Pagos",
  enviado: "Enviados",
  entregue: "Entregues",
  cancelado: "Cancelados",
};
const STATUS_COLOR: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  pago: "bg-sky-100 text-sky-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregue: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-rose-100 text-rose-800",
};

function Dashboard() {
  const { data } = useSuspenseQuery(statsQuery);
  const maxRev = Math.max(1, ...data.chart.map((b) => b.revenue));
  const totalOrdersChart = data.chart.reduce((s, b) => s + b.orders, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumo do desempenho da loja</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Faturamento total"
          value={brl(data.revenue)}
          sub={`Hoje: ${brl(data.revenueToday)}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Últimos 7 dias"
          value={brl(data.revenueWeek)}
          sub={`30 dias: ${brl(data.revenueMonth)}`}
        />
        <StatCard
          icon={ShoppingBag}
          label="Pedidos"
          value={String(data.ordersCount)}
          sub={`${totalOrdersChart} nos últimos 30 dias`}
        />
        <StatCard
          icon={Package}
          label="Produtos"
          value={String(data.productsCount)}
          sub={`${data.usersCount} clientes cadastrados`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-background rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-primary">Vendas — últimos 30 dias</h2>
            <div className="text-xs text-muted-foreground">Faturamento diário</div>
          </div>
          <div className="flex items-end gap-1 h-40">
            {data.chart.map((b) => (
              <div key={b.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-primary/80 hover:bg-primary rounded-t transition"
                  style={{
                    height: `${(b.revenue / maxRev) * 100}%`,
                    minHeight: b.revenue > 0 ? 2 : 0,
                  }}
                  title={`${b.date}: ${brl(b.revenue)} (${b.orders} pedidos)`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            <span>{data.chart[0]?.date}</span>
            <span>{data.chart[data.chart.length - 1]?.date}</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-background rounded-2xl border border-border p-5">
          <h2 className="font-serif text-lg text-primary mb-4">Pedidos por status</h2>
          <ul className="space-y-2">
            {Object.entries(data.statusCounts).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[k]}`}>
                  {STATUS_LABEL[k]}
                </span>
                <span className="font-semibold">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top products */}
        <div className="bg-background rounded-2xl border border-border p-5">
          <h2 className="font-serif text-lg text-primary mb-3">Produtos mais vendidos</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
          ) : (
            <ol className="space-y-2">
              {data.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-3">
                    <span className="grid place-items-center h-7 w-7 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {i + 1}
                    </span>
                    <span>{p.name}</span>
                  </span>
                  <span className="text-right">
                    <div className="font-semibold">{p.units} un</div>
                    <div className="text-xs text-muted-foreground">{brl(p.revenue)}</div>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-background rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="font-serif text-lg text-primary">Estoque baixo</h2>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todos os produtos com estoque saudável.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.lowStock.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{p.name}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                    {p.stock} un
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/admin/estoque"
            className="text-xs text-primary hover:underline mt-3 inline-block"
          >
            Ver estoque completo →
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-background rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg text-primary">Pedidos recentes</h2>
          <Link to="/admin/pedidos" className="text-xs text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {data.recentOrders.map((o: any) => (
              <li key={o.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{brl(Number(o.total))}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-background rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-2xl font-semibold text-primary">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
