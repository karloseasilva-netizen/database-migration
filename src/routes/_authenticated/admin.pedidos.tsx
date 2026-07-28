import { createFileRoute } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ChevronDown, ChevronRight, Truck, Search } from "lucide-react";
import { toast } from "sonner";
import { adminListOrders, adminGetOrder, adminUpdateOrder } from "@/lib/admin.functions";
import { brl } from "@/lib/shop-data";

const ordersQuery = queryOptions({
  queryKey: ["admin", "orders"],
  queryFn: () => adminListOrders(),
});

export const Route = createFileRoute("/_authenticated/admin/pedidos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(ordersQuery),
  component: OrdersAdmin,
});

const STATUSES = ["pendente", "pago", "enviado", "entregue", "cancelado"] as const;
const STATUS_COLOR: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  pago: "bg-sky-100 text-sky-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregue: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-rose-100 text-rose-800",
};

function OrdersAdmin() {
  const { data: orders } = useSuspenseQuery(ordersQuery);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateFn = useServerFn(adminUpdateOrder);

  const updateStatus = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) => updateFn({ data: v }),
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const filtered = orders.filter((o: any) => {
    const okQ =
      !q ||
      o.customer_name?.toLowerCase().includes(q.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(q.toLowerCase()) ||
      o.id.includes(q);
    const okS = !status || o.status === status;
    return okQ && okS;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {orders.length} pedidos
        </p>
      </div>

      <div className="bg-background rounded-2xl border border-border p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por cliente, email ou ID"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm capitalize"
        >
          <option value="">Todos os status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground border-b border-border bg-secondary/40">
              <tr>
                <th className="w-8"></th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Data</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Rastreio</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: any) => (
                <>
                  <tr
                    key={o.id}
                    className="border-b border-border/50 last:border-none hover:bg-secondary/20 cursor-pointer"
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  >
                    <td className="px-2">
                      {expanded === o.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-semibold">{brl(Number(o.total))}</td>
                    <td className="px-4 py-3 text-xs">
                      {o.tracking_code ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Truck className="h-3 w-3" /> {o.tracking_code}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={(e) =>
                          updateStatus.mutate({ id: o.id, status: e.target.value as any })
                        }
                        className={`text-xs px-2 py-1 rounded-full font-semibold capitalize border-0 ${STATUS_COLOR[o.status]}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr>
                      <td colSpan={6} className="bg-secondary/20 p-5">
                        <OrderDetails orderId={o.id} order={o} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderDetails({ orderId, order }: { orderId: string; order: any }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "order", orderId],
    queryFn: () => adminGetOrder({ data: { id: orderId } }),
  });
  const updateFn = useServerFn(adminUpdateOrder);
  const [track, setTrack] = useState({
    code: order.tracking_code ?? "",
    url: order.tracking_url ?? "",
  });

  const saveTrack = useMutation({
    mutationFn: () =>
      updateFn({
        data: { id: orderId, tracking_code: track.code || null, tracking_url: track.url || null },
      }),
    onSuccess: () => {
      toast.success("Rastreio atualizado");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  const items = data?.order?.order_items ?? order.order_items ?? [];
  const history = data?.history ?? [];
  const addr = order.shipping_address ?? {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Itens</div>
          <ul className="divide-y divide-border rounded-lg border border-border bg-background">
            {items.map((it: any) => (
              <li key={it.id} className="p-3 flex justify-between text-sm">
                <div>
                  <div className="font-semibold">{it.product_name}</div>
                  <div className="text-xs text-muted-foreground">
                    Qtd: {it.quantity} · {brl(Number(it.price))}
                  </div>
                </div>
                <div className="font-semibold">{brl(Number(it.price) * Number(it.quantity))}</div>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{brl(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{brl(Number(order.shipping))}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-border">
              <span>Total</span>
              <span>{brl(Number(order.total))}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Endereço de entrega
          </div>
          <div className="text-sm bg-background rounded-lg border border-border p-3">
            {addr.street ? (
              <>
                {addr.street}, {addr.number}
                {addr.complement ? ` — ${addr.complement}` : ""}
                <br />
                {addr.city}/{addr.state} · CEP {addr.zip}
              </>
            ) : (
              <span className="text-muted-foreground">Sem endereço informado</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Rastreio
          </div>
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input
              placeholder="Código"
              value={track.code}
              onChange={(e) => setTrack({ ...track, code: e.target.value })}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="URL de rastreamento"
              value={track.url}
              onChange={(e) => setTrack({ ...track, url: e.target.value })}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => saveTrack.mutate()}
              disabled={saveTrack.isPending}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Contato</div>
        <div className="text-sm bg-background rounded-lg border border-border p-3 mb-4">
          <div>{order.customer_email}</div>
          {order.customer_phone && (
            <div className="text-muted-foreground">{order.customer_phone}</div>
          )}
          {order.payment_method && (
            <div className="text-xs text-muted-foreground mt-1">
              Pagamento: {order.payment_method}
            </div>
          )}
        </div>

        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Histórico</div>
        <ul className="space-y-2 text-xs">
          {history.length === 0 && (
            <li className="text-muted-foreground">Nenhuma alteração ainda.</li>
          )}
          {history.map((h: any) => (
            <li key={h.id} className="flex gap-2">
              <span className={`px-2 py-0.5 rounded-full ${STATUS_COLOR[h.status]}`}>
                {h.status}
              </span>
              <span className="text-muted-foreground">
                {new Date(h.created_at).toLocaleString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
