
-- =====================================================================
-- ROLES
-- =====================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- PROFILES admin policy
-- =====================================================================
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- PRODUCTS
-- =====================================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  old_price NUMERIC(10,2),
  discount INTEGER,
  tag TEXT,
  image_url TEXT NOT NULL DEFAULT '',
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  category_slug TEXT NOT NULL,
  sub TEXT NOT NULL DEFAULT '',
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5,
  reviews INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins view all products" ON public.products
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete products" ON public.products
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- ORDERS
-- =====================================================================
CREATE TYPE public.order_status AS ENUM ('pendente', 'pago', 'enviado', 'entregue', 'cancelado');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT,
  status public.order_status NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );

CREATE POLICY "Users create items for own orders" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );

CREATE POLICY "Admins view all items" ON public.order_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- SEED PRODUCTS
-- =====================================================================
INSERT INTO public.products (slug, name, description, price, old_price, discount, tag, image_url, category_slug, sub, colors, sizes, stock, rating, reviews) VALUES
('conjunto-renda-delicada','Conjunto Renda Delicada','Conjunto sutiã e calcinha em renda floral delicada, com detalhes bordados e forro em algodão.',129.9,NULL,NULL,'TOP','/src/assets/p1.jpg','lingeries-conjuntos','Rendados','["Rosé","Nude","Preto"]','["P","M","G","GG"]',12,4.8,124),
('conjunto-push-up-classic','Conjunto Push Up Classic','Sustentação push up com bojo removível e tecido macio para o uso diário.',139.9,NULL,NULL,'NOVO','/src/assets/p2.jpg','lingeries-conjuntos','Básicos','["Blush","Branco"]','["36","38","40","42","44"]',20,4.6,88),
('body-renda-seducao','Body Renda Sedução','Body em renda transparente com alças ajustáveis e abertura íntima.',159.9,NULL,NULL,'TOP','/src/assets/p3.jpg','lingeries-conjuntos','Rendados','["Rosé","Preto"]','["P","M","G"]',7,4.9,56),
('short-doll-cetim-rose','Short Doll Cetim Rosé','Short doll em cetim leve com fita acetinada, ideal para dormir com estilo.',109.9,NULL,NULL,'NOVO','/src/assets/p4.jpg','pijamas','Baby Dolls','["Rosé","Marfim"]','["P","M","G","GG"]',15,4.7,45),
('sutia-sem-bojo-renda','Sutiã Sem Bojo Renda','Sutiã sem bojo e sem aro, com renda maleável e conforto absoluto.',99.9,NULL,NULL,NULL,'/src/assets/p5.jpg','sutia','Rendados','["Nude","Preto","Rosé"]','["P","M","G"]',33,4.5,210),
('calcinha-fio-delicado','Calcinha Fio Delicado','Calcinha fio em renda com laterais finas e caimento perfeito.',49.9,NULL,NULL,'TOP','/src/assets/p1.jpg','calcinhas','Fio','["Rosé","Preto","Branco"]','["P","M","G"]',60,4.4,320),
('camisola-cetim-blush','Camisola Cetim Blush','Camisola longa em cetim com decote em renda e alças finas.',179.9,NULL,NULL,'NOVO','/src/assets/p4.jpg','pijamas','Camisolas','["Blush","Champanhe"]','["P","M","G","GG"]',10,4.9,72),
('conjunto-renda-blush','Conjunto Renda Blush','Conjunto em renda blush, versão com desconto especial.',89.9,149.9,40,NULL,'/src/assets/p1.jpg','lingeries-conjuntos','Rendados','["Blush"]','["P","M","G"]',8,4.6,41),
('camisola-cetim-rose','Camisola Cetim Rosé','Camisola em cetim rosé com renda no busto.',119.9,189.9,37,NULL,'/src/assets/p2.jpg','pijamas','Camisolas','["Rosé"]','["P","M","G"]',5,4.7,60),
('body-renda-encanto','Body Renda Encanto','Body encantador em renda com transparências elegantes.',109.9,179.9,39,NULL,'/src/assets/p3.jpg','lingeries-conjuntos','Rendados','["Rosé","Preto"]','["P","M","G"]',6,4.8,30),
('pijama-cetim-delicado','Pijama Cetim Delicado','Pijama clássico em cetim, calça e blusa manga longa.',79.9,129.9,38,NULL,'/src/assets/p4.jpg','pijamas','Pijamas Clássicos','["Rosé","Marfim"]','["P","M","G","GG"]',9,4.5,22),
('sutia-renda-suave','Sutiã Renda Suave','Sutiã confortável em renda suave, com aro discreto.',69.9,109.9,36,NULL,'/src/assets/p5.jpg','sutia','Rendados','["Nude","Rosé"]','["P","M","G"]',14,4.6,18),
('calcinha-sem-costura-nude','Calcinha Sem Costura Nude','Calcinha invisível sem costura, ideal para peças justas.',39.9,NULL,NULL,NULL,'/src/assets/p3.jpg','calcinhas','Sem Costura','["Nude","Preto","Branco"]','["P","M","G","GG"]',80,4.7,140),
('calcinha-tanga-basica','Calcinha Tanga Básica','Tanga básica em algodão macio, kit com 3 cores.',34.9,NULL,NULL,NULL,'/src/assets/p1.jpg','calcinhas','Tanga','["Rosé","Branco","Preto"]','["P","M","G"]',100,4.3,95),
('sutia-top-fitness','Sutiã Top Conforto','Top de sustentação leve, ideal para o dia a dia.',74.9,NULL,NULL,NULL,'/src/assets/p5.jpg','sutia','Top','["Rosé","Preto"]','["P","M","G"]',40,4.4,66),
('sutia-tomara-que-caia','Sutiã Tomara que Caia','Sutiã sem alças com silicone antiderrapante.',89.9,NULL,NULL,NULL,'/src/assets/p2.jpg','sutia','Tomara que Caia','["Nude","Preto"]','["P","M","G"]',22,4.5,40),
('robe-cetim-blush','Robe Cetim Blush','Robe em cetim com cinto, toque sedoso.',199.9,NULL,NULL,NULL,'/src/assets/p4.jpg','pijamas','Robes','["Blush","Marfim"]','["P/M","G/GG"]',8,4.9,25),
('conjunto-plus-renda','Conjunto Plus Renda','Conjunto plus em renda com modelagem confortável.',159.9,NULL,NULL,'NOVO','/src/assets/p1.jpg','plus-size','Sutiãs','["Rosé","Preto"]','["46","48","50","52"]',12,4.7,34),
('calcinha-plus-alta','Calcinha Plus Cintura Alta','Calcinha plus cintura alta, modela a silhueta.',59.9,NULL,NULL,NULL,'/src/assets/p3.jpg','plus-size','Calcinhas','["Nude","Preto"]','["46","48","50","52"]',30,4.6,51),
('sutia-amamentacao','Sutiã de Amamentação','Sutiã com abertura frontal, algodão hipoalergênico.',89.9,NULL,NULL,NULL,'/src/assets/p5.jpg','gestante','Sutiã Amamentação','["Nude","Branco"]','["P","M","G","GG"]',25,4.8,78),
('camisola-gestante','Camisola Gestante','Camisola com abertura para amamentação.',129.9,NULL,NULL,NULL,'/src/assets/p4.jpg','gestante','Camisola','["Rosé","Branco"]','["P","M","G","GG"]',14,4.7,32),
('cinta-gestante','Cinta de Gestante','Cinta de sustentação para gestantes, alívio lombar.',149.9,NULL,NULL,NULL,'/src/assets/p2.jpg','gestante','Cinta','["Nude"]','["P","M","G","GG"]',18,4.5,45);
