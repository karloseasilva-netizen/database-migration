import { createFileRoute } from "@tanstack/react-router";
import { SettingsForm, settingsQuery } from "@/components/admin/SettingsForm";

export const Route = createFileRoute("/_authenticated/admin/config/frete")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: () => (
    <SettingsForm
      sectionKey="shipping"
      title="Frete"
      description="Regras gerais de envio."
      fields={[
        { key: "free_above", label: "Frete grátis acima de (R$)", type: "number" },
        { key: "flat_rate", label: "Frete padrão (R$)", type: "number" },
      ]}
    />
  ),
});
