import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(context: { userId: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
  return supabaseAdmin;
}

async function logAction(
  admin: any,
  userId: string,
  userEmail: string | null,
  action: string,
  entity?: string,
  entityId?: string,
  meta?: any,
) {
  try {
    await admin.from("activity_logs").insert({
      user_id: userId,
      user_email: userEmail,
      action,
      entity: entity ?? null,
      entity_id: entityId ?? null,
      meta: meta ?? null,
    });
  } catch {}
}

// ================= REPORTS =================
export const reportSales = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ days: z.number().int().min(1).max(365).default(30) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const since = new Date(Date.now() - data.days * 86400_000).toISOString();
    const { data: orders } = await admin
      .from("orders")
      .select("id, total, status, created_at, customer_name")
      .gte("created_at", since)
      .order("created_at", { ascending: false });
    const rows = (orders ?? []) as any[];
    const valid = rows.filter((o) => o.status !== "cancelado");
    const total = valid.reduce((s, o) => s + Number(o.total || 0), 0);
    const avg = valid.length ? total / valid.length : 0;
    const buckets: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = data.days - 1; i >= 0; i--) {
      const key = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
      buckets[key] = { date: key, revenue: 0, orders: 0 };
    }
    for (const o of valid) {
      const k = String(o.created_at).slice(0, 10);
      if (buckets[k]) {
        buckets[k].revenue += Number(o.total || 0);
        buckets[k].orders += 1;
      }
    }
    return {
      total,
      count: valid.length,
      avg,
      cancelled: rows.length - valid.length,
      series: Object.values(buckets),
      orders: rows.slice(0, 50),
    };
  });

export const reportTopProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const { data: items } = await admin
      .from("order_items")
      .select("product_name, quantity, price");
    const map = new Map<string, { name: string; units: number; revenue: number }>();
    for (const it of (items ?? []) as any[]) {
      const cur = map.get(it.product_name) ?? { name: it.product_name, units: 0, revenue: 0 };
      cur.units += Number(it.quantity || 0);
      cur.revenue += Number(it.quantity || 0) * Number(it.price || 0);
      map.set(it.product_name, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.units - a.units);
  });

export const reportCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const [{ data: orders }, authList] = await Promise.all([
      admin.from("orders").select("user_id, total, status, created_at, customer_name, customer_email"),
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ]);
    const byUser = new Map<string, { name: string; email: string; count: number; spent: number; last: string | null }>();
    for (const o of (orders ?? []) as any[]) {
      const key = o.user_id || o.customer_email || "anon";
      const cur = byUser.get(key) ?? {
        name: o.customer_name || "—",
        email: o.customer_email || "",
        count: 0,
        spent: 0,
        last: null,
      };
      cur.count += 1;
      if (o.status !== "cancelado") cur.spent += Number(o.total || 0);
      if (!cur.last || o.created_at > cur.last) cur.last = o.created_at;
      byUser.set(key, cur);
    }
    const totalUsers = (authList.data as any)?.total ?? authList.data.users?.length ?? 0;
    const list = Array.from(byUser.values()).sort((a, b) => b.spent - a.spent);
    const revenue = list.reduce((s, x) => s + x.spent, 0);
    return {
      totalUsers,
      buyers: list.length,
      revenue,
      avgLtv: list.length ? revenue / list.length : 0,
      list,
    };
  });

export const exportOrdersCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const { data } = await admin
      .from("orders")
      .select("id, created_at, status, customer_name, customer_email, total")
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as any[];
    const header = "id,data,status,cliente,email,total\n";
    const body = rows
      .map((o) =>
        [
          o.id,
          o.created_at,
          o.status,
          `"${(o.customer_name ?? "").replace(/"/g, '""')}"`,
          o.customer_email ?? "",
          Number(o.total || 0).toFixed(2),
        ].join(","),
      )
      .join("\n");
    return { csv: header + body, count: rows.length };
  });

