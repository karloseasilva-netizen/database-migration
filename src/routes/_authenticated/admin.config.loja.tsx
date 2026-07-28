import { createFileRoute } from "@tanstack/react-router";
import { SettingsForm, settingsQuery } from "@/components/admin/SettingsForm";

export const Route = createFileRoute("/_authenticated/admin/config/loja")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: () => (
    <SettingsForm
      sectionKey="store"
      title="Dados da loja"
      description="Informações institucionais exibidas no site e em documentos."
      fields={[
        { key: "name", label: "Nome da loja" },
        { key: "email", label: "E-mail de contato" },
        { key: "phone", label: "Telefone / WhatsApp" },
        { key: "cnpj", label: "CNPJ" },
        { key: "address", label: "Endereço completo", type: "textarea" },
      ]}
    />
  ),
});
