import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  HelpCircle,
  User,
  ShoppingCart,
  Menu,
  ChevronDown,
  X,
  Phone,
  Mail,
  Heart,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-context";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { getMyRoles } from "@/lib/admin.functions";
import { Shield } from "lucide-react";
import logoUrl from "@/assets/logo-puro-fio.png";

export function Header() {
  const { cartCount, setCartOpen } = useShop();
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
  const [user, setUser] = useState<SupaUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const rolesQuery = useQuery({
    queryKey: ["me", "roles", user?.id],
    queryFn: () => getMyRoles(),
    enabled: !!user,
    staleTime: 60_000,
  });
  const isAdmin = rolesQuery.data?.roles.includes("admin");

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate({ to: "/produtos", search: q ? { q } : {} });
    setMobileSearchOpen(false);
  };

  return (
    <>
      <div
        className="w-full text-primary-foreground text-[11px] sm:text-xs"
        style={{ background: "var(--rose-deep)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between gap-4">
          <span className="hidden sm:inline opacity-95">
            Frete grátis acima de R$ 199 · Até 10x sem juros
          </span>
          <span className="sm:hidden opacity-95">Frete grátis acima de R$ 199</span>
          <div className="flex items-center gap-4">
            <a href="tel:+5511999999999" className="hidden sm:inline-flex items-center gap-1 hover:opacity-80">
              <Phone className="h-3 w-3" /> (11) 99999-9999
            </a>
            {user ? (
              <button onClick={signOut} className="inline-flex items-center gap-1 hover:opacity-80">
                <LogOut className="h-3 w-3" /> Sair
              </button>
            ) : (
              <Link to="/auth" className="inline-flex items-center gap-1 hover:opacity-80">
                <User className="h-3 w-3" /> Entrar
              </Link>
            )}
          </div>
        </div>
      </div>

      <header className="bg-background border-b border-border/50 sticky top-0 z-40">
        <div className="md:hidden mx-auto px-4 py-3 grid grid-cols-[auto_1fr_auto_auto] items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menu"
            className="rounded-full p-2 hover:bg-secondary transition"
          >
            <Menu className="h-6 w-6 text-primary" />
          </button>
          <Link to="/" className="flex items-center justify-center min-w-0">
            <img src={logoUrl} alt="Puro Fio Lingerie" className="h-10 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setMobileSearchOpen((s) => !s)}
            aria-label="Buscar"
            className="rounded-full p-2 hover:bg-secondary transition"
          >
            <Search className="h-5 w-5 text-primary" />
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative rounded-full p-2 hover:bg-secondary transition"
            aria-label="Carrinho"
          >
            <ShoppingCart className="h-5 w-5 text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid place-items-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3">
            <form
              onSubmit={submitSearch}
              className="flex items-center bg-secondary rounded-full px-4 py-2.5"
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que deseja procurar?"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
              />
              <button type="submit" className="text-primary shrink-0">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        <div className="hidden md:grid mx-auto max-w-7xl px-4 py-5 grid-cols-[auto_1fr_auto] items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center shrink-0">
            <img src={logoUrl} alt="Puro Fio Lingerie" className="h-14 w-auto object-contain" />
          </Link>

          <form
            onSubmit={submitSearch}
            className="flex items-center bg-secondary rounded-full px-5 py-3 min-w-0"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que deseja procurar?"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground min-w-0"
            />
            <button type="submit" className="text-primary shrink-0">
              <Search className="h-5 w-5" />
            </button>
          </form>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <Link to="/favoritos" className="hidden md:flex items-center gap-2 text-sm">
              <Heart className="h-6 w-6 text-primary" />
              <div className="leading-tight">
                <div className="text-xs text-muted-foreground">Meus</div>
                <div className="font-semibold">Favoritos</div>
              </div>
            </Link>
            <a href="#" className="hidden md:flex items-center gap-2 text-sm">
              <HelpCircle className="h-6 w-6 text-primary" />
              <div className="leading-tight">
                <div className="text-xs text-muted-foreground">Precisa de Ajuda?</div>
                <div className="font-semibold">Atendimento</div>
              </div>
            </a>
            {user ? (
              <Link to="/conta" className="hidden md:flex items-center gap-2 text-sm">
                <User className="h-6 w-6 text-primary" />
                <div className="leading-tight">
                  <div className="text-xs text-muted-foreground">Olá,</div>
                  <div className="font-semibold truncate max-w-[120px]">{(user.user_metadata?.full_name as string)?.split(" ")[0] || user.email?.split("@")[0]}</div>
                </div>
              </Link>
            ) : (
              <Link to="/auth" className="hidden md:flex items-center gap-2 text-sm">
                <User className="h-6 w-6 text-primary" />
                <div className="leading-tight">
                  <div className="text-xs text-muted-foreground">Minha Conta</div>
                  <div className="font-semibold">Entrar</div>
                </div>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="hidden md:flex items-center gap-2 text-sm">
                <Shield className="h-6 w-6 text-primary" />
                <div className="leading-tight">
                  <div className="text-xs text-muted-foreground">Painel</div>
                  <div className="font-semibold">Admin</div>
                </div>
              </Link>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2 hover:bg-secondary transition"
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-6 w-6 text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 grid place-items-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <nav className="hidden md:flex mx-auto max-w-7xl px-4 pb-4 flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.slug} className="relative group">
              <Link
                to="/categoria/$slug"
                params={{ slug: cat.slug }}
                className="uppercase text-xs sm:text-sm tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition text-foreground/80 hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary font-semibold" }}
              >
                {cat.name}
              </Link>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute left-0 top-full pt-2 z-30 min-w-[220px]">
                <div className="bg-background border border-border rounded-xl shadow-lg py-2">
                  {cat.subs.map((sub) => (
                    <Link
                      key={sub}
                      to="/categoria/$slug"
                      params={{ slug: cat.slug }}
                      search={{ sub }}
                      className="block px-4 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-primary transition"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
      </header>

      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <aside className="w-[85%] max-w-sm bg-background h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <img src={logoUrl} alt="Puro Fio Lingerie" className="h-9 w-auto object-contain" />
              <button
                onClick={() => setMobileNavOpen(false)}
                className="rounded-full p-2 hover:bg-secondary"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 border-b border-border grid grid-cols-2 gap-3">
              <Link
                to="/favoritos"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-3 text-sm"
              >
                <Heart className="h-5 w-5 text-primary" />
                <span className="font-semibold">Favoritos</span>
              </Link>
              <Link
                to={user ? "/conta" : "/auth"}
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-3 text-sm"
              >
                <User className="h-5 w-5 text-primary" />
                <span className="font-semibold">{user ? "Minha Conta" : "Entrar"}</span>
              </Link>
            </div>

            <nav className="p-3 flex-1">
              <div className="px-2 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                Navegação
              </div>
              <Link
                to="/"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-3 text-sm font-semibold border-b border-border/60"
              >
                Início
              </Link>
              <Link
                to="/produtos"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-3 text-sm font-semibold border-b border-border/60"
              >
                Todos os produtos
              </Link>
              <Link
                to="/ofertas"
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-3 text-sm font-semibold border-b border-border/60 text-destructive"
              >
                Ofertas Especiais
              </Link>
              <div className="px-2 pt-4 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
                Categorias
              </div>
              {CATEGORIES.map((cat) => {
                const open = expandedMobileCat === cat.name;
                return (
                  <div key={cat.slug} className="border-b border-border/60 last:border-none">
                    <button
                      onClick={() => setExpandedMobileCat(open ? null : cat.name)}
                      className="w-full flex items-center justify-between px-3 py-3.5 text-sm font-semibold text-foreground/90"
                    >
                      <span className="uppercase tracking-wider">{cat.name}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-primary transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {open && (
                      <div className="pb-2 pl-5">
                        <Link
                          to="/categoria/$slug"
                          params={{ slug: cat.slug }}
                          onClick={() => setMobileNavOpen(false)}
                          className="block w-full text-left px-3 py-2 text-sm text-primary"
                        >
                          Ver todos
                        </Link>
                        {cat.subs.map((sub) => (
                          <Link
                            key={sub}
                            to="/categoria/$slug"
                            params={{ slug: cat.slug }}
                            search={{ sub }}
                            onClick={() => setMobileNavOpen(false)}
                            className="block w-full text-left px-3 py-2 text-sm text-foreground/75 hover:text-primary transition"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="p-5 border-t border-border text-xs text-muted-foreground space-y-2">
              {user && (
                <button onClick={() => { signOut(); setMobileNavOpen(false); }} className="flex items-center gap-2 text-primary font-semibold mb-2">
                  <LogOut className="h-4 w-4" /> Sair da conta
                </button>
              )}
              <a href="tel:+5511999999999" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> (11) 99999-9999
              </a>
              <a href="mailto:contato@purofio.com.br" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> contato@purofio.com.br
              </a>
            </div>
          </aside>
          <button
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
            className="flex-1 bg-foreground/40"
          />
        </div>
      )}
    </>
  );
}