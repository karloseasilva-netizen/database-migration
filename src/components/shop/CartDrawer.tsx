import { Link } from "@tanstack/react-router";
import { X, Plus, Minus } from "lucide-react";
import { useShop } from "@/lib/shop-context";
import { PRODUCTS, brl } from "@/lib/shop-data";

export function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    cartTotal,
    addToCart,
    decCart,
    removeFromCart,
  } = useShop();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        aria-label="Fechar"
        onClick={() => setCartOpen(false)}
        className="flex-1 bg-foreground/40"
      />
      <aside className="w-full max-w-md bg-background h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-serif text-2xl text-primary">Seu Carrinho</h3>
          <button
            onClick={() => setCartOpen(false)}
            className="rounded-full p-2 hover:bg-secondary"
            aria-label="Fechar carrinho"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 p-5 space-y-4">
          {cartCount === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              Seu carrinho está vazio.
            </p>
          )}
          {Object.entries(cart).map(([id, qty]) => {
            const p = PRODUCTS.find((x) => x.id === id);
            if (!p) return null;
            return (
              <div
                key={id}
                className="flex gap-3 items-center bg-secondary/40 rounded-xl p-3"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-sm text-primary font-semibold">
                    {brl(p.price)}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      onClick={() => decCart(id)}
                      className="grid place-items-center h-6 w-6 rounded-full bg-background border border-border"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm w-6 text-center">{qty}</span>
                    <button
                      onClick={() => addToCart(id)}
                      className="grid place-items-center h-6 w-6 rounded-full bg-background border border-border"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remover"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
        {cartCount > 0 && (
          <div className="border-t border-border p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{brl(cartTotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/carrinho"
                onClick={() => setCartOpen(false)}
                className="rounded-full border border-primary/40 text-primary py-3 text-center text-sm font-semibold hover:bg-primary/5 transition"
              >
                Ver Carrinho
              </Link>
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="rounded-full bg-primary text-primary-foreground py-3 text-center text-sm font-semibold hover:opacity-95 transition"
              >
                Finalizar
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}