import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard,
  Truck,
  MessageCircle,
  ShieldCheck,
  Gem,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  CATEGORIES,
  FEATURED_IDS,
  HERO_SLIDES,
  OFFER_IDS,
  PRODUCTS,
} from "@/lib/shop-data";
import { ProductCard } from "@/components/shop/ProductCard";
import { useShop } from "@/lib/shop-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Puro Fio Lingerie — Elegância & Confiança" },
      {
        name: "description",
        content:
          "Lingeries sofisticadas e confortáveis. Parcele em até 10x sem juros e ganhe 5% OFF no PIX.",
      },
      { property: "og:title", content: "Puro Fio Lingerie" },
      { property: "og:description", content: "Elegância e delicadeza em cada peça." },
    ],
  }),
  component: Home,
});

function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const featuredRef = useRef<HTMLDivElement | null>(null);
  const { products } = useShop();

  const dbFeatured = products.filter((p) => p.isFeatured);
  const featured = dbFeatured.length > 0
    ? dbFeatured
    : FEATURED_IDS.map((id) => products.find((p) => p.id === id)!).filter(Boolean);

  const dbOffers = products.filter((p) => p.discount);
  const offers = dbOffers.length > 0
    ? dbOffers
    : OFFER_IDS.map((id) => products.find((p) => p.id === id)!).filter(Boolean);

  const { data: dbBanners } = useQuery({
    queryKey: ["home", "banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("image_url, link_url, title, position")
        .eq("is_active", true)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });
  const slides =
    dbBanners && dbBanners.length > 0
      ? dbBanners.map((b) => ({ src: b.image_url, href: b.link_url, title: b.title }))
      : HERO_SLIDES.map((src) => ({ src, href: null as string | null, title: null as string | null }));

  useEffect(() => {
    const id = setInterval(
      () => setHeroIndex((i) => (i + 1) % Math.max(slides.length, 1)),
      5000,
    );
    return () => clearInterval(id);
  }, [slides.length]);

  const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div>
      <section className="w-full mt-3 sm:mt-4">
        <div className="relative overflow-hidden h-[240px] sm:h-[420px] lg:h-[500px]">
          {slides.map((s, i) => {
            const img = (
              <img
                src={s.src}
                alt={s.title ?? ""}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  i === heroIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            );
            return s.href ? (
              <a key={i} href={s.href} className="absolute inset-0">
                {img}
              </a>
            ) : (
              <div key={i}>{img}</div>
            );
          })}
          <button
            onClick={() =>
              setHeroIndex((i) => (i - 1 + slides.length) % slides.length)
            }
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-11 w-11 rounded-full bg-background/70 hover:bg-background transition backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>
          <button
            onClick={() => setHeroIndex((i) => (i + 1) % slides.length)}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-11 w-11 rounded-full bg-background/70 hover:bg-background transition backdrop-blur-sm"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                aria-label={`Ir ao slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === heroIndex ? "w-8 bg-primary" : "w-2 bg-background/70"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-6">
        <div className="bg-secondary/60 rounded-2xl px-6 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {[
            { icon: CreditCard, title: "Parcelamento", sub: "em até 10x sem juros" },
            { icon: Truck, title: "Envios", sub: "para todo Brasil" },
            { icon: MessageCircle, title: "Atendimento", sub: "via WhatsApp" },
            { icon: ShieldCheck, title: "Site 100% Seguro", sub: "selo de segurança" },
            { icon: Gem, title: "Pague com PIX", sub: "e ganhe 5% OFF" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 min-w-0">
              <Icon className="h-7 w-7 text-primary shrink-0" strokeWidth={1.5} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{title}</div>
                <div className="text-xs text-muted-foreground truncate">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl">Destaques</h2>
            <p className="text-sm text-muted-foreground mt-1">
              As favoritas da Puro Fio para você
            </p>
          </div>
          <Link
            to="/produtos"
            className="text-sm rounded-full border border-primary/40 text-primary px-4 py-2 hover:bg-primary/5 transition"
          >
            Ver todos
          </Link>
        </div>
        <div className="relative">
          <button
            onClick={() => scrollBy(featuredRef, -1)}
            aria-label="Anterior"
            className="hidden lg:grid absolute -left-4 top-1/2 -translate-y-1/2 z-10 place-items-center h-12 w-12 rounded-full bg-background border border-border shadow-sm"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>
          <button
            onClick={() => scrollBy(featuredRef, 1)}
            aria-label="Próximo"
            className="hidden lg:grid absolute -right-4 top-1/2 -translate-y-1/2 z-10 place-items-center h-12 w-12 rounded-full bg-background border border-border shadow-sm"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </button>
          <div
            ref={featuredRef}
            className="overflow-x-auto snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex gap-4 lg:gap-5">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} variant="carousel" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-16">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl">Ofertas Especiais</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Descontos exclusivos por tempo limitado
            </p>
          </div>
          <Link
            to="/ofertas"
            className="text-sm rounded-full border border-primary/40 text-primary px-4 py-2 hover:bg-primary/5 transition"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {offers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-16">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl sm:text-4xl">Explore por Categoria</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Encontre o que combina com você
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col items-center"
            >
              <div className="relative overflow-hidden rounded-full aspect-square w-full bg-secondary/40 ring-2 ring-transparent group-hover:ring-primary/40 transition">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="mt-3 text-sm font-semibold text-foreground/90 group-hover:text-primary transition text-center">
                {c.name}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}