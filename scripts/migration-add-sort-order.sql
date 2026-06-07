-- Run this in Supabase Dashboard SQL editor
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
UPDATE products SET sort_order = (row_number() OVER (ORDER BY created_at)) * 10;
