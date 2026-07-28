import { createFileRoute } from "@tanstack/react-router";
import { SettingsForm, settingsQuery } from "@/components/admin/SettingsForm";

export const Route = createFileRoute("/_authenticated/admin/config/seo")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: () => (
    <SettingsForm
      sectionKey="seo"
      title="SEO"
      description="Metadados usados em buscadores e compartilhamentos."
      fields={[
        { key: "title", label: "Título padrão" },
        { key: "description", label: "Descrição padrão", type: "textarea" },
        { key: "keywords", label: "Palavras-chave" },
        { key: "og_image", label: "Imagem Open Graph (URL)" },
      ]}
    />
  ),
});
