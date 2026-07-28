-- 1) Private schema for internal helpers (not exposed via PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated;

-- 2) Move has_role into private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- 3) Recreate every policy that referenced public.has_role using private.has_role
-- user_roles
DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- profiles
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- products
DROP POLICY IF EXISTS "Admins view all products" ON public.products;
DROP POLICY IF EXISTS "Admins insert products" ON public.products;
DROP POLICY IF EXISTS "Admins update products" ON public.products;
DROP POLICY IF EXISTS "Admins delete products" ON public.products;
CREATE POLICY "Admins view all products" ON public.products FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert products" ON public.products FOR INSERT
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- orders
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- order_items
DROP POLICY IF EXISTS "Admins view all items" ON public.order_items;
CREATE POLICY "Admins view all items" ON public.order_items FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- product_variants: drop admin policies + the permissive public read
DROP POLICY IF EXISTS "Admins insert variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins update variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins delete variants" ON public.product_variants;
DROP POLICY IF EXISTS "Anyone views variants" ON public.product_variants;
CREATE POLICY "Admins insert variants" ON public.product_variants FOR INSERT
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update variants" ON public.product_variants FOR UPDATE
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete variants" ON public.product_variants FOR DELETE
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "View variants of active products" ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id AND p.is_active = true
    )
    OR private.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- stock_movements
DROP POLICY IF EXISTS "Admins view stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins insert stock movements" ON public.stock_movements;
CREATE POLICY "Admins view stock movements" ON public.stock_movements FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert stock movements" ON public.stock_movements FOR INSERT
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- order_status_history
DROP POLICY IF EXISTS "Admins view all history" ON public.order_status_history;
DROP POLICY IF EXISTS "Admins insert history" ON public.order_status_history;
CREATE POLICY "Admins view all history" ON public.order_status_history FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert history" ON public.order_status_history FOR INSERT
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- banners
DROP POLICY IF EXISTS "Admins manage banners" ON public.banners;
CREATE POLICY "Admins manage banners" ON public.banners FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- store_settings: drop the permissive public read + admin policy, recreate admin only
DROP POLICY IF EXISTS "Admins manage settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
CREATE POLICY "Admins manage settings" ON public.store_settings FOR ALL
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- activity_logs
DROP POLICY IF EXISTS "Admins read logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins insert logs" ON public.activity_logs;
CREATE POLICY "Admins read logs" ON public.activity_logs FOR SELECT
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert logs" ON public.activity_logs FOR INSERT
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 4) Remove the public.has_role function from the exposed API
-- storage.objects policies also depend on public.has_role; recreate them against private.has_role
DROP POLICY IF EXISTS "Admins upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete product-images" ON storage.objects;
CREATE POLICY "Admins upload product-images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update product-images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete product-images" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);