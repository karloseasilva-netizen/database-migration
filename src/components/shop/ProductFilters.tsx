import { useMemo } from "react";
import type { Product } from "@/lib/shop-data";

export type FilterState = {
  q: string;
  sub: string;
  minPrice: number;
  maxPrice: number;
  sort: "relevance" | "price-asc" | "price-desc" | "name" | "rating";
  onlyOffers: boolean;
};

export const defaultFilters: FilterState = {
  q: "",
  sub: "",
  minPrice: 0,
  maxPrice: 500,
  sort: "relevance",
  onlyOffers: false,
};

export function useFilteredProducts(products: Product[], f: FilterState) {
  return useMemo(() => {
    const list = products.filter((p) => {
      if (f.q && !p.name.toLowerCase().includes(f.q.toLowerCase())) return false;
      if (f.sub && p.sub !== f.sub) return false;
      if (p.price < f.minPrice || p.price > f.maxPrice) return false;
      if (f.onlyOffers && !p.discount) return false;
      return true;
    });
    switch (f.sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
    }
    return list;
  }, [products, f]);
}

export function FiltersPanel({
  subs,
  value,
  onChange,
}: {
  subs: string[];
  value: FilterState;
  onChange: (v: FilterState) => void;
}) {
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-serif text-lg text-primary mb-3">Buscar</h4>
        <input
          value={value.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder="Nome do produto"
          className="w-full bg-secondary/60 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {subs.length > 0 && (
        <div>
          <h4 className="font-serif text-lg text-primary mb-3">Subcategoria</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="sub"
                checked={value.sub === ""}
                onChange={() => set("sub", "")}
                className="accent-primary"
              />
              Todas
            </label>
            {subs.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="sub"
                  checked={value.sub === s}
                  onChange={() => set("sub", s)}
                  className="accent-primary"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-serif text-lg text-primary mb-3">Faixa de preço</h4>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="number"
            value={value.minPrice}
            onChange={(e) => set("minPrice", Number(e.target.value) || 0)}
            className="w-full bg-secondary/60 rounded-full px-3 py-2 outline-none"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            value={value.maxPrice}
            onChange={(e) => set("maxPrice", Number(e.target.value) || 0)}
            className="w-full bg-secondary/60 rounded-full px-3 py-2 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={value.onlyOffers}
            onChange={(e) => set("onlyOffers", e.target.checked)}
            className="accent-primary"
          />
          Apenas em promoção
        </label>
      </div>

      <button
        onClick={() => onChange(defaultFilters)}
        className="w-full rounded-full border border-primary/40 text-primary py-2 text-sm font-semibold hover:bg-primary/5 transition"
      >
        Limpar filtros
      </button>
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: FilterState["sort"];
  onChange: (v: FilterState["sort"]) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FilterState["sort"])}
      className="bg-secondary/60 rounded-full px-4 py-2 text-sm outline-none cursor-pointer"
    >
      <option value="relevance">Relevância</option>
      <option value="price-asc">Menor preço</option>
      <option value="price-desc">Maior preço</option>
      <option value="name">Nome A-Z</option>
      <option value="rating">Melhor avaliação</option>
    </select>
  );
}