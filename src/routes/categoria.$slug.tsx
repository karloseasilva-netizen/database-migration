import { createFileRoute, notFound } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { getCategory } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-context";
import { ProductListing } from "@/components/shop/ProductListing";
import { PageHeader } from "@/components/shop/PageHeader";

const searchSchema = z.object({
  sub: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/categoria/$slug")({
  validateSearch: zodValidator(searchSchema),
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — Puro Fio Lingerie` },
          {
            name: "description",
            content: `Descubra ${loaderData.category.name} da Puro Fio. Peças com delicadeza e conforto.`,
          },
          { property: "og:title", content: `${loaderData.category.name} — Puro Fio` },
          {
            property: "og:description",
            content: `Coleção ${loaderData.category.name} com envio para todo Brasil.`,
          },
        ]
      : [{ title: "Categoria não encontrada" }, { name: "robots", content: "noindex" }],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { sub } = Route.useSearch();
  const { products: allProducts } = useShop();
  const products = allProducts.filter((p) => p.categorySlug === category.slug);

  return (
    <div className="pb-16">
      <PageHeader
        title={category.name}
        subtitle={`${products.length} produtos nesta categoria`}
        crumbs={[{ label: "Categorias" }, { label: category.name }]}
      />
      <div className="mx-auto max-w-7xl px-4 mt-8">
        <ProductListing
          products={products}
          subs={category.subs}
          initial={{ sub }}
        />
      </div>
    </div>
  );
}