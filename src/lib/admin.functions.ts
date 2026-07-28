import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(context: { userId: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
  return supabaseAdmin;
}

// ---------- Roles ----------
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return { roles: (data ?? []).map((r) => r.role as string) };
  });

// ---------- Products ----------
const productInput = z.object({
  slug: z.string().min(2).max(120),
  name: z.string().min(2).max(200),
  description: z.string().max(4000).default(""),
  price: z.number().nonnegative(),
  old_price: z.number().nonnegative().nullable().optional(),
  discount: z.number().int().min(0).max(100).nullable().optional(),
  tag: z.string().max(20).nullable().optional(),
  image_url: z.string().max(1000).default(""),
  gallery: z.array(z.string()).default([]),
  brand: z.string().max(120).nullable().optional(),
  category_slug: z.string().min(1).max(80),
  sub: z.string().max(80).default(""),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
  low_stock_threshold: z.number().int().min(0).default(5),
  is_active: z.boolean().default(true),
});

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const { data, error } = await admin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const [{ data: product }, { data: variants }] = await Promise.all([
      admin.from("products").select("*").eq("id", data.id).maybeSingle(),
      admin.from("product_variants").select("*").eq("product_id", data.id).order("created_at"),
    ]);
    return { product, variants: variants ?? [] };
  });

export const adminCreateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => productInput.parse(d))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const { data: row, error } = await admin
      .from("products")
      .insert(data as any)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), values: productInput }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const { data: row, error } = await admin
      .from("products")
      .update(data.values as any)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const { error } = await admin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Variants ----------
const variantInput = z.object({
  product_id: z.string().uuid(),
  size: z.string().max(40).nullable().optional(),
  color: z.string().max(40).nullable().optional(),
  sku: z.string().max(80).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  price_override: z.number().nonnegative().nullable().optional(),
});

export const adminUpsertVariant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid().optional(), values: variantInput }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    if (data.id) {
      const { data: row, error } = await admin
        .from("product_variants")
        .update(data.values as any)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await admin
      .from("product_variants")
      .insert(data.values as any)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteVariant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const { error } = await admin.from("product_variants").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Orders ----------
export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const { data, error } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const [{ data: order }, { data: history }] = await Promise.all([
      admin.from("orders").select("*, order_items(*)").eq("id", data.id).maybeSingle(),
      admin
        .from("order_status_history")
        .select("*")
        .eq("order_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    return { order, history: history ?? [] };
  });

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pendente", "pago", "enviado", "entregue", "cancelado"]).optional(),
        tracking_code: z.string().max(120).nullable().optional(),
        tracking_url: z.string().max(500).nullable().optional(),
        note: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.tracking_code !== undefined) patch.tracking_code = data.tracking_code;
    if (data.tracking_url !== undefined) patch.tracking_url = data.tracking_url;
    if (Object.keys(patch).length) {
      const { error } = await admin
        .from("orders")
        .update(patch as any)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    }
    if (data.status !== undefined) {
      await admin.from("order_status_history").insert({
        order_id: data.id,
        status: data.status,
        note: data.note ?? null,
        author_id: context.userId,
      } as any);
    }
    return { ok: true };
  });

// ---------- Customers ----------
export const adminListCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const [{ data: profiles }, ordersRes, authList] = await Promise.all([
      admin.from("profiles").select("*"),
      admin.from("orders").select("id, user_id, total, status, created_at"),
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ]);
    const orders = ordersRes.data ?? [];
    const byUser = new Map<string, { count: number; spent: number; last: string | null }>();
    for (const o of orders as any[]) {
      if (!o.user_id) continue;
      const cur = byUser.get(o.user_id) ?? { count: 0, spent: 0, last: null };
      cur.count += 1;
      if (o.status !== "cancelado") cur.spent += Number(o.total ?? 0);
      if (!cur.last || o.created_at > cur.last) cur.last = o.created_at;
      byUser.set(o.user_id, cur);
    }
    const profilesById = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return (authList.data.users ?? []).map((u) => {
      const p: any = profilesById.get(u.id) ?? {};
      const stats = byUser.get(u.id) ?? { count: 0, spent: 0, last: null };
      return {
        id: u.id,
        email: u.email ?? null,
        created_at: u.created_at,
        full_name: p.full_name ?? (u.user_metadata?.full_name as string | undefined) ?? null,
        phone: p.phone ?? null,
        address: {
          street: p.address_street ?? null,
          number: p.address_number ?? null,
          complement: p.address_complement ?? null,
          city: p.address_city ?? null,
          state: p.address_state ?? null,
          zip: p.address_zip ?? null,
        },
        orders_count: stats.count,
        total_spent: stats.spent,
        last_order_at: stats.last,
      };
    });
  });

export const adminGetCustomerOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const { data: orders, error } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", data.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return orders ?? [];
  });

