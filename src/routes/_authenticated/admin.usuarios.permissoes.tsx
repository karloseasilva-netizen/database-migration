import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listAllRoles } from "@/lib/admin-extra.functions";

const rolesQuery = queryOptions({
  queryKey: ["admin", "all-roles"],
  queryFn: () => listAllRoles(),
});

export const Route = createFileRoute("/_authenticated/admin/usuarios/permissoes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(rolesQuery),
  component: Permissoes,
});

function Permissoes() {
  const { data } = useSuspenseQuery(rolesQuery);
  const byUser = new Map<string, { email: string; roles: string[] }>();
  for (const r of data as any[]) {
    const cur = byUser.get(r.user_id) ?? { email: r.email ?? "—", roles: [] as string[] };
    cur.roles.push(r.role);
    byUser.set(r.user_id, cur);
  }
  const rows = Array.from(byUser.entries());
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Permissões de acesso</h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada de todos os papéis atribuídos.
        </p>
      </div>
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">E-mail</th>
              <th className="p-3">Papéis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(([id, u]) => (
              <tr key={id}>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <div className="flex gap-2 flex-wrap">
                    {u.roles.map((r) => (
                      <span
                        key={r}
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          r === "admin"
                            ? "bg-primary/15 text-primary"
                            : r === "funcionario"
                              ? "bg-secondary text-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={2} className="p-6 text-center text-muted-foreground">
                  Nenhum papel atribuído.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
