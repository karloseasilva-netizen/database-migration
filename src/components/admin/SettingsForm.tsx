import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSettings, updateSetting } from "@/lib/admin-extra.functions";

export const settingsQuery = queryOptions({
  queryKey: ["admin", "settings"],
  queryFn: () => getSettings(),
});

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean";
  help?: string;
};

export function SettingsForm({
  sectionKey,
  title,
  description,
  fields,
}: {
  sectionKey: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}) {
  const qc = useQueryClient();
  const { data: all } = useSuspenseQuery(settingsQuery);
  const initial = (all as any)[sectionKey] ?? {};
  const [form, setForm] = useState<Record<string, any>>(initial);
  const [saving, setSaving] = useState(false);
  const save = useServerFn(updateSetting);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await save({ data: { key: sectionKey, value: form } });
      await qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Configurações salvas");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <form
        onSubmit={submit}
        className="bg-background rounded-2xl border border-border p-6 space-y-4 max-w-2xl"
      >
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <label className="text-sm font-medium text-foreground">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-24"
                value={form[f.key] ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            ) : f.type === "boolean" ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(form[f.key])}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                />
                Habilitado
              </label>
            ) : f.type === "number" ? (
              <input
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={form[f.key] ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [f.key]: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            ) : (
              <input
                type="text"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={form[f.key] ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            )}
            {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}