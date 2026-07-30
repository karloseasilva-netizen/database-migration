import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listActivityLogs } from "@/lib/admin-extra.functions";

const logsQuery = queryOptions({
  queryKey: ["admin", "logs"],
  queryFn: () => listActivityLogs(),
});

export const Route = createFileRoute("/_authenticated/admin/seguranca/logs")({
  loader: ({ context }) => context.queryClient.ensureQueryData(logsQuery),
  component: Logs,
});

function Logs() {
  const { data } = useSuspenseQuery(logsQuery);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Registro de atividades</h1>
        <p className="text-sm text-muted-foreground">Últimas 200 ações administrativas.</p>
      </div>
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Quando</th>
              <th className="p-3">Ação</th>
              <th className="p-3">Entidade</th>
              <th className="p-3">Usuário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((l: any) => (
              <tr key={l.id}>
                <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(l.created_at).toLocaleString("pt-BR")}
                </td>
                <td className="p-3 font-medium">{l.action}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {l.entity
                    ? `${l.entity}${l.entity_id ? " · " + String(l.entity_id).slice(0, 8) : ""}`
                    : "—"}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {l.user_email || (l.user_id ? String(l.user_id).slice(0, 8) : "sistema")}
                </td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Nenhuma atividade registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
