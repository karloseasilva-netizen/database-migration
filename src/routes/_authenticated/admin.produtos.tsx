import { createFileRoute } from "@tanstack/react-router";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  X,
  Download,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminListProducts,
  adminGetProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpsertVariant,
  adminDeleteVariant,
  adminBulkImportProducts,
} from "@/lib/admin.functions";
import { CATEGORIES, brl } from "@/lib/shop-data";
import { ImageUpload } from "@/components/admin/ImageUpload";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

const productsQuery = queryOptions({
  queryKey: ["admin", "products"],
  queryFn: () => adminListProducts(),
});

export const Route = createFileRoute("/_authenticated/admin/produtos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: ProductsAdmin,
});

type FormState = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  sku: string;
  price: string;
  old_price: string;
  discount: string;
  tag: string;
  brand: string;
  image_url: string;
  gallery: string[];
  category_slug: string;
  sub: string;
  colors: string;
  sizes: string;
  stock: string;
  low_stock_threshold: string;
  is_active: boolean;
};

const empty: FormState = {
  slug: "",
  name: "",
  description: "",
  sku: "",
  price: "0",
  old_price: "",
  discount: "",
  tag: "",
  brand: "",
  image_url: "",
  gallery: [],
  category_slug: CATEGORIES[0].slug,
  sub: "",
  colors: "",
  sizes: "",
  stock: "0",
  low_stock_threshold: "5",
  is_active: true,
};

