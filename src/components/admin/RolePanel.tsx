import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { listUsersByRole, grantRoleByEmail, revokeRole } from "@/lib/admin-extra.functions";

type Role = "admin" | "funcionario" | "customer";

export function roleQuery(role: Role) {
  return queryOptions({
    queryKey: ["admin", "users", role],
    queryFn: () => listUsersByRole({ data: { role } }),
  });
}

export function RolePanel({
  role,
  title,
  description,
}: {
  role: Role;
  title: string;
  description: string;
}) {
  const { data: users } = useSuspenseQuery(roleQuery(role));
  const qc = useQueryClient();
  const grant = useServerFn(grantRoleByEmail);
  const revoke = useServerFn(revokeRole);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!email) return;
    setBusy(true);
    try {
      await grant({ data: { email, role } });
      await qc.invalidateQueries({ queryKey: ["admin", "users", role] });
      setEmail("");
      toast.success("Permissão concedida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    } finally {
      setBusy(false);
    }
  }

  async function remove(user_id: string) {
    if (!confirm("Remover permissão?")) return;
    await revoke({ data: { user_id, role } });
    await qc.invalidateQueries({ queryKey: ["admin", "users", role] });
    toast.success("Removido");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="bg-background rounded-2xl border border-border p-4 flex gap-2 max-w-xl">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@dominio.com"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={add}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Conceder
        </button>
      </div>
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Desde</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.user_id}>
                <td className="p-3">{u.full_name || "—"}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => remove(u.user_id)}
                    className="p-2 rounded-lg hover:bg-secondary text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Nenhum usuário com este papel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
