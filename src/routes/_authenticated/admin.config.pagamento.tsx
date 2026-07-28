import { createFileRoute } from "@tanstack/react-router";
import { SettingsForm, settingsQuery } from "@/components/admin/SettingsForm";

export const Route = createFileRoute("/_authenticated/admin/config/pagamento")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: () => (
    <SettingsForm
      sectionKey="payment"
      title="Formas de pagamento"
      description="Habilite ou desabilite os meios de pagamento aceitos."
      fields={[
        { key: "pix", label: "PIX", type: "boolean" },
        { key: "credit_card", label: "Cartão de crédito", type: "boolean" },
        { key: "boleto", label: "Boleto bancário", type: "boolean" },
        { key: "installments", label: "Máximo de parcelas", type: "number" },
      ]}
    />
  ),
});