function ProductsAdmin() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [modal, setModal] = useState<null | FormState>(null);
  const [isImporting, setIsImporting] = useState(false);

  const createFn = useServerFn(adminCreateProduct);
  const updateFn = useServerFn(adminUpdateProduct);
  const deleteFn = useServerFn(adminDeleteProduct);
  const importFn = useServerFn(adminBulkImportProducts);

  function downloadBaseTemplate() {
    const headers = [
      "Handle/Slug",
      "Nome",
      "Descrição",
      "Preço",
      "Preço Antigo",
      "Desconto (%)",
      "Tag",
      "Marca",
      "URL Imagem",
      "Galeria",
      "Categoria",
      "Subcategoria",
      "Cores Cadastradas",
      "Tamanhos Cadastrados",
      "Estoque Geral",
      "Alerta Estoque Baixo",
      "Ativo",
      "SKU Produto",
      "Variante Tamanho",
      "Variante Cor",
      "Variante SKU",
      "Variante Estoque",
      "Variante Preço",
    ];

    const examples = [
      {
        "Handle/Slug": "sutia-renda-basico",
        Nome: "Sutiã de Renda Básico",
        Descrição: "Sutiã confortável com detalhes em renda e alças reguláveis.",
        Preço: 49.9,
        "Preço Antigo": 59.9,
        "Desconto (%)": 16,
        Tag: "TOP",
        Marca: "Puro Fio",
        "URL Imagem": "https://images.unsplash.com/photo-1594913785162-e67853f23ee7",
        Galeria: "https://images.unsplash.com/photo-1594913785162-e67853f23ee7",
        Categoria: "sutias",
        Subcategoria: "Sem Bojo",
        "Cores Cadastradas": "Preto, Romance",
        "Tamanhos Cadastrados": "P, M, G",
        "Estoque Geral": 0,
        "Alerta Estoque Baixo": 5,
        Ativo: "true",
        "SKU Produto": "SUT-REND-BAS",
        "Variante Tamanho": "M",
        "Variante Cor": "Preto",
        "Variante SKU": "SUT-REND-BAS-M-PRETO",
        "Variante Estoque": 10,
        "Variante Preço": "",
      },
      {
        "Handle/Slug": "sutia-renda-basico",
        Nome: "",
        Descrição: "",
        Preço: 49.9,
        "Preço Antigo": "",
        "Desconto (%)": "",
        Tag: "",
        Marca: "",
        "URL Imagem": "",
        Galeria: "",
        Categoria: "",
        Subcategoria: "",
        "Cores Cadastradas": "",
        "Tamanhos Cadastrados": "",
        "Estoque Geral": "",
        "Alerta Estoque Baixo": "",
        Ativo: "",
        "SKU Produto": "",
        "Variante Tamanho": "G",
        "Variante Cor": "Romance",
        "Variante SKU": "SUT-REND-BAS-G-ROM",
        "Variante Estoque": 15,
        "Variante Preço": "",
      },
      {
        "Handle/Slug": "calcinha-fio-confort",
        Nome: "Calcinha Fio Confort",
        Descrição: "Calcinha modelo fio em algodão antialérgico.",
        Preço: 19.9,
        "Preço Antigo": "",
        "Desconto (%)": "",
        Tag: "NOVO",
        Marca: "Puro Fio",
        "URL Imagem": "https://images.unsplash.com/photo-1594913785162-e67853f23ee7",
        Galeria: "",
        Categoria: "calcinhas",
        Subcategoria: "Fio Dental",
        "Cores Cadastradas": "",
        "Tamanhos Cadastrados": "",
        "Estoque Geral": 50,
        "Alerta Estoque Baixo": 3,
        Ativo: "true",
        "SKU Produto": "CAL-FIO-CONF",
        "Variante Tamanho": "",
        "Variante Cor": "",
        "Variante SKU": "",
        "Variante Estoque": "",
        "Variante Preço": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(examples, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo");
    XLSX.writeFile(wb, "modelo_produtos_purofio.xlsx");
    toast.success("Modelo baixado com sucesso!");
  }

  async function exportToXlsx() {
    try {
      const { data: dbProducts, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (prodErr) throw prodErr;

      const { data: dbVariants, error: varErr } = await supabase
        .from("product_variants")
        .select("*")
        .order("created_at");
      if (varErr) throw varErr;

      const variantsMap = new Map<string, any[]>();
      for (const v of dbVariants || []) {
        const list = variantsMap.get(v.product_id) ?? [];
        list.push(v);
        variantsMap.set(v.product_id, list);
      }

      const rows: any[] = [];

      for (const p of dbProducts || []) {
        const pVariants = variantsMap.get(p.id) ?? [];

        if (pVariants.length === 0) {
          rows.push({
            "Handle/Slug": p.slug,
            Nome: p.name,
            Descrição: p.description ?? "",
            Preço: p.price,
            "Preço Antigo": p.old_price ?? "",
            "Desconto (%)": p.discount ?? "",
            Tag: p.tag ?? "",
            Marca: p.brand ?? "",
            "URL Imagem": p.image_url ?? "",
            Galeria: Array.isArray(p.gallery) ? p.gallery.join(", ") : "",
            Categoria: p.category_slug,
            Subcategoria: p.sub ?? "",
            "Cores Cadastradas": Array.isArray(p.colors) ? p.colors.join(", ") : "",
            "Tamanhos Cadastrados": Array.isArray(p.sizes) ? p.sizes.join(", ") : "",
            "Estoque Geral": p.stock,
            "Alerta Estoque Baixo": p.low_stock_threshold,
            Ativo: p.is_active ? "true" : "false",
            "SKU Produto": p.sku ?? "",
            "Variante Tamanho": "",
            "Variante Cor": "",
            "Variante SKU": "",
            "Variante Estoque": "",
            "Variante Preço": "",
          });
        } else {
          pVariants.forEach((v, index) => {
            rows.push({
              "Handle/Slug": p.slug,
              Nome: index === 0 ? p.name : "",
              Descrição: index === 0 ? (p.description ?? "") : "",
              Preço: p.price,
              "Preço Antigo": index === 0 ? (p.old_price ?? "") : "",
              "Desconto (%)": index === 0 ? (p.discount ?? "") : "",
              Tag: index === 0 ? (p.tag ?? "") : "",
              Marca: index === 0 ? (p.brand ?? "") : "",
              "URL Imagem": index === 0 ? (p.image_url ?? "") : "",
              Galeria: index === 0 && Array.isArray(p.gallery) ? p.gallery.join(", ") : "",
              Categoria: index === 0 ? p.category_slug : "",
              Subcategoria: index === 0 ? (p.sub ?? "") : "",
              "Cores Cadastradas":
                index === 0 && Array.isArray(p.colors) ? p.colors.join(", ") : "",
              "Tamanhos Cadastrados":
                index === 0 && Array.isArray(p.sizes) ? p.sizes.join(", ") : "",
              "Estoque Geral": index === 0 ? p.stock : "",
              "Alerta Estoque Baixo": index === 0 ? p.low_stock_threshold : "",
              Ativo: index === 0 ? (p.is_active ? "true" : "false") : "",
              "SKU Produto": index === 0 ? (p.sku ?? "") : "",
              "Variante Tamanho": v.size ?? "",
              "Variante Cor": v.color ?? "",
              "Variante SKU": v.sku ?? "",
              "Variante Estoque": v.stock,
              "Variante Preço": v.price_override ?? "",
            });
          });
        }
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Produtos");
      XLSX.writeFile(wb, `produtos_exportados_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Produtos exportados com sucesso!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na exportação");
    }
  }

  async function importFromXlsx(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) throw new Error("Não foi possível ler os dados do arquivo.");

        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any>(sheet);

        if (rows.length === 0) throw new Error("A planilha está vazia.");

        const productsMap = new Map<string, any>();

        for (const r of rows) {
          const slug = String(r["Handle/Slug"] || "").trim();
          if (!slug) continue;

          if (!productsMap.has(slug)) {
            let is_active = true;
            if (r["Ativo"] !== undefined && r["Ativo"] !== "") {
              const val = String(r["Ativo"]).toLowerCase().trim();
              is_active = val === "true" || val === "1" || val === "sim" || val === "yes";
            }

            let gallery: string[] = [];
            if (r["Galeria"]) {
              gallery = String(r["Galeria"])
                .split(",")
                .map((url) => url.trim())
                .filter(Boolean);
            }

            let colors: string[] = [];
            if (r["Cores Cadastradas"]) {
              colors = String(r["Cores Cadastradas"])
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
            }

            let sizes: string[] = [];
            if (r["Tamanhos Cadastrados"]) {
              sizes = String(r["Tamanhos Cadastrados"])
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            }

            productsMap.set(slug, {
              slug,
              name: String(r["Nome"] || "").trim(),
              description: String(r["Descrição"] || "").trim(),
              price: Number(r["Preço"]) || 0,
              old_price:
                r["Preço Antigo"] != null && r["Preço Antigo"] !== ""
                  ? Number(r["Preço Antigo"])
                  : null,
              discount:
                r["Desconto (%)"] != null && r["Desconto (%)"] !== ""
                  ? Number(r["Desconto (%)"])
                  : null,
              tag: r["Tag"] ? String(r["Tag"]).trim() : null,
              brand: r["Marca"] ? String(r["Marca"]).trim() : null,
              image_url: String(r["URL Imagem"] || "").trim(),
              gallery,
              category_slug: String(r["Categoria"] || "lingerie").trim(),
              sub: String(r["Subcategoria"] || "").trim(),
              colors,
              sizes,
              stock: Number(r["Estoque Geral"]) || 0,
              low_stock_threshold: Number(r["Alerta Estoque Baixo"]) || 5,
              is_active,
              sku: r["SKU Produto"] ? String(r["SKU Produto"]).trim() : null,
              variants: [],
            });
          }

          const product = productsMap.get(slug);

          if (!product.name && r["Nome"]) {
            product.name = String(r["Nome"]).trim();
          }
          if (!product.description && r["Descrição"]) {
            product.description = String(r["Descrição"]).trim();
          }

          const hasVariant =
            r["Variante Tamanho"] ||
            r["Variante Cor"] ||
            r["Variante SKU"] ||
            r["Variante Estoque"] !== undefined;

          if (hasVariant) {
            product.variants.push({
              size: r["Variante Tamanho"] ? String(r["Variante Tamanho"]).trim() : null,
              color: r["Variante Cor"] ? String(r["Variante Cor"]).trim() : null,
              sku: r["Variante SKU"] ? String(r["Variante SKU"]).trim() : null,
              stock: Number(r["Variante Estoque"]) || 0,
              price_override:
                r["Variante Preço"] != null && r["Variante Preço"] !== ""
                  ? Number(r["Variante Preço"])
                  : null,
            });
          }
        }

        const productsToImport = Array.from(productsMap.values());

        for (const p of productsToImport) {
          if (!p.name) {
            throw new Error(`O produto com o slug "${p.slug}" precisa de um Nome válido.`);
          }
        }

        const res = await importFn({ data: { products: productsToImport } });
        toast.success(`${res.imported_count} produtos importados/atualizados com sucesso!`);
        qc.invalidateQueries({ queryKey: ["admin"] });
        qc.invalidateQueries({ queryKey: ["shop"] });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Falha na importação");
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    };
    reader.onerror = () => {
      toast.error("Falha ao ler o arquivo.");
      setIsImporting(false);
    };
    reader.readAsArrayBuffer(file);
  }

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      const values = {
        slug: f.slug.trim(),
        name: f.name.trim(),
        description: f.description,
        sku: f.sku.trim() || null,
        price: Number(f.price) || 0,
        old_price: f.old_price ? Number(f.old_price) : null,
        discount: f.discount ? Number(f.discount) : null,
        tag: f.tag.trim() || null,
        brand: f.brand.trim() || null,
        image_url: f.image_url.trim(),
        gallery: f.gallery.filter(Boolean),
        category_slug: f.category_slug,
        sub: f.sub,
        colors: f.colors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        sizes: f.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        stock: Number(f.stock) || 0,
        low_stock_threshold: Number(f.low_stock_threshold) || 5,
        is_active: f.is_active,
      };
      if (f.id) return updateFn({ data: { id: f.id, values } });
      return createFn({ data: values });
    },
    onSuccess: () => {
      toast.success("Produto salvo!");
      setModal(null);
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Produto removido.");
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const filtered = products.filter((p: any) => {
    const okQ =
      !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.slug.includes(q.toLowerCase());
    const okC = !cat || p.category_slug === cat;
    return okQ && okC;
  });

  const openNew = () => setModal({ ...empty });
  const openEdit = (p: any) =>
    setModal({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description ?? "",
      sku: p.sku ?? "",
      price: String(p.price),
      old_price: p.old_price != null ? String(p.old_price) : "",
      discount: p.discount != null ? String(p.discount) : "",
      tag: p.tag ?? "",
      brand: p.brand ?? "",
      image_url: p.image_url ?? "",
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      category_slug: p.category_slug,
      sub: p.sub ?? "",
      colors: (p.colors ?? []).join(", "),
      sizes: (p.sizes ?? []).join(", "),
      stock: String(p.stock ?? 0),
      low_stock_threshold: String(p.low_stock_threshold ?? 5),
      is_active: !!p.is_active,
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-primary">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {products.length} produtos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadBaseTemplate}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary text-primary cursor-pointer transition-colors shadow-xs"
            title="Baixar planilha modelo para importação"
          >
            <Download className="h-4 w-4" /> Baixar Modelo
          </button>
          <button
            onClick={exportToXlsx}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary text-primary cursor-pointer transition-colors shadow-xs"
            title="Exportar todos os produtos para XLSX"
          >
            <Download className="h-4 w-4" /> Exportar XLSX
          </button>
          <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary text-primary cursor-pointer transition-colors shadow-xs">
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Importar XLSX
            <input
              type="file"
              accept=".xlsx,.xls"
              disabled={isImporting}
              onChange={importFromXlsx}
              className="hidden"
            />
          </label>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="h-4 w-4" /> Novo produto
          </button>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2 flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou slug"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground border-b border-border bg-secondary/40">
              <tr>
                <th className="text-left px-4 py-3">Produto</th>
                <th className="text-left px-4 py-3">Categoria</th>
                <th className="text-left px-4 py-3">Marca</th>
                <th className="text-left px-4 py-3">Preço</th>
                <th className="text-left px-4 py-3">Estoque</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => {
                const low = Number(p.stock ?? 0) <= Number(p.low_stock_threshold ?? 5);
                return (
                  <tr key={p.id} className="border-b border-border/50 last:border-none">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-lg bg-secondary overflow-hidden shrink-0">
                          {p.image_url && (
                            <img
                              src={p.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0")}
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {CATEGORIES.find((c) => c.slug === p.category_slug)?.name ?? p.category_slug}
                      <div className="text-xs">{p.sub}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.brand ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div>{brl(Number(p.price))}</div>
                      {p.old_price && (
                        <div className="text-xs text-muted-foreground line-through">
                          {brl(Number(p.old_price))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={low ? "text-amber-700 font-semibold" : ""}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${p.is_active ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                      >
                        {p.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-secondary text-primary"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir "${p.name}"?`)) del.mutate(p.id);
                          }}
                          className="p-2 rounded-lg hover:bg-secondary text-destructive"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ProductModal
          form={modal}
          setForm={setModal}
          onClose={() => setModal(null)}
          onSubmit={() => save.mutate(modal)}
          saving={save.isPending}
        />
      )}

      {isImporting && (
        <div className="fixed inset-0 z-50 bg-black/40 flex flex-col items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-background rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl border border-border">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="font-serif text-lg text-primary font-semibold">
              Importando planilha...
            </div>
            <div className="text-xs text-muted-foreground">Isso pode levar alguns segundos.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductModal({
  form,
  setForm,
  onClose,
  onSubmit,
  saving,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  saving: boolean;
}) {
  const [tab, setTab] = useState<"info" | "midia" | "variacoes">("info");
  const [galleryInput, setGalleryInput] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-start sm:items-center justify-center p-3 overflow-y-auto">
      <div className="bg-background rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-xl text-primary">
            {form.id ? "Editar produto" : "Novo produto"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary text-sm">
            Cancelar
          </button>
        </div>

        <div className="border-b border-border px-5 flex gap-1">
          {(["info", "midia", "variacoes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              disabled={t === "variacoes" && !form.id}
              className={`px-4 py-2.5 text-sm border-b-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${
                tab === t
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              {t === "info" ? "Informações" : t === "midia" ? "Mídia" : "Variações"}
            </button>
          ))}
        </div>

        <form
          className="p-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {tab === "info" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome" span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Slug (URL)">
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </Field>
              <Field label="SKU do Produto">
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="Ex: CAL-FIO-BAS-01"
                />
              </Field>
              <Field label="Marca">
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </Field>
              <Field label="Categoria">
                <select
                  value={form.category_slug}
                  onChange={(e) => setForm({ ...form, category_slug: e.target.value, sub: "" })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Subcategoria">
                <select
                  value={form.sub}
                  onChange={(e) => setForm({ ...form, sub: e.target.value })}
                >
                  <option value="">—</option>
                  {(CATEGORIES.find((c) => c.slug === form.category_slug)?.subs ?? []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tag (TOP / NOVO)">
                <input
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                />
              </Field>
              <Field label="Preço (R$)">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </Field>
              <Field label="Preço antigo (R$)">
                <input
                  type="number"
                  step="0.01"
                  value={form.old_price}
                  onChange={(e) => setForm({ ...form, old_price: e.target.value })}
                />
              </Field>
              <Field label="Desconto (%)">
                <input
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                />
              </Field>
              <Field label="Estoque total">
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </Field>
              <Field label="Alerta de estoque baixo (≤)">
                <input
                  type="number"
                  value={form.low_stock_threshold}
                  onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                />
              </Field>
              <Field label="Cores (separadas por vírgula)" span>
                <input
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                />
              </Field>
              <Field label="Tamanhos (separados por vírgula)" span>
                <input
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                />
              </Field>
              <Field label="Descrição" span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
              <label className="col-span-full flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Produto ativo (visível na loja)
              </label>
            </div>
          )}

          {tab === "midia" && (
            <div className="space-y-4">
              <Field label="Imagem principal (URL)" span>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://... ou envie um arquivo abaixo"
                />
              </Field>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                folder="products"
                label="Enviar imagem principal"
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="preview"
                  className="h-40 w-40 object-cover rounded-lg border border-border"
                />
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Galeria (imagens adicionais)
                </div>
                <div className="mb-3">
                  <ImageUpload
                    onChange={(url) => {
                      if (url) setForm({ ...form, gallery: [...form.gallery, url] });
                    }}
                    folder="products"
                    label="Enviar imagem para a galeria"
                  />
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="Cole uma URL de imagem"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const url = galleryInput.trim();
                      if (!url) return;
                      setForm({ ...form, gallery: [...form.gallery, url] });
                      setGalleryInput("");
                    }}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {form.gallery.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-lg bg-secondary overflow-hidden group"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({ ...form, gallery: form.gallery.filter((_, j) => j !== i) })
                        }
                        className="absolute top-1 right-1 p-1 rounded-full bg-background/90 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {form.gallery.length === 0 && (
                    <div className="col-span-full text-xs text-muted-foreground flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Nenhuma imagem adicional
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "variacoes" && form.id && <VariantsEditor productId={form.id} />}

          <div className="flex justify-end gap-2 pt-5 border-t border-border mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-full border border-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-primary text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VariantsEditor({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: () => adminGetProduct({ data: { id: productId } }),
  });
  const upsert = useServerFn(adminUpsertVariant);
  const del = useServerFn(adminDeleteVariant);

  const [row, setRow] = useState({ size: "", color: "", sku: "", stock: "0", price_override: "" });

  const addM = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          values: {
            product_id: productId,
            size: row.size || null,
            color: row.color || null,
            sku: row.sku || null,
            stock: Number(row.stock) || 0,
            price_override: row.price_override ? Number(row.price_override) : null,
          },
        },
      }),
    onSuccess: () => {
      toast.success("Variação adicionada");
      setRow({ size: "", color: "", sku: "", stock: "0", price_override: "" });
      qc.invalidateQueries({ queryKey: ["admin", "product", productId] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "product", productId] }),
  });

  const variants = data?.variants ?? [];

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Adicione combinações de tamanho + cor com estoque próprio. Deixe em branco para variações
        "livres".
      </p>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2">Tamanho</th>
              <th className="text-left px-3 py-2">Cor</th>
              <th className="text-left px-3 py-2">SKU</th>
              <th className="text-left px-3 py-2">Estoque</th>
              <th className="text-left px-3 py-2">Preço</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v: any) => (
              <tr key={v.id} className="border-t border-border">
                <td className="px-3 py-2">{v.size ?? "—"}</td>
                <td className="px-3 py-2">{v.color ?? "—"}</td>
                <td className="px-3 py-2">{v.sku ?? "—"}</td>
                <td className="px-3 py-2">{v.stock}</td>
                <td className="px-3 py-2">
                  {v.price_override != null ? brl(Number(v.price_override)) : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => delM.mutate(v.id)}
                    className="text-destructive text-xs hover:underline"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {variants.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                  Nenhuma variação cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-dashed border-border p-3 grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
        <input
          placeholder="Tamanho"
          value={row.size}
          onChange={(e) => setRow({ ...row, size: e.target.value })}
          className="rounded border border-input bg-background px-2 py-1.5 text-sm"
        />
        <input
          placeholder="Cor"
          value={row.color}
          onChange={(e) => setRow({ ...row, color: e.target.value })}
          className="rounded border border-input bg-background px-2 py-1.5 text-sm"
        />
        <input
          placeholder="SKU"
          value={row.sku}
          onChange={(e) => setRow({ ...row, sku: e.target.value })}
          className="rounded border border-input bg-background px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          placeholder="Estoque"
          value={row.stock}
          onChange={(e) => setRow({ ...row, stock: e.target.value })}
          className="rounded border border-input bg-background px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Preço (opcional)"
          value={row.price_override}
          onChange={(e) => setRow({ ...row, price_override: e.target.value })}
          className="rounded border border-input bg-background px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={() => addM.mutate()}
          disabled={addM.isPending}
          className="rounded bg-primary text-primary-foreground text-sm py-1.5 font-semibold disabled:opacity-60"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  span,
  children,
}: {
  label: string;
  span?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${span ? "sm:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-input [&_input]:bg-background [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-input [&_select]:bg-background [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-input [&_textarea]:bg-background [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-sm">
        {children}
      </div>
    </label>
  );
}
