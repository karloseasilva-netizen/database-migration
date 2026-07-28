import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useShop } from "@/lib/shop-context";
import { ProductListing } from "@/components/shop/ProductListing";
import { PageHeader } from "@/components/shop/PageHeader";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/produtos/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Todos os produtos — Puro Fio Lingerie" },
      { name: "description", content: "Explore toda a coleção Puro Fio: lingeries, pijamas, sutiãs e mais." },
      { property: "og:title", content: "Todos os produtos — Puro Fio Lingerie" },
      { property: "og:description", content: "Explore toda a coleção Puro Fio." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { q } = Route.useSearch();
  const { products } = useShop();
  const allSubs = Array.from(new Set(products.map((p) => p.sub))).sort();
  return (
    <div className="pb-16">
      <PageHeader
        title="Todos os produtos"
        subtitle="Encontre a peça perfeita para você"
        crumbs={[{ label: "Produtos" }]}
      />
      <div className="mx-auto max-w-7xl px-4 mt-8">
        <ProductListing products={products} subs={allSubs} initial={{ q }} />
      </div>
    </div>
  );
}