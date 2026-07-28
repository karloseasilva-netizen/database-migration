import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  ArrowLeft,
  Menu,
  X,
  BarChart3,
  Palette,
  Settings,
  UserCog,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { getMyRoles } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    try {
      const res = await getMyRoles();
      if (!res.roles.includes("admin")) throw redirect({ to: "/" });
    } catch (err: any) {
      if (err?.isRedirect) throw err;
      throw redirect({ to: "/" });
    }
  },
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/estoque", label: "Estoque", icon: Warehouse },
];

type NavGroup = {
  key: string;
  label: string;
  icon: any;
  items: { to: string; label: string }[];
};

const GROUPS: NavGroup[] = [
  {
    key: "relatorios",
    label: "Relatórios",
    icon: BarChart3,
    items: [
      { to: "/admin/relatorios/vendas", label: "Vendas" },
      { to: "/admin/relatorios/mais-vendidos", label: "Produtos mais vendidos" },
      { to: "/admin/relatorios/clientes", label: "Clientes" },
      { to: "/admin/relatorios/exportar", label: "Exportar relatórios" },
    ],
  },
  {
    key: "aparencia",
    label: "Aparência",
    icon: Palette,
    items: [
      { to: "/admin/aparencia/banners", label: "Banners" },
      { to: "/admin/aparencia/home", label: "Página inicial" },
      { to: "/admin/aparencia/destaques", label: "Produtos em destaque" },
    ],
  },
  {
    key: "config",
    label: "Configurações",
    icon: Settings,
    items: [
      { to: "/admin/config/loja", label: "Dados da loja" },
      { to: "/admin/config/pagamento", label: "Formas de pagamento" },
      { to: "/admin/config/frete", label: "Frete" },
      { to: "/admin/config/seo", label: "SEO" },
      { to: "/admin/config/integracoes", label: "Integrações" },
    ],
  },
  {
    key: "usuarios",
    label: "Usuários",
    icon: UserCog,
    items: [
      { to: "/admin/usuarios/admins", label: "Administradores" },
      { to: "/admin/usuarios/funcionarios", label: "Funcionários" },
      { to: "/admin/usuarios/permissoes", label: "Permissões de acesso" },
    ],
  },
  {
    key: "seguranca",
    label: "Segurança",
    icon: Shield,
    items: [
      { to: "/admin/seguranca/login", label: "Login" },
      { to: "/admin/seguranca/logs", label: "Registro de atividades" },
      { to: "/admin/seguranca/backup", label: "Backup" },
    ],
  },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of GROUPS) init[g.key] = pathname.startsWith(`/admin/${g.key}`);
    return init;
  });
  const toggleGroup = (k: string) =>
    setOpenGroups((s) => ({ ...s, [k]: !s[k] }));

  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <>
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to as any}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
              active
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-foreground/70 hover:bg-secondary"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      {GROUPS.map((group) => {
        const groupActive = pathname.startsWith(`/admin/${group.key}`);
        const isOpen = openGroups[group.key] || groupActive;
        return (
          <div key={group.key} className="flex flex-col">
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm transition ${
                groupActive
                  ? "text-primary font-semibold"
                  : "text-foreground/70 hover:bg-secondary"
              }`}
            >
              <span className="flex items-center gap-3">
                <group.icon className="h-4 w-4" />
                {group.label}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="ml-8 mt-1 mb-1 flex flex-col gap-1 border-l border-border pl-3">
                {group.items.map((sub) => {
                  const subActive = pathname === sub.to;
                  return (
                    <Link
                      key={sub.to}
                      to={sub.to as any}
                      onClick={onClick}
                      className={`px-3 py-2 rounded-md text-xs transition ${
                        subActive
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-foreground/70 hover:bg-secondary"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-background border-r border-border p-4 sticky top-0">
          <Link to="/" className="flex items-center gap-2 mb-8 px-2">
            <div className="grid place-items-center h-10 w-10 rounded-full border border-primary/40 text-primary font-serif italic">
              PF
            </div>
            <div>
              <div className="font-serif text-lg text-primary leading-tight">PURO FIO</div>
              <div className="text-[10px] text-muted-foreground tracking-widest">ADMIN</div>
            </div>
          </Link>
          <nav className="flex flex-col gap-1 flex-1">
            <NavItems />
          </nav>
          <Link
            to="/"
            className="mt-4 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition px-3 py-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a loja
          </Link>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="lg:hidden bg-background border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-8 w-8 rounded-full border border-primary/40 text-primary font-serif text-sm italic">
                PF
              </div>
              <div className="font-serif text-primary">Admin</div>
            </div>
            <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-secondary">
              <Menu className="h-5 w-5" />
            </button>
          </header>

          {open && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <aside className="w-72 bg-background h-full p-4 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-serif text-primary text-lg">PURO FIO Admin</div>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-lg hover:bg-secondary"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex flex-col gap-1 flex-1">
                  <NavItems onClick={() => setOpen(false)} />
                </nav>
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="text-xs text-muted-foreground px-3 py-2"
                >
                  ← Voltar para a loja
                </Link>
              </aside>
              <button className="flex-1 bg-foreground/40" onClick={() => setOpen(false)} />
            </div>
          )}

          <main className="p-4 sm:p-8 max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
