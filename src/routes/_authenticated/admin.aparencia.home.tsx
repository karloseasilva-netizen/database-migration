import { createFileRoute, Link } from "@tanstack/react-router";
import { Images, Star, LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/aparencia/home")({
  component: HomeConfig,
});

function HomeConfig() {
  const sections = [
    {
      to: "/admin/aparencia/banners",
      label: "Banners do topo",
      desc: "Gerencie as imagens do carrossel principal.",
      icon: Images,
    },
    {
      to: "/admin/aparencia/destaques",
      label: "Produtos em destaque",
      desc: "Escolha os produtos exibidos na seção Destaques.",
      icon: Star,
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-primary">Página inicial</h1>
        <p className="text-sm text-muted-foreground">
          Configure as seções que aparecem na home da loja.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to as any}
            className="bg-background rounded-2xl border border-border p-6 hover:border-primary/50 transition"
          >
            <s.icon className="h-6 w-6 text-primary" />
            <div className="font-serif text-lg text-primary mt-3">{s.label}</div>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
          </Link>
        ))}
        <div className="bg-background rounded-2xl border border-dashed border-border p-6">
          <LayoutGrid className="h-6 w-6 text-muted-foreground" />
          <div className="font-serif text-lg text-foreground mt-3">Categorias em destaque</div>
          <p className="text-sm text-muted-foreground mt-1">
            Definidas automaticamente com base nas categorias cadastradas em Produtos.
          </p>
        </div>
      </div>
    </div>
  );
}
