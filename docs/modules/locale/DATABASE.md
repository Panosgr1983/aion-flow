# Locale Module — Database

## locale_translations

```sql
CREATE TABLE locale_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,               -- 'hero.title', 'welcome.heading'
  value_el TEXT NOT NULL,           -- Greek
  value_en TEXT,                    -- English
  category TEXT,                    -- 'hero', 'nav', 'footer', 'sections'
  description TEXT,                 -- Context hint for translators
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);
CREATE INDEX idx_locale_translations_tenant ON locale_translations(tenant_id);
CREATE INDEX idx_locale_translations_category ON locale_translations(category);
```

## Locale Column Convention

Σε content tables που χρειάζονται multi-language:

```sql
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE retreat_events ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE faq_entries ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE services ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
```

Η προσθήκη locale column γίνεται **μόνο** για tables που χρησιμοποιούνται από locale-enabled tenant.
