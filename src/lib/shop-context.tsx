import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS } from "./shop-data";

type CartCtx = {
  cart: Record<string, number>;
  favorites: Set<string>;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addToCart: (id: string, qty?: number) => void;
  decCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleFav: (id: string) => void;
  cartCount: number;
  cartTotal: number;
};

const Ctx = createContext<CartCtx | null>(null);

function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [key]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, hydrated]);
  return [value, setValue] as const;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useLocal<Record<string, number>>("pf:cart", {});
  const [favArr, setFavArr] = useLocal<string[]>("pf:fav", []);
  const [cartOpen, setCartOpen] = useState(false);

  const favorites = useMemo(() => new Set(favArr), [favArr]);

  const addToCart = useCallback(
    (id: string, qty = 1) => {
      setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + qty }));
      setCartOpen(true);
    },
    [setCart],
  );
  const decCart = useCallback(
    (id: string) =>
      setCart((prev) => {
        const next = { ...prev };
        if (!next[id]) return prev;
        next[id] -= 1;
        if (next[id] <= 0) delete next[id];
        return next;
      }),
    [setCart],
  );
  const removeFromCart = useCallback(
    (id: string) =>
      setCart((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [setCart],
  );
  const clearCart = useCallback(() => setCart({}), [setCart]);
  const toggleFav = useCallback(
    (id: string) =>
      setFavArr((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    [setFavArr],
  );

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const value: CartCtx = {
    cart,
    favorites,
    cartOpen,
    setCartOpen,
    addToCart,
    decCart,
    removeFromCart,
    clearCart,
    toggleFav,
    cartCount,
    cartTotal,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useShop must be used within ShopProvider");
  return c;
}