import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { listProductsForFeature, toggleFeatured } from "@/lib/admin-extra.functions";
import { brl } from "@/lib/shop-data";

const featQuery = queryOptions({
  queryKey: ["admin", "featurable"],
  queryFn: () => listProductsForFeature(),
});

export const Route = createFileRoute("/_authenticated/admin/aparencia/destaques")({
  loader: ({ context }) => context.queryClient.ensureQueryData(featQuery),
  component: FeaturedAdmin,
});

function FeaturedAdmin() {
  const { data: products } = useSuspenseQuery(featQuery);
  const qc = useQueryClient();
  const toggle = useServerFn(toggleFeatured);
  const [q, setQ] = useState("");
  const filtered = products.filter((p: any) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const featured = products.filter((p: any) => p.is_featured).length;

  async function change(id: string, next: boolean) {
    try {
      await toggle({ data: { id, is_featured: next } });
      await qc.invalidateQueries({ queryKey: ["admin", "featurable"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Produtos em destaque</h1>
        <p className="text-sm text-muted-foreground">
          {featured} produto(s) marcado(s) como destaque
        </p>
      </div>
      <div className="flex items-center gap-2 bg-background rounded-full border border-border px-4 py-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar produto"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.map((p: any) => (
            <div key={p.id} className="p-3 flex items-center gap-3">
              <div className="h-12 w-12 bg-secondary rounded-lg overflow-hidden shrink-0">
                {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  {p.category_slug} · {brl(Number(p.price))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={p.is_featured}
                  onChange={(e) => change(p.id, e.target.checked)}
                />
                Destaque
              </label>
            </div>
          ))}
          {!filtered.length && (
            <div className="p-6 text-center text-sm text-muted-foreground">Nenhum produto.</div>
          )}
        </div>
      </div>
    </div>
  );
}
