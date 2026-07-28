import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, Truck, Star } from "lucide-react";
import { PRODUCTS, brl, getProduct, getCategory, type Product } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-context";
import { ProductCard } from "@/components/shop/ProductCard";
import { PageHeader } from "@/components/shop/PageHeader";

export const Route = createFileRoute("/produtos/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product } as { product: NonNullable<ReturnType<typeof getProduct>> };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Puro Fio Lingerie` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.description },
        ]
      : [{ title: "Produto não encontrado" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { addToCart, favorites, toggleFav } = useShop();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [imgIdx, setImgIdx] = useState(0);
  const gallery = product.gallery ?? [product.image];
  const cat = getCategory(product.categorySlug);
  const related = PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id,
  ).slice(0, 4);
  const favorited = favorites.has(product.id);

  return (
    <div className="pb-16">
      <PageHeader
        title={product.name}
        crumbs={[
          { label: "Produtos" },
          ...(cat ? [{ label: cat.name }] : []),
          { label: product.name },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/40">
            <img
              src={gallery[imgIdx]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.discount && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-bold text-primary-foreground bg-destructive">
                -{product.discount}%
              </span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                    i === imgIdx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(product.rating)
                    ? "fill-primary stroke-primary"
                    : "text-muted-foreground"
                }`}
              />
            ))}
            <span className="text-muted-foreground ml-2">
              {product.rating.toFixed(1)} · {product.reviews} avaliações
            </span>
          </div>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-foreground">
            {product.name}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {brl(product.oldPrice)}
              </span>
            )}
            <span className="text-3xl font-bold text-primary">
              {brl(product.price)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            ou <strong>3x de {brl(product.price / 3)}</strong> sem juros · 5% OFF no PIX
          </div>

          <p className="mt-6 text-sm text-foreground/80 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-6">
            <div className="text-sm font-semibold mb-2">
              Cor: <span className="text-muted-foreground font-normal">{color}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-4 py-2 rounded-full text-sm border transition ${
                    color === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground/80 hover:border-primary/60"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold mb-2">Tamanho</div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-[3rem] px-4 py-2 rounded-full text-sm border transition ${
                    size === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground/80 hover:border-primary/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2 border border-border rounded-full px-2 py-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid place-items-center h-8 w-8 rounded-full hover:bg-secondary"
                aria-label="Diminuir"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="grid place-items-center h-8 w-8 rounded-full hover:bg-secondary"
                aria-label="Aumentar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => addToCart(product.id, qty)}
              className="flex-1 rounded-full bg-primary text-primary-foreground py-3 font-semibold hover:opacity-95 transition"
            >
              Adicionar ao Carrinho
            </button>
            <button
              onClick={() => toggleFav(product.id)}
              aria-label="Favoritar"
              className="grid place-items-center h-12 w-12 rounded-full border border-border hover:border-primary transition"
            >
              <Heart
                className={`h-5 w-5 ${
                  favorited ? "fill-primary stroke-primary" : "text-primary"
                }`}
              />
            </button>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {product.stock > 0
              ? `${product.stock} unidades em estoque`
              : "Fora de estoque"}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 bg-secondary/40 rounded-xl p-4">
              <Truck className="h-6 w-6 text-primary shrink-0" />
              <div className="text-sm">
                <div className="font-semibold">Frete para todo Brasil</div>
                <div className="text-xs text-muted-foreground">
                  Frete grátis acima de R$ 199
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-secondary/40 rounded-xl p-4">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
              <div className="text-sm">
                <div className="font-semibold">Compra 100% segura</div>
                <div className="text-xs text-muted-foreground">Site com SSL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 mt-16">
          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 className="font-serif text-2xl sm:text-3xl">Você também vai amar</h2>
            {cat && (
              <Link
                to="/categoria/$slug"
                params={{ slug: cat.slug }}
                className="text-sm text-primary hover:underline"
              >
                Ver mais em {cat.name}
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}