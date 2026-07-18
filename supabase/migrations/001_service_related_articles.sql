-- KOL-001: Service-Level Related Articles
-- Adds columns to services table and creates service_related_articles junction table

-- ============================================================
-- PART 1: New columns on services table
-- ============================================================
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS show_related_articles BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS related_articles_mode TEXT NOT NULL DEFAULT 'manual' CHECK (related_articles_mode IN ('manual', 'category', 'latest')),
  ADD COLUMN IF NOT EXISTS related_articles_limit INTEGER NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS related_articles_title TEXT NOT NULL DEFAULT 'Σχετικά άρθρα',
  ADD COLUMN IF NOT EXISTS related_articles_title_en TEXT NOT NULL DEFAULT 'Related Articles';

-- ============================================================
-- PART 2: Junction table service_related_articles
-- ============================================================
CREATE TABLE IF NOT EXISTS service_related_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_service_blog_post UNIQUE (service_id, blog_post_id)
);

CREATE INDEX IF NOT EXISTS idx_service_related_articles_service_id ON service_related_articles(service_id);
CREATE INDEX IF NOT EXISTS idx_service_related_articles_blog_post_id ON service_related_articles(blog_post_id);

-- ============================================================
-- PART 3: Enable RLS
-- ============================================================
ALTER TABLE service_related_articles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert service_related_articles" ON service_related_articles
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can select
CREATE POLICY "Authenticated users can select service_related_articles" ON service_related_articles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update service_related_articles" ON service_related_articles
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete service_related_articles" ON service_related_articles
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Public can view (used by public site)
CREATE POLICY "Public can view service_related_articles" ON service_related_articles
  FOR SELECT
  USING (true);

-- ============================================================
-- PART 4: Trigger to auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_service_related_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_service_related_articles_updated_at ON service_related_articles;
CREATE TRIGGER trigger_service_related_articles_updated_at
  BEFORE UPDATE ON service_related_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_service_related_articles_updated_at();

-- ============================================================
-- PART 5: Rollback
-- ============================================================
-- To rollback:
-- DROP TABLE IF EXISTS service_related_articles CASCADE;
-- ALTER TABLE services
--   DROP COLUMN IF EXISTS show_related_articles,
--   DROP COLUMN IF EXISTS related_articles_mode,
--   DROP COLUMN IF EXISTS related_articles_limit,
--   DROP COLUMN IF EXISTS related_articles_title,
--   DROP COLUMN IF EXISTS related_articles_title_en;
