import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Mail, Phone, MapPin, X } from "lucide-react";
import { adminListCustomers, adminGetCustomerOrders } from "@/lib/admin.functions";
import { brl } from "@/lib/shop-data";

const customersQuery = queryOptions({
  queryKey: ["admin", "customers"],
  queryFn: () => adminListCustomers(),
});

export const Route = createFileRoute("/_authenticated/admin/clientes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(customersQuery),
  component: CustomersAdmin,
});

function CustomersAdmin() {
  const { data: customers } = useSuspenseQuery(customersQuery);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const filtered = customers.filter(
    (c: any) =>
      !q ||
      c.full_name?.toLowerCase().includes(q.toLowerCase()) ||
      c.email?.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {customers.length} clientes
        </p>
      </div>

      <div className="bg-background rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou email"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground border-b border-border bg-secondary/40">
              <tr>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Contato</th>
                <th className="text-left px-4 py-3">Pedidos</th>
                <th className="text-left px-4 py-3">Gasto total</th>
                <th className="text-left px-4 py-3">Último pedido</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className="border-b border-border/50 last:border-none">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{c.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      Cadastro: {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {c.email ?? "—"}
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.orders_count}</td>
                  <td className="px-4 py-3 font-semibold">{brl(c.total_spent)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(c)}
                      className="text-primary text-xs hover:underline"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CustomerDrawer({ customer, onClose }: { customer: any; onClose: () => void }) {
  const { data: orders } = useQuery({
    queryKey: ["admin", "customer", customer.id, "orders"],
    queryFn: () => adminGetCustomerOrders({ data: { userId: customer.id } }),
  });
  const a = customer.address ?? {};

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex justify-end" onClick={onClose}>
      <aside
        className="w-full max-w-lg h-full bg-background overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-background">
          <div>
            <h2 className="font-serif text-xl text-primary">{customer.full_name ?? "Cliente"}</h2>
            <p className="text-xs text-muted-foreground">{customer.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Pedidos" value={String(customer.orders_count)} />
            <Metric label="Gasto" value={brl(customer.total_spent)} />
            <Metric
              label="Ticket"
              value={
                customer.orders_count > 0 ? brl(customer.total_spent / customer.orders_count) : "—"
              }
            />
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Contato
            </div>
            <div className="text-sm space-y-1 bg-secondary/40 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" /> {customer.email ?? "—"}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" /> {customer.phone ?? "—"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <MapPin className="h-3 w-3" /> Endereço
            </div>
            <div className="text-sm bg-secondary/40 rounded-lg p-3">
              {a.street ? (
                <>
                  {a.street}, {a.number}
                  {a.complement ? ` — ${a.complement}` : ""}
                  <br />
                  {a.city}/{a.state} · CEP {a.zip}
                </>
              ) : (
                <span className="text-muted-foreground">Sem endereço cadastrado</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Histórico de pedidos
            </div>
            {!orders || orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pedido registrado.</p>
            ) : (
              <ul className="divide-y divide-border border border-border rounded-lg">
                {orders.map((o: any) => (
                  <li key={o.id} className="p-3 text-sm flex justify-between">
                    <div>
                      <div className="font-semibold">
                        {new Date(o.created_at).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {o.status} · {(o.order_items ?? []).length} itens
                      </div>
                    </div>
                    <div className="font-semibold">{brl(Number(o.total))}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/40 rounded-lg p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold text-primary">{value}</div>
    </div>
  );
}
