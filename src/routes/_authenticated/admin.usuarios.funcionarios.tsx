import { createFileRoute } from "@tanstack/react-router";
import { RolePanel, roleQuery } from "@/components/admin/RolePanel";

export const Route = createFileRoute("/_authenticated/admin/usuarios/funcionarios")({
  loader: ({ context }) => context.queryClient.ensureQueryData(roleQuery("funcionario")),
  component: () => (
    <RolePanel
      role="funcionario"
      title="Funcionários"
      description="Equipe operacional (não gerencia configurações sensíveis)."
    />
  ),
});
