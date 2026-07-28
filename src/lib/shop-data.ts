import hero from "@/assets/hero.jpg";
import hero2 from "@/assets/hero2.jpg";
import hero3 from "@/assets/hero3.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";

export { hero, hero2, hero3, p1, p2, p3, p4, p5 };

export type Category = { name: string; slug: string; subs: string[]; image: string };

export const CATEGORIES: Category[] = [
  {
    name: "Lingeries | Conjuntos",
    slug: "lingeries-conjuntos",
    subs: ["Básicos", "Rendados", "Robes"],
    image: p1,
  },
  {
    name: "Calcinhas",
    slug: "calcinhas",
    subs: ["Fio", "Sem Costura", "Tanga"],
    image: p3,
  },
  {
    name: "Sutiã",
    slug: "sutia",
    subs: ["Básicos", "Rendados", "Top", "Tomara que Caia"],
    image: p5,
  },
  {
    name: "Pijamas",
    slug: "pijamas",
    subs: ["Baby Dolls", "Camisolas", "Pijamas Clássicos", "Robes"],
    image: p4,
  },
  {
    name: "Plus Size",
    slug: "plus-size",
    subs: ["Calcinhas", "Sutiãs", "Sexy"],
    image: p2,
  },
  {
    name: "Gestante",
    slug: "gestante",
    subs: ["Sutiã Amamentação", "Camisola", "Cinta", "Calcinha de Alta Pressão", "Pijama de Botão"],
    image: hero,
  },
];

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  tag?: "TOP" | "NOVO";
  image: string;
  gallery?: string[];
  categorySlug: string;
  sub: string;
  description: string;
  colors: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  stock: number;
  isFeatured?: boolean;
};

export function mapDbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.slug || dbProduct.id,
    name: dbProduct.name,
    price: Number(dbProduct.price),
    oldPrice: dbProduct.old_price ? Number(dbProduct.old_price) : undefined,
    discount: dbProduct.discount || undefined,
    tag: dbProduct.tag || undefined,
    image: dbProduct.image_url,
    gallery: Array.isArray(dbProduct.gallery) ? dbProduct.gallery : [],
    categorySlug: dbProduct.category_slug,
    sub: dbProduct.sub,
    description: dbProduct.description,
    colors: Array.isArray(dbProduct.colors) ? dbProduct.colors : [],
    sizes: Array.isArray(dbProduct.sizes) ? dbProduct.sizes : [],
    rating: Number(dbProduct.rating || 5),
    reviews: Number(dbProduct.reviews || 0),
    stock: Number(dbProduct.stock || 0),
    isFeatured: dbProduct.is_featured || false,
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "conjunto-renda-delicada",
    name: "Conjunto Renda Delicada",
    price: 129.9,
    tag: "TOP",
    image: p1,
    gallery: [p1, p3, p5],
    categorySlug: "lingeries-conjuntos",
    sub: "Rendados",
    description:
      "Conjunto sutiã e calcinha em renda floral delicada, com detalhes bordados e forro em algodão.",
    colors: ["Rosé", "Nude", "Preto"],
    sizes: ["P", "M", "G", "GG"],
    rating: 4.8,
    reviews: 124,
    stock: 12,
  },
  {
    id: "conjunto-push-up-classic",
    name: "Conjunto Push Up Classic",
    price: 139.9,
    tag: "NOVO",
    image: p2,
    gallery: [p2, p4, p1],
    categorySlug: "lingeries-conjuntos",
    sub: "Básicos",
    description:
      "Sustentação push up com bojo removível e tecido macio para o uso diário.",
    colors: ["Blush", "Branco"],
    sizes: ["36", "38", "40", "42", "44"],
    rating: 4.6,
    reviews: 88,
    stock: 20,
  },
  {
    id: "body-renda-seducao",
    name: "Body Renda Sedução",
    price: 159.9,
    tag: "TOP",
    image: p3,
    gallery: [p3, p1, p2],
    categorySlug: "lingeries-conjuntos",
    sub: "Rendados",
    description: "Body em renda transparente com alças ajustáveis e abertura íntima.",
    colors: ["Rosé", "Preto"],
    sizes: ["P", "M", "G"],
    rating: 4.9,
    reviews: 56,
    stock: 7,
  },
  {
    id: "short-doll-cetim-rose",
    name: "Short Doll Cetim Rosé",
    price: 109.9,
    tag: "NOVO",
    image: p4,
    gallery: [p4, p2],
    categorySlug: "pijamas",
    sub: "Baby Dolls",
    description: "Short doll em cetim leve com fita acetinada, ideal para dormir com estilo.",
    colors: ["Rosé", "Marfim"],
    sizes: ["P", "M", "G", "GG"],
    rating: 4.7,
    reviews: 45,
    stock: 15,
  },
  {
    id: "sutia-sem-bojo-renda",
    name: "Sutiã Sem Bojo Renda",
    price: 99.9,
    image: p5,
    gallery: [p5, p1],
    categorySlug: "sutia",
    sub: "Rendados",
    description: "Sutiã sem bojo e sem aro, com renda maleável e conforto absoluto.",
    colors: ["Nude", "Preto", "Rosé"],
    sizes: ["P", "M", "G"],
    rating: 4.5,
    reviews: 210,
    stock: 33,
  },
  {
    id: "calcinha-fio-delicado",
    name: "Calcinha Fio Delicado",
    price: 49.9,
    tag: "TOP",
    image: p1,
    gallery: [p1],
    categorySlug: "calcinhas",
    sub: "Fio",
    description: "Calcinha fio em renda com laterais finas e caimento perfeito.",
    colors: ["Rosé", "Preto", "Branco"],
    sizes: ["P", "M", "G"],
    rating: 4.4,
    reviews: 320,
    stock: 60,
  },
  {
    id: "camisola-cetim-blush",
    name: "Camisola Cetim Blush",
    price: 179.9,
    tag: "NOVO",
    image: p4,
    gallery: [p4, p2],
    categorySlug: "pijamas",
    sub: "Camisolas",
    description: "Camisola longa em cetim com decote em renda e alças finas.",
    colors: ["Blush", "Champanhe"],
    sizes: ["P", "M", "G", "GG"],
    rating: 4.9,
    reviews: 72,
    stock: 10,
  },
  {
    id: "conjunto-renda-blush",
    name: "Conjunto Renda Blush",
    price: 89.9,
    oldPrice: 149.9,
    discount: 40,
    image: p1,
    gallery: [p1, p2],
    categorySlug: "lingeries-conjuntos",
    sub: "Rendados",
    description: "Conjunto em renda blush, versão com desconto especial.",
    colors: ["Blush"],
    sizes: ["P", "M", "G"],
    rating: 4.6,
    reviews: 41,
    stock: 8,
  },
  {
    id: "camisola-cetim-rose",
    name: "Camisola Cetim Rosé",
    price: 119.9,
    oldPrice: 189.9,
    discount: 37,
    image: p2,
    gallery: [p2],
    categorySlug: "pijamas",
    sub: "Camisolas",
    description: "Camisola em cetim rosé com renda no busto.",
    colors: ["Rosé"],
    sizes: ["P", "M", "G"],
    rating: 4.7,
    reviews: 60,
    stock: 5,
  },
  {
    id: "body-renda-encanto",
    name: "Body Renda Encanto",
    price: 109.9,
    oldPrice: 179.9,
    discount: 39,
    image: p3,
    gallery: [p3],
    categorySlug: "lingeries-conjuntos",
    sub: "Rendados",
    description: "Body encantador em renda com transparências elegantes.",
    colors: ["Rosé", "Preto"],
    sizes: ["P", "M", "G"],
    rating: 4.8,
    reviews: 30,
    stock: 6,
  },
  {
    id: "pijama-cetim-delicado",
    name: "Pijama Cetim Delicado",
    price: 79.9,
    oldPrice: 129.9,
    discount: 38,
    image: p4,
    gallery: [p4],
    categorySlug: "pijamas",
    sub: "Pijamas Clássicos",
    description: "Pijama clássico em cetim, calça e blusa manga longa.",
    colors: ["Rosé", "Marfim"],
    sizes: ["P", "M", "G", "GG"],
    rating: 4.5,
    reviews: 22,
    stock: 9,
  },
  {
    id: "sutia-renda-suave",
    name: "Sutiã Renda Suave",
    price: 69.9,
    oldPrice: 109.9,
    discount: 36,
    image: p5,
    gallery: [p5],
    categorySlug: "sutia",
    sub: "Rendados",
    description: "Sutiã confortável em renda suave, com aro discreto.",
    colors: ["Nude", "Rosé"],
    sizes: ["P", "M", "G"],
    rating: 4.6,
    reviews: 18,
    stock: 14,
  },
  {
    id: "calcinha-sem-costura-nude",
    name: "Calcinha Sem Costura Nude",
    price: 39.9,
    image: p3,
    gallery: [p3],
    categorySlug: "calcinhas",
    sub: "Sem Costura",
    description: "Calcinha invisível sem costura, ideal para peças justas.",
    colors: ["Nude", "Preto", "Branco"],
    sizes: ["P", "M", "G", "GG"],
    rating: 4.7,
    reviews: 140,
    stock: 80,
  },
  {
    id: "calcinha-tanga-basica",
    name: "Calcinha Tanga Básica",
    price: 34.9,
    image: p1,
    gallery: [p1],
    categorySlug: "calcinhas",
    sub: "Tanga",
    description: "Tanga básica em algodão macio, kit com 3 cores.",
    colors: ["Rosé", "Branco", "Preto"],
    sizes: ["P", "M", "G"],
    rating: 4.3,
    reviews: 95,
    stock: 100,
  },
  {
    id: "sutia-top-fitness",
    name: "Sutiã Top Conforto",
    price: 74.9,
    image: p5,
    gallery: [p5],
    categorySlug: "sutia",
    sub: "Top",
    description: "Top de sustentação leve, ideal para o dia a dia.",
    colors: ["Rosé", "Preto"],
    sizes: ["P", "M", "G"],
    rating: 4.4,
    reviews: 66,
    stock: 40,
  },
  {
    id: "sutia-tomara-que-caia",
    name: "Sutiã Tomara que Caia",
    price: 89.9,
    image: p2,
    gallery: [p2],
    categorySlug: "sutia",
    sub: "Tomara que Caia",
    description: "Sutiã sem alças com silicone antiderrapante.",
    colors: ["Nude", "Preto"],
    sizes: ["P", "M", "G"],
    rating: 4.5,
    reviews: 40,
    stock: 22,
  },
  {
    id: "robe-cetim-blush",
    name: "Robe Cetim Blush",
    price: 199.9,
    image: p4,
    gallery: [p4],
    categorySlug: "pijamas",
    sub: "Robes",
    description: "Robe em cetim com cinto, toque sedoso.",
    colors: ["Blush", "Marfim"],
    sizes: ["P/M", "G/GG"],
    rating: 4.9,
    reviews: 25,
    stock: 8,
  },
  {
    id: "conjunto-plus-renda",
    name: "Conjunto Plus Renda",
    price: 159.9,
    tag: "NOVO",
    image: p1,
    gallery: [p1],
    categorySlug: "plus-size",
    sub: "Sutiãs",
    description: "Conjunto plus em renda com modelagem confortável.",
    colors: ["Rosé", "Preto"],
    sizes: ["46", "48", "50", "52"],
    rating: 4.7,
    reviews: 34,
    stock: 12,
  },
  {
    id: "calcinha-plus-alta",
    name: "Calcinha Plus Cintura Alta",
    price: 59.9,
    image: p3,
    gallery: [p3],
    categorySlug: "plus-size",
    sub: "Calcinhas",
    description: "Calcinha plus cintura alta, modela a silhueta.",
    colors: ["Nude", "Preto"],
    sizes: ["46", "48", "50", "52"],
    rating: 4.6,
    reviews: 51,
    stock: 30,
  },
  {
    id: "sutia-amamentacao",
    name: "Sutiã de Amamentação",
    price: 89.9,
    image: p5,
    gallery: [p5],
    categorySlug: "gestante",
    sub: "Sutiã Amamentação",
    description: "Sutiã com abertura frontal, algodão hipoalergênico.",
    colors: ["Nude", "Branco"],
    sizes: ["P", "M", "G", "GG"],
    rating: 4.8,
    reviews: 78,
    stock: 25,
  },
  {
    id: "camisola-gestante",
    name: "Camisola Gestante",
    price: 129.9,
    image: p4,
    gallery: [p4],
    categorySlug: "gestante",
    sub: "Camisola",
    description: "Camisola com abertura para amamentação.",
    colors: ["Rosé", "Branco"],
    sizes: ["P", "M", "G", "GG"],
    rating: 4.7,
    reviews: 32,
    stock: 14,
  },
  {
    id: "cinta-gestante",
    name: "Cinta de Gestante",
    price: 149.9,
    image: p2,
    gallery: [p2],
    categorySlug: "gestante",
    sub: "Cinta",
    description: "Cinta de sustentação para gestantes, alívio lombar.",
    colors: ["Nude"],
    sizes: ["P", "M", "G", "GG"],
    rating: 4.5,
    reviews: 45,
    stock: 18,
  },
];

export const FEATURED_IDS = [
  "conjunto-renda-delicada",
  "conjunto-push-up-classic",
  "body-renda-seducao",
  "short-doll-cetim-rose",
  "sutia-sem-bojo-renda",
  "calcinha-fio-delicado",
  "camisola-cetim-blush",
];

export const OFFER_IDS = PRODUCTS.filter((p) => p.discount).map((p) => p.id);

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}
export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}
export function productsByCategory(slug: string) {
  return PRODUCTS.filter((p) => p.categorySlug === slug);
}

export const HERO_SLIDES = [hero, hero2, hero3];

export const BENEFITS = [
  { icon: "CreditCard", title: "Parcelamento", sub: "em até 10x sem juros" },
  { icon: "Truck", title: "Envios", sub: "para todo Brasil" },
  { icon: "MessageCircle", title: "Atendimento", sub: "via WhatsApp" },
  { icon: "ShieldCheck", title: "Site 100% Seguro", sub: "selo de segurança" },
  { icon: "Gem", title: "Pague com PIX", sub: "e ganhe 5% OFF" },
] as const;