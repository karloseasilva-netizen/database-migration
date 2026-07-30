import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export const uploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("FormData required");
    const file = data.get("file");
    const folder = String(data.get("folder") ?? "misc");
    if (!(file instanceof File)) throw new Error("Arquivo ausente");
    if (file.size > MAX_BYTES) throw new Error("Arquivo maior que 5MB");
    if (!ALLOWED.includes(file.type))
      throw new Error("Formato inválido (use JPG, PNG, WEBP, GIF ou AVIF)");
    if (!/^[a-z0-9-]+$/.test(folder)) throw new Error("Pasta inválida");
    return { file, folder };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Forbidden");

    const ext = (data.file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `${data.folder}/${crypto.randomUUID()}.${ext}`;
    const buf = new Uint8Array(await data.file.arrayBuffer());
    const { error } = await supabaseAdmin.storage.from(BUCKET).upload(key, buf, {
      contentType: data.file.type,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    return { url: `/api/public/img/${key}`, path: key };
  });
