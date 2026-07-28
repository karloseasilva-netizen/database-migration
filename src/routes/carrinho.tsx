import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { brl } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-context";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — Puro Fio Lingerie" },
      { name: "description", content: "Revise suas escolhas e finalize a compra." },
      { property: "og:title", content: "Carrinho — Puro Fio" },
      { property: "og:description", content: "Revise seu pedido na Puro Fio." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, addToCart, decCart, removeFromCart, cartTotal, cartCount, clearCart, products } =
    useShop();
  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? { p, qty } : null;
    })
    .filter(Boolean) as { p: any; qty: number }[];

  const shipping = cartTotal >= 199 ? 0 : cartTotal > 0 ? 19.9 : 0;
  const pixTotal = (cartTotal + shipping) * 0.95;

  if (cartCount === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-primary/40 mx-auto" />
        <h1 className="mt-6 font-serif text-3xl">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted-foreground">
          Que tal explorar nossas peças e adicionar suas favoritas?
        </p>
        <Link
          to="/produtos"
          className="inline-block mt-8 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <h1 className="font-serif text-3xl sm:text-4xl">Seu Carrinho</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {cartCount} {cartCount === 1 ? "item" : "itens"}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          {items.map(({ p, qty }) => (
            <div
              key={p.id}
              className="flex gap-4 items-center bg-background border border-border rounded-2xl p-4"
            >
              <Link to="/produtos/$id" params={{ id: p.id }} className="shrink-0">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-24 w-24 rounded-xl object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to="/produtos/$id"
                  params={{ id: p.id }}
                  className="font-medium hover:text-primary transition line-clamp-2"
                >
                  {p.name}
                </Link>
                <div className="text-sm text-muted-foreground mt-1">{brl(p.price)}</div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => decCart(p.id)}
                    className="grid place-items-center h-8 w-8 rounded-full border border-border"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => addToCart(p.id)}
                    className="grid place-items-center h-8 w-8 rounded-full border border-border"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="font-bold text-primary">{brl(p.price * qty)}</div>
                <button
                  onClick={() => removeFromCart(p.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remover"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <Link to="/produtos" className="text-sm text-primary hover:underline">
              ← Continuar comprando
            </Link>
            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive"
            >
              Esvaziar carrinho
            </button>
          </div>
        </div>

        <aside className="bg-secondary/40 rounded-2xl p-6 h-max lg:sticky lg:top-32 space-y-4">
          <h2 className="font-serif text-xl text-primary">Resumo do pedido</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{brl(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span>{shipping === 0 ? "Grátis" : brl(shipping)}</span>
          </div>
          {cartTotal < 199 && (
            <p className="text-xs text-muted-foreground">
              Faltam {brl(199 - cartTotal)} para frete grátis
            </p>
          )}
          <div className="border-t border-border pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>{brl(cartTotal + shipping)}</span>
          </div>
          <div className="text-xs text-primary">
            No PIX por {brl(pixTotal)} (5% OFF)
          </div>
          <Link
            to="/checkout"
            className="block text-center rounded-full bg-primary text-primary-foreground py-3 font-semibold hover:opacity-95 transition"
          >
            Finalizar Compra
          </Link>
          <div className="space-y-2 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Envio para todo Brasil
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Compra 100% segura
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}