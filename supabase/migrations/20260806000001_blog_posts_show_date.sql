-- AKR-KOL: Per-article date visibility toggle
-- Default: hidden (false). Client requirement: no dates on articles by default;
-- author can opt-in per article from the CMS editor.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS show_date BOOLEAN NOT NULL DEFAULT false;

-- Rollback:
-- ALTER TABLE public.blog_posts DROP COLUMN IF EXISTS show_date;
