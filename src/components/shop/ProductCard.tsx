import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { brl, type Product } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-context";

export function ProductCard({
  product,
  variant = "grid",
}: {
  product: Product;
  variant?: "grid" | "carousel";
}) {
  const { favorites, toggleFav, addToCart } = useShop();
  const navigate = useNavigate();
  const favorited = favorites.has(product.id);
  const installment = product.price / 3;
  const wrapper =
    variant === "carousel"
      ? "shrink-0 basis-[70%] sm:basis-[45%] lg:basis-[calc((100%-4*1.25rem)/5)] min-w-[220px] snap-start flex flex-col cursor-pointer group"
      : "flex flex-col cursor-pointer group";
  const goToProduct = () => navigate({ to: "/produtos/$id", params: { id: product.id } });
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div
      className={wrapper}
      onClick={goToProduct}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToProduct();
        }
      }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-secondary/40 aspect-square">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.discount ? (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider text-primary-foreground bg-destructive">
            -{product.discount}%
          </span>
        ) : product.tag ? (
          <span
            className={`absolute top-3 left-3 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider text-primary-foreground ${
              product.tag === "TOP" ? "bg-primary" : "bg-accent-foreground"
            }`}
          >
            {product.tag}
          </span>
        ) : null}
        <button
          onClick={(e) => {
            stop(e);
            toggleFav(product.id);
          }}
          aria-label="Favoritar"
          className="absolute top-3 right-3 grid place-items-center h-9 w-9 rounded-full bg-background/90 hover:bg-background transition"
        >
          <Heart
            className={`h-4 w-4 ${favorited ? "fill-primary stroke-primary" : "text-primary"}`}
          />
        </button>
      </div>
      <div className="pt-4 text-center flex-1 flex flex-col">
        <span className="text-sm text-foreground/90 group-hover:text-primary transition line-clamp-2">
          {product.name}
        </span>
        <div className="mt-2 flex items-baseline justify-center gap-2">
          {product.oldPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {brl(product.oldPrice)}
            </span>
          ) : null}
          <span className="text-lg font-bold text-primary">{brl(product.price)}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          ou <strong>3x de {brl(installment)}</strong> sem juros
        </div>
        <button
          onClick={(e) => {
            stop(e);
            addToCart(product.id);
          }}
          className="mt-4 rounded-full bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-95 transition"
        >
          Comprar
        </button>
      </div>
    </div>
  );
}