// ---------- Stock ----------
export const adminListStock = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const [{ data: products }, { data: variants }, { data: movements }] = await Promise.all([
      admin
        .from("products")
        .select("id, name, slug, image_url, stock, low_stock_threshold, category_slug"),
      admin.from("product_variants").select("*"),
      admin.from("stock_movements").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    return {
      products: products ?? [],
      variants: variants ?? [],
      movements: movements ?? [],
    };
  });

export const adminRecordStockMovement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        product_id: z.string().uuid(),
        variant_id: z.string().uuid().nullable().optional(),
        kind: z.enum(["entrada", "saida", "ajuste"]),
        quantity: z.number().int(),
        reason: z.string().max(300).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);

    // Update stock on target row
    if (data.variant_id) {
      const { data: v } = await admin
        .from("product_variants")
        .select("stock")
        .eq("id", data.variant_id)
        .maybeSingle();
      const current = Number(v?.stock ?? 0);
      const next =
        data.kind === "entrada"
          ? current + Math.abs(data.quantity)
          : data.kind === "saida"
            ? current - Math.abs(data.quantity)
            : data.quantity;
      const { error } = await admin
        .from("product_variants")
        .update({ stock: Math.max(0, next) })
        .eq("id", data.variant_id);
      if (error) throw new Error(error.message);
    } else {
      const { data: p } = await admin
        .from("products")
        .select("stock")
        .eq("id", data.product_id)
        .maybeSingle();
      const current = Number(p?.stock ?? 0);
      const next =
        data.kind === "entrada"
          ? current + Math.abs(data.quantity)
          : data.kind === "saida"
            ? current - Math.abs(data.quantity)
            : data.quantity;
      const { error } = await admin
        .from("products")
        .update({ stock: Math.max(0, next) })
        .eq("id", data.product_id);
      if (error) throw new Error(error.message);
    }

    const { error } = await admin.from("stock_movements").insert({
      product_id: data.product_id,
      variant_id: data.variant_id ?? null,
      kind: data.kind,
      quantity: data.quantity,
      reason: data.reason ?? null,
      author_id: context.userId,
    } as any);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Dashboard ----------
export const adminDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const [productsRes, ordersRes, itemsRes, authList] = await Promise.all([
      admin.from("products").select("id, name, stock, low_stock_threshold", { count: "exact" }),
      admin
        .from("orders")
        .select("id, total, status, created_at, customer_name")
        .order("created_at", { ascending: false }),
      admin.from("order_items").select("product_name, quantity, price"),
      admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    ]);
    const orders = (ordersRes.data ?? []) as any[];
    const validOrders = orders.filter((o) => o.status !== "cancelado");
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const inRange = (iso: string, days: number) => now - new Date(iso).getTime() < days * dayMs;
    const sum = (arr: any[]) => arr.reduce((s, o) => s + Number(o.total ?? 0), 0);

    const revenueToday = sum(validOrders.filter((o) => inRange(o.created_at, 1)));
    const revenueWeek = sum(validOrders.filter((o) => inRange(o.created_at, 7)));
    const revenueMonth = sum(validOrders.filter((o) => inRange(o.created_at, 30)));
    const revenueAll = sum(validOrders);

    // 30-day chart series (buckets by day)
    const buckets: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      const key = d.toISOString().slice(0, 10);
      buckets.push({ date: key, revenue: 0, orders: 0 });
    }
    const bucketIdx = new Map(buckets.map((b, i) => [b.date, i]));
    for (const o of validOrders) {
      const key = String(o.created_at).slice(0, 10);
      const i = bucketIdx.get(key);
      if (i !== undefined) {
        buckets[i].revenue += Number(o.total ?? 0);
        buckets[i].orders += 1;
      }
    }

    // Status counts
    const statusCounts: Record<string, number> = {
      pendente: 0,
      pago: 0,
      enviado: 0,
      entregue: 0,
      cancelado: 0,
    };
    for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;

    // Top products by units sold
    const items = (itemsRes.data ?? []) as any[];
    const topMap = new Map<string, { name: string; units: number; revenue: number }>();
    for (const it of items) {
      const key = it.product_name;
      const cur = topMap.get(key) ?? { name: key, units: 0, revenue: 0 };
      cur.units += Number(it.quantity ?? 0);
      cur.revenue += Number(it.quantity ?? 0) * Number(it.price ?? 0);
      topMap.set(key, cur);
    }
    const topProducts = Array.from(topMap.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    const products = (productsRes.data ?? []) as any[];
    const lowStock = products
      .filter((p) => Number(p.stock ?? 0) <= Number(p.low_stock_threshold ?? 5))
      .slice(0, 5);

    return {
      productsCount: productsRes.count ?? products.length,
      ordersCount: orders.length,
      usersCount: (authList.data as any)?.total ?? authList.data.users?.length ?? 0,
      revenue: revenueAll,
      revenueToday,
      revenueWeek,
      revenueMonth,
      recentOrders: orders.slice(0, 5),
      chart: buckets,
      statusCounts,
      topProducts,
      lowStock,
    };
  });
