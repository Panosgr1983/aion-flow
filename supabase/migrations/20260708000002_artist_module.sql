-- Artist Module v0.1 — Additive migration
-- Creates artist-specific tables and extends media table
-- No destructive changes to existing schema

-- 1. Extend media table for artist media types
ALTER TABLE media ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('poster','portrait','gallery','document','video','other'));
ALTER TABLE media ADD COLUMN IF NOT EXISTS photographer TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS copyright TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS source_url TEXT;

-- 2. Artist tables
CREATE TABLE IF NOT EXISTS biographies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  content TEXT,
  short_bio TEXT,
  birth_year TEXT,
  birth_place TEXT,
  pseudonyms TEXT[],
  featured_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_biographies_tenant ON biographies(tenant_id);

CREATE TABLE IF NOT EXISTS filmography_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  year INT,
  role TEXT,
  genre TEXT,
  director TEXT,
  duration TEXT,
  description TEXT,
  featured_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  trailer_url TEXT,
  imdb_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_filmography_tenant ON filmography_entries(tenant_id);

CREATE TABLE IF NOT EXISTS television_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  year INT,
  channel TEXT,
  role TEXT,
  episode_title TEXT,
  description TEXT,
  featured_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_television_tenant ON television_entries(tenant_id);

CREATE TABLE IF NOT EXISTS theatre_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  year INT,
  venue TEXT,
  playwright TEXT,
  role TEXT,
  notes TEXT,
  featured_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_theatre_tenant ON theatre_entries(tenant_id);

CREATE TABLE IF NOT EXISTS career_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  year INT,
  month INT,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  category TEXT DEFAULT 'other',
  icon TEXT,
  media_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timelines_tenant ON career_timelines(tenant_id);

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  category TEXT CHECK (category IN ('film_stills','behind_scenes','portraits','theatre','events','other')),
  photographer TEXT,
  copyright TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_tenant ON gallery_items(tenant_id);

CREATE TABLE IF NOT EXISTS press_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  publication TEXT,
  date DATE,
  url TEXT,
  excerpt TEXT,
  featured_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_press_tenant ON press_items(tenant_id);

CREATE TABLE IF NOT EXISTS showreels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  platform TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_showreels_tenant ON showreels(tenant_id);

-- 3. RLS Policies (read-only for public, full for tenant)
ALTER TABLE biographies ENABLE ROW LEVEL SECURITY;
ALTER TABLE filmography_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE television_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE theatre_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE showreels ENABLE ROW LEVEL SECURITY;

-- Tenant admins can CRUD their own data
CREATE POLICY "artist_tenant_access" ON biographies
  USING (tenant_id = current_tenant_id() OR is_super_admin());
CREATE POLICY "artist_tenant_access" ON filmography_entries
  USING (tenant_id = current_tenant_id() OR is_super_admin());
CREATE POLICY "artist_tenant_access" ON television_entries
  USING (tenant_id = current_tenant_id() OR is_super_admin());
CREATE POLICY "artist_tenant_access" ON theatre_entries
  USING (tenant_id = current_tenant_id() OR is_super_admin());
CREATE POLICY "artist_tenant_access" ON career_timelines
  USING (tenant_id = current_tenant_id() OR is_super_admin());
CREATE POLICY "artist_tenant_access" ON gallery_items
  USING (tenant_id = current_tenant_id() OR is_super_admin());
CREATE POLICY "artist_tenant_access" ON press_items
  USING (tenant_id = current_tenant_id() OR is_super_admin());
CREATE POLICY "artist_tenant_access" ON showreels
  USING (tenant_id = current_tenant_id() OR is_super_admin());

-- Public read for published content
CREATE POLICY "artist_public_read" ON biographies
  FOR SELECT USING (status = 'published');
CREATE POLICY "artist_public_read" ON filmography_entries
  FOR SELECT USING (status = 'published');
CREATE POLICY "artist_public_read" ON television_entries
  FOR SELECT USING (status = 'published');
CREATE POLICY "artist_public_read" ON theatre_entries
  FOR SELECT USING (status = 'published');
CREATE POLICY "artist_public_read" ON career_timelines
  FOR SELECT USING (status = 'published');
CREATE POLICY "artist_public_read" ON gallery_items
  FOR SELECT USING (status = 'published');
CREATE POLICY "artist_public_read" ON press_items
  FOR SELECT USING (status = 'published');
CREATE POLICY "artist_public_read" ON showreels
  FOR SELECT USING (true);
