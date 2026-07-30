-- Add mobile_image_url column to banners table for responsive banners
ALTER TABLE public.banners ADD COLUMN mobile_image_url text;
