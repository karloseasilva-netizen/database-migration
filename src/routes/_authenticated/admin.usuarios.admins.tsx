import { createFileRoute } from "@tanstack/react-router";
import { RolePanel, roleQuery } from "@/components/admin/RolePanel";

export const Route = createFileRoute("/_authenticated/admin/usuarios/admins")({
  loader: ({ context }) => context.queryClient.ensureQueryData(roleQuery("admin")),
  component: () => (
    <RolePanel role="admin" title="Administradores" description="Acesso total ao painel administrativo." />
  ),
});
