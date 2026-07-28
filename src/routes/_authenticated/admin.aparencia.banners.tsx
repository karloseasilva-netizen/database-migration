import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { listBanners, upsertBanner, deleteBanner } from "@/lib/admin-extra.functions";

const bannersQuery = queryOptions({
  queryKey: ["admin", "banners"],
  queryFn: () => listBanners(),
});

export const Route = createFileRoute("/_authenticated/admin/aparencia/banners")({
  loader: ({ context }) => context.queryClient.ensureQueryData(bannersQuery),
  component: BannersAdmin,
});

type BannerForm = {
  id?: string;
  title: string;
  image_url: string;
  link_url: string;
  position: number;
  is_active: boolean;
};

const empty: BannerForm = { title: "", image_url: "", link_url: "", position: 0, is_active: true };

function BannersAdmin() {
  const { data: banners } = useSuspenseQuery(bannersQuery);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<BannerForm | null>(null);
  const save = useServerFn(upsertBanner);
  const del = useServerFn(deleteBanner);

  async function submit() {
    if (!editing) return;
    if (!editing.image_url) return toast.error("Envie uma imagem");
    try {
      await save({
        data: {
          id: editing.id,
          values: {
            title: editing.title || null,
            image_url: editing.image_url,
            link_url: editing.link_url || null,
            position: editing.position,
            is_active: editing.is_active,
          },
        },
      });
      await qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      setEditing(null);
      toast.success("Banner salvo");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    }
  }

  async function remove(id: string) {
    if (!confirm("Remover este banner?")) return;
    await del({ data: { id } });
    await qc.invalidateQueries({ queryKey: ["admin", "banners"] });
    toast.success("Removido");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-primary">Banners</h1>
          <p className="text-sm text-muted-foreground">Imagens do carrossel principal</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty, position: banners.length })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm"
        >
          <Plus className="h-4 w-4" /> Novo banner
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((b: any) => (
          <div key={b.id} className="bg-background rounded-2xl border border-border overflow-hidden">
            <div className="aspect-[16/7] bg-secondary">
              {b.image_url && <img src={b.image_url} alt={b.title ?? ""} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{b.title || "Sem título"}</div>
                <div className="text-xs text-muted-foreground">
                  Posição {b.position} · {b.is_active ? "Ativo" : "Inativo"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing({ ...b, title: b.title ?? "", link_url: b.link_url ?? "" })}
                  className="p-2 rounded-lg hover:bg-secondary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(b.id)} className="p-2 rounded-lg hover:bg-secondary text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!banners.length && (
          <div className="col-span-full text-center p-10 text-muted-foreground bg-background rounded-2xl border border-dashed border-border">
            Nenhum banner cadastrado.
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-primary">
                {editing.id ? "Editar banner" : "Novo banner"}
              </h2>
              <button onClick={() => setEditing(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <ImageUpload
              value={editing.image_url}
              onChange={(url) => setEditing({ ...editing, image_url: url })}
              folder="banners"
              label="Imagem do banner"
            />
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Título (opcional)"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Link ao clicar (opcional)"
              value={editing.link_url}
              onChange={(e) => setEditing({ ...editing, link_url: e.target.value })}
            />
            <div className="flex items-center gap-4">
              <label className="text-sm">Posição
                <input
                  type="number"
                  className="ml-2 w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                  value={editing.position}
                  onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })}
                />
              </label>
              <label className="text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />
                Ativo
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-full border border-border text-sm">
                Cancelar
              </button>
              <button onClick={submit} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
