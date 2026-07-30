import { createFileRoute } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-context";
import { ProductListing } from "@/components/shop/ProductListing";
import { PageHeader } from "@/components/shop/PageHeader";

export const Route = createFileRoute("/ofertas")({
  head: () => ({
    meta: [
      { title: "Ofertas Especiais — Puro Fio Lingerie" },
      { name: "description", content: "Descontos exclusivos em lingeries, pijamas e muito mais." },
      { property: "og:title", content: "Ofertas Especiais — Puro Fio" },
      { property: "og:description", content: "Descontos por tempo limitado na Puro Fio." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { products: allProducts } = useShop();
  const products = allProducts.filter((p) => p.discount);
  const subs = Array.from(new Set(products.map((p) => p.sub))).sort();
  return (
    <div className="pb-16">
      <PageHeader
        title="Ofertas Especiais"
        subtitle="Descontos por tempo limitado"
        crumbs={[{ label: "Ofertas" }]}
      />
      <div className="mx-auto max-w-7xl px-4 mt-8">
        <ProductListing products={products} subs={subs} />
      </div>
    </div>
  );
}
