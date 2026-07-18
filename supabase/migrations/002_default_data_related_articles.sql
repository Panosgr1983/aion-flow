-- KOL-001: Default Data Migration — Service-Level Related Articles
-- Enables related articles for Ομάδες and Ομιλίες & Σεμινάρια
-- Maps existing blog posts by category
-- Idempotent: safe to run multiple times

-- ============================================================
-- PART 1: Enable related articles on target services
-- ============================================================
UPDATE services
SET
  show_related_articles = true,
  related_articles_mode = 'manual',
  related_articles_limit = 6,
  related_articles_title = 'Σχετικά άρθρα',
  related_articles_title_en = 'Related Articles'
WHERE slug = 'omades' AND (show_related_articles IS DISTINCT FROM true OR related_articles_mode IS DISTINCT FROM 'manual');

UPDATE services
SET
  show_related_articles = true,
  related_articles_mode = 'manual',
  related_articles_limit = 6,
  related_articles_title = 'Σχετικά άρθρα',
  related_articles_title_en = 'Related Articles'
WHERE slug = 'omilies-seminaria' AND (show_related_articles IS DISTINCT FROM true OR related_articles_mode IS DISTINCT FROM 'manual');

-- ============================================================
-- PART 2: Connect existing published articles
-- ============================================================
-- Ομάδες → category 'ΟΜΑΔΕΣ'
INSERT INTO service_related_articles (service_id, blog_post_id, sort_order)
SELECT
  s.id,
  bp.id,
  ROW_NUMBER() OVER (ORDER BY bp.published_at DESC) - 1 AS sort_order
FROM services s
CROSS JOIN blog_posts bp
WHERE s.slug = 'omades'
  AND bp.category = 'ΟΜΑΔΕΣ'
  AND bp.is_published = true
  AND NOT EXISTS (
    SELECT 1 FROM service_related_articles sra
    WHERE sra.service_id = s.id AND sra.blog_post_id = bp.id
  )
ON CONFLICT (service_id, blog_post_id) DO NOTHING;

-- Ομιλίες & Σεμινάρια → category 'ΟΜΙΛΙΕΣ ΣΕΜΙΝΑΡΙΑ'
INSERT INTO service_related_articles (service_id, blog_post_id, sort_order)
SELECT
  s.id,
  bp.id,
  ROW_NUMBER() OVER (ORDER BY bp.published_at DESC) - 1 AS sort_order
FROM services s
CROSS JOIN blog_posts bp
WHERE s.slug = 'omilies-seminaria'
  AND bp.category = 'ΟΜΙΛΙΕΣ ΣΕΜΙΝΑΡΙΑ'
  AND bp.is_published = true
  AND NOT EXISTS (
    SELECT 1 FROM service_related_articles sra
    WHERE sra.service_id = s.id AND sra.blog_post_id = bp.id
  )
ON CONFLICT (service_id, blog_post_id) DO NOTHING;

-- ============================================================
-- PART 3: Fix — Ομιλίες & Σεμινάρια uses slug 'seminar-omilies' (not 'omilies-seminaria')
-- ============================================================
-- If the previous query didn't match because the slug is 'seminar-omilies',
-- run this instead:
-- UPDATE services SET show_related_articles = true, related_articles_mode = 'manual' WHERE slug = 'seminar-omilies';
-- INSERT INTO service_related_articles (service_id, blog_post_id, sort_order)
-- SELECT s.id, bp.id, ROW_NUMBER() OVER (ORDER BY bp.published_at DESC) - 1
-- FROM services s CROSS JOIN blog_posts bp
-- WHERE s.slug = 'seminar-omilies' AND bp.category = 'ΟΜΙΛΙΕΣ ΣΕΜΙΝΑΡΙΑ' AND bp.is_published = true
-- AND NOT EXISTS (SELECT 1 FROM service_related_articles sra WHERE sra.service_id = s.id AND sra.blog_post_id = bp.id)
-- ON CONFLICT (service_id, blog_post_id) DO NOTHING;

-- ============================================================
-- PART 4: Verify counts
-- ============================================================
-- Run after migration:
-- SELECT s.title, COUNT(sra.id) AS related_articles
-- FROM services s
-- LEFT JOIN service_related_articles sra ON sra.service_id = s.id
-- WHERE s.slug IN ('omades', 'omilies-seminaria')
-- GROUP BY s.id, s.title;

-- ============================================================
-- Rollback
-- ============================================================
-- DELETE FROM service_related_articles
-- WHERE service_id IN (
--   SELECT id FROM services WHERE slug IN ('omades', 'omilies-seminaria')
-- );
-- UPDATE services SET
--   show_related_articles = false,
--   related_articles_mode = 'manual',
--   related_articles_limit = 6,
--   related_articles_title = 'Σχετικά άρθρα',
--   related_articles_title_en = 'Related Articles'
-- WHERE slug IN ('omades', 'omilies-seminaria');
