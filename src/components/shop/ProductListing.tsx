import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import {
  FiltersPanel,
  SortSelect,
  defaultFilters,
  useFilteredProducts,
  type FilterState,
} from "./ProductFilters";
import type { Product } from "@/lib/shop-data";

export function ProductListing({
  products,
  subs = [],
  initial,
}: {
  products: Product[];
  subs?: string[];
  initial?: Partial<FilterState>;
}) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initial,
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const list = useFilteredProducts(products, filters);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
      <aside className="hidden lg:block bg-secondary/30 rounded-2xl p-5 h-max sticky top-32">
        <FiltersPanel subs={subs} value={filters} onChange={setFilters} />
      </aside>

      <div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="text-sm text-muted-foreground">
            {list.length} {list.length === 1 ? "produto" : "produtos"}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </button>
            <SortSelect
              value={filters.sort}
              onChange={(v) => setFilters({ ...filters, sort: v })}
            />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            Nenhum produto encontrado com esses filtros.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            aria-label="Fechar filtros"
            onClick={() => setMobileOpen(false)}
            className="flex-1 bg-foreground/40"
          />
          <aside className="w-[85%] max-w-sm bg-background h-full overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-primary">Filtros</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FiltersPanel subs={subs} value={filters} onChange={setFilters} />
          </aside>
        </div>
      )}
    </div>
  );
}