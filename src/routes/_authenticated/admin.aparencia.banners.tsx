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
  mobile_image_url?: string;
  link_url: string;
  position: number;
  is_active: boolean;
};

const empty: BannerForm = {
  title: "",
  image_url: "",
  mobile_image_url: "",
  link_url: "",
  position: 0,
  is_active: true,
};

function BannersAdmin() {
  const { data: banners } = useSuspenseQuery(bannersQuery);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<BannerForm | null>(null);
  const save = useServerFn(upsertBanner);
  const del = useServerFn(deleteBanner);

  async function submit() {
    if (!editing) return;
    if (!editing.image_url) return toast.error("Envie uma imagem para a versão PC");
    try {
      await save({
        data: {
          id: editing.id,
          values: {
            title: editing.title || null,
            image_url: editing.image_url,
            mobile_image_url: editing.mobile_image_url || null,
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
          <p className="text-sm text-muted-foreground">
            Imagens do carrossel principal (PC e Mobile)
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty, position: banners.length })}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Novo banner
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {banners.map((b: any) => (
          <div
            key={b.id}
            className="bg-background rounded-2xl border border-border overflow-hidden flex flex-col justify-between shadow-sm"
          >
            <div className="relative">
              {/* PC Banner Preview */}
              <div className="aspect-[16/7] bg-secondary relative overflow-hidden">
                {b.image_url && (
                  <img
                    src={b.image_url}
                    alt={b.title ?? ""}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                  PC: 1920x500 px
                </div>
              </div>

              {/* Mobile Banner Overlay Preview */}
              {b.mobile_image_url && (
                <div className="absolute bottom-2 right-2 w-16 aspect-square bg-secondary rounded-lg border-2 border-background overflow-hidden shadow-lg">
                  <img
                    src={b.mobile_image_url}
                    alt="Mobile preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[8px] font-semibold text-center py-0.5">
                    Mobile
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between gap-2 border-t border-border/50">
              <div className="min-w-0">
                <div className="font-medium truncate">{b.title || "Sem título"}</div>
                <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
                  <span>Posição {b.position}</span>
                  <span>·</span>
                  <span
                    className={b.is_active ? "text-green-600 font-medium" : "text-muted-foreground"}
                  >
                    {b.is_active ? "Ativo" : "Inativo"}
                  </span>
                  <span>·</span>
                  <span className="font-medium text-primary">
                    {b.mobile_image_url ? "PC + Mobile" : "Apenas PC"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() =>
                    setEditing({
                      ...b,
                      title: b.title ?? "",
                      link_url: b.link_url ?? "",
                      mobile_image_url: b.mobile_image_url ?? "",
                    })
                  }
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(b.id)}
                  className="p-2 rounded-lg hover:bg-secondary text-destructive transition-colors"
                >
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h2 className="font-serif text-xl text-primary font-semibold">
                {editing.id ? "Editar banner" : "Novo banner"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="p-1 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* PC Version */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary block">
                  Banner Versão PC{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Resolução recomendada: 1920x500 px)
                  </span>
                </label>
                <div className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                  <ImageUpload
                    value={editing.image_url}
                    onChange={(url) => setEditing({ ...editing, image_url: url })}
                    folder="banners"
                    label="Upload Banner PC (1920x500)"
                  />
                  {editing.image_url && (
                    <div className="mt-3 aspect-[19.2/5] bg-secondary rounded-lg overflow-hidden border border-border/80">
                      <img
                        src={editing.image_url}
                        alt="Preview PC"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Version */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary block">
                  Banner Versão Mobile{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Resolução recomendada: 800x800 px)
                  </span>
                </label>
                <div className="bg-secondary/20 p-4 rounded-xl border border-border/60">
                  <ImageUpload
                    value={editing.mobile_image_url}
                    onChange={(url) => setEditing({ ...editing, mobile_image_url: url })}
                    folder="banners"
                    label="Upload Banner Mobile (800x800)"
                  />
                  {editing.mobile_image_url && (
                    <div className="mt-3 w-28 aspect-square bg-secondary rounded-lg overflow-hidden border border-border/80">
                      <img
                        src={editing.mobile_image_url}
                        alt="Preview Mobile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* General Fields */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Título do banner (opcional)"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Link de redirecionamento ao clicar (opcional, ex: /produtos/slug)"
                  value={editing.link_url}
                  onChange={(e) => setEditing({ ...editing, link_url: e.target.value })}
                />

                <div className="flex items-center gap-6 pt-1">
                  <label className="text-sm flex items-center gap-2 text-primary font-medium cursor-pointer">
                    Posição
                    <input
                      type="number"
                      className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm font-normal text-center focus:outline-none focus:ring-1 focus:ring-primary"
                      value={editing.position}
                      onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })}
                    />
                  </label>
                  <label className="text-sm flex items-center gap-2 cursor-pointer font-medium text-primary">
                    <input
                      type="checkbox"
                      className="rounded border-border text-primary focus:ring-primary"
                      checked={editing.is_active}
                      onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                    />
                    Banner Ativo
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/80">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-5 py-2 rounded-full border border-border text-sm hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submit}
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
