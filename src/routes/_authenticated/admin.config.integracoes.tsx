import { createFileRoute } from "@tanstack/react-router";
import { SettingsForm, settingsQuery } from "@/components/admin/SettingsForm";

export const Route = createFileRoute("/_authenticated/admin/config/integracoes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: () => (
    <SettingsForm
      sectionKey="integrations"
      title="Integrações"
      description="Chaves e IDs de serviços externos."
      fields={[
        { key: "ga_id", label: "Google Analytics (ID)" },
        { key: "meta_pixel", label: "Meta Pixel (ID)" },
        { key: "whatsapp", label: "WhatsApp Business (número)" },
      ]}
    />
  ),
});
