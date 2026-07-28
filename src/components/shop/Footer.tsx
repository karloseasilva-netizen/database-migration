import { Link } from "@tanstack/react-router";
import { Phone, Mail } from "lucide-react";
import { CATEGORIES } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-context";
import logoUrl from "@/assets/logo-puro-fio.png";

export function Footer() {
  const { settings } = useShop();
  const store = settings.store ?? {};

  return (
    <footer className="mt-20 bg-secondary/40 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <img src={logoUrl} alt={store.name || "Puro Fio Lingerie"} className="h-16 w-auto object-contain" />
          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
            Lingeries sofisticadas e confortáveis, feitas para valorizar o seu
            corpo com a máxima delicadeza e luxo cotidiano.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg text-primary mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li><Link to="/" className="hover:text-primary transition">Início</Link></li>
            <li><Link to="/produtos" className="hover:text-primary transition">Todos os Produtos</Link></li>
            <li><Link to="/ofertas" className="hover:text-primary transition">Ofertas Especiais</Link></li>
            <li><Link to="/favoritos" className="hover:text-primary transition">Favoritos</Link></li>
            <li><Link to="/admin" className="hover:text-primary transition">Área Administrativa</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg text-primary mb-4">Categorias</h4>
          <ul className="space-y-2 text-sm text-foreground/80">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/categoria/$slug"
                  params={{ slug: c.slug }}
                  className="hover:text-primary transition"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg text-primary mb-4">Contato</h4>
          <ul className="space-y-3 text-sm text-foreground/80">
            {store.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${store.phone.replace(/\D/g, "")}`} className="hover:text-primary transition">
                  {store.phone}
                </a>
              </li>
            )}
            {store.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${store.email}`} className="hover:text-primary transition">
                  {store.email}
                </a>
              </li>
            )}
            {store.cnpj && (
              <li className="text-xs text-muted-foreground mt-2">
                CNPJ: {store.cnpj}
              </li>
            )}
            {store.address && (
              <li className="text-xs text-muted-foreground leading-relaxed mt-1 whitespace-pre-line">
                {store.address}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-5">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {store.name || "Puro Fio Lingerie"}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}