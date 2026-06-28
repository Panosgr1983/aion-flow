/*
  # AION v0.2 — Site Images Storage Bucket

  1. Δημιουργία bucket `site-images` (αν δεν υπάρχει ήδη)
  2. RLS policies για storage.objects
*/

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  false,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS POLICIES
-- ============================================================
CREATE POLICY "Authenticated users can upload site images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view site images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-images');

CREATE POLICY "Owners can update site images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'site-images' AND auth.uid() = owner);

CREATE POLICY "Owners can delete site images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND auth.uid() = owner);
