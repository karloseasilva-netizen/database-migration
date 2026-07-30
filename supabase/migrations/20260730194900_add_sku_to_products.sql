-- Add sku column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