// ================= BANNERS =================
const bannerInput = z.object({
  title: z.string().max(200).nullable().optional(),
  image_url: z.string().min(1).max(1000),
  link_url: z.string().max(1000).nullable().optional(),
  position: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const listBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const { data } = await admin.from("banners").select("*").order("position");
    return data ?? [];
  });

export const upsertBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid().optional(), values: bannerInput }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    if (data.id) {
      const { data: row, error } = await admin
        .from("banners")
        .update(data.values as any)
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await admin
      .from("banners")
      .insert(data.values as any)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const { error } = await admin.from("banners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= FEATURED =================
export const listProductsForFeature = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const { data } = await admin
      .from("products")
      .select("id, name, slug, image_url, price, is_featured, is_active, category_slug")
      .order("name");
    return data ?? [];
  });

export const toggleFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), is_featured: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const { error } = await admin
      .from("products")
      .update({ is_featured: data.is_featured } as any)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ================= STORE SETTINGS =================
export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const { data } = await admin.from("store_settings").select("*");
    const map: Record<string, any> = {};
    for (const r of (data ?? []) as any[]) map[r.key] = r.value;
    return map;
  });

export const updateSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ key: z.string().min(1).max(80), value: z.any() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const { error } = await admin
      .from("store_settings")
      .upsert({ key: data.key, value: data.value } as any, { onConflict: "key" });
    if (error) throw new Error(error.message);
    await logAction(admin, context.userId, null, "update_setting", "store_settings", data.key);
    return { ok: true };
  });

// ================= USERS / ROLES =================
export const listUsersByRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ role: z.enum(["admin", "funcionario", "customer"]) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const [{ data: roles }, authList] = await Promise.all([
      admin.from("user_roles").select("user_id, role, created_at").eq("role", data.role),
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ]);
    const users = new Map((authList.data.users ?? []).map((u) => [u.id, u]));
    return (roles ?? []).map((r: any) => {
      const u = users.get(r.user_id) as any;
      return {
        user_id: r.user_id,
        role: r.role,
        created_at: r.created_at,
        email: u?.email ?? null,
        full_name: u?.user_metadata?.full_name ?? null,
      };
    });
  });

export const listAllRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const [{ data: roles }, authList] = await Promise.all([
      admin.from("user_roles").select("user_id, role, created_at"),
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    ]);
    const users = new Map((authList.data.users ?? []).map((u) => [u.id, u]));
    return (roles ?? []).map((r: any) => {
      const u = users.get(r.user_id) as any;
      return {
        user_id: r.user_id,
        role: r.role,
        created_at: r.created_at,
        email: u?.email ?? null,
      };
    });
  });

export const grantRoleByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().email(),
        role: z.enum(["admin", "funcionario", "customer"]),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const user = list.data.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!user) throw new Error("Usuário não encontrado. Peça para se cadastrar primeiro.");
    const { error } = await admin
      .from("user_roles")
      .upsert({ user_id: user.id, role: data.role } as any, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    await logAction(admin, context.userId, null, "grant_role", "user_roles", user.id, { role: data.role });
    return { ok: true };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        user_id: z.string().uuid(),
        role: z.enum(["admin", "funcionario", "customer"]),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const admin = await assertAdmin(context);
    const { error } = await admin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    await logAction(admin, context.userId, null, "revoke_role", "user_roles", data.user_id, { role: data.role });
    return { ok: true };
  });

// ================= LOGS / BACKUP =================
export const listActivityLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const { data } = await admin
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

export const backupSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertAdmin(context);
    const tables = [
      "products",
      "product_variants",
      "orders",
      "order_items",
      "banners",
      "store_settings",
      "user_roles",
    ] as const;
    const out: Record<string, any[]> = {};
    for (const t of tables) {
      const { data } = await admin.from(t).select("*");
      out[t] = data ?? [];
    }
    await logAction(admin, context.userId, null, "backup_download", "system");
    return { generated_at: new Date().toISOString(), data: out };
  });