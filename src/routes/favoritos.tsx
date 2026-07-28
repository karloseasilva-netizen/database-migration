import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PRODUCTS } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-context";
import { ProductCard } from "@/components/shop/ProductCard";
import { PageHeader } from "@/components/shop/PageHeader";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus Favoritos — Puro Fio Lingerie" },
      { name: "description", content: "Suas peças favoritas salvas na Puro Fio." },
      { property: "og:title", content: "Meus Favoritos — Puro Fio" },
      { property: "og:description", content: "Sua wishlist na Puro Fio." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites } = useShop();
  const items = PRODUCTS.filter((p) => favorites.has(p.id));

  return (
    <div className="pb-16">
      <PageHeader
        title="Meus Favoritos"
        subtitle={`${items.length} ${items.length === 1 ? "peça" : "peças"} salvas`}
        crumbs={[{ label: "Favoritos" }]}
      />
      <div className="mx-auto max-w-7xl px-4 mt-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-14 w-14 text-primary/40 mx-auto" />
            <p className="mt-4 text-muted-foreground">
              Você ainda não favoritou nenhum produto.
            </p>
            <Link
              to="/produtos"
              className="inline-block mt-6 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold"
            >
              Explorar produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}