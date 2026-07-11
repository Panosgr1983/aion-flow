# Locale Module — AION Flow

## Status: Planned (v0.7)

## Vision

Platform-wide multi-language support. Κάθε tenant μπορεί να έχει περιεχόμενο σε μία ή περισσότερες γλώσσες, με δυνατότητα μετάφρασης όλων των πεδίων, χωρίς να επηρεάζονται οι υπάρχοντες tenants.

## Golden Rule

> **Generalize When Proven, Not When Predicted.**
> Το Locale Module ξεκινά ως platform feature γιατί το απαιτεί ήδη το Ktima Kareli (GR/EN). Η γενίκευση σε 3+ γλώσσες θα γίνει όταν υπάρχει πραγματική ανάγκη.

## Feature Flag

| Flag | Default | Description |
|------|---------|-------------|
| `locale_module` | `false` | Ενεργοποιεί multi-language support για τον tenant |

Όταν `locale_module = false`: καμία αλλαγή στην υπάρχουσα εμπειρία. Όλοι οι υπάρχοντες tenants (Kolokotronis, κλπ.) δεν επηρεάζονται.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    LOCALE MODULE                            │
│                                                             │
│  Database Layer:                                            │
│    locale_translations table (key → GR/EN pairs)           │
│    locale column on content tables (el/en)                 │
│                                                             │
│  CMS Layer:                                                 │
│    Translations Editor panel (key-value GR/EN)              │
│    Language toggle in existing CMS panels                   │
│                                                             │
│  Public Site Layer:                                         │
│    Read content filtered by locale                          │
│    Language toggle (persisted in localStorage)              │
│                                                             │
└──────────────────────────────────────────────────────────┘
```

## Database

### locale_translations

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

### Locale Column Convention

Σε κάθε content table που χρειάζεται multi-language:

```sql
ALTER TABLE services ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'el';
-- κ.ο.κ.
```

Η δυνατότητα locale γίνεται **μόνο** για tables που το χρειάζονται, όχι όλα. Η απόφαση παίρνεται όταν ένας tenant με locale_module=true χρησιμοποιεί το συγκεκριμένο content type.

## CMS Panel

### /dashboard/settings/translations

```
Translations Editor
├── Search bar (by key or value)
├── Category filter (hero, nav, footer, sections, ...)
├── List of keys
│   ├── Key: 'hero.title'
│   ├── GR: "Καλώς ήρθατε"
│   └── EN: "Welcome"
│       [Save] per row
└── Import/Export (JSON)
```

### Field Types

| Type | Editor |
|------|--------|
| Short text (title, label) | Single line input |
| Long text (description, paragraph) | Textarea |
| Rich text (body, content) | RichEditor (TipTap) × 2 (GR/EN tabs) |

## Public Site Integration

```typescript
// Reading content:
const { data } = await supabase
  .from('services')
  .select('*')
  .eq('locale', currentLang)  // 'el' or 'en'
  .eq('tenant_id', tenantId);

// Reading translations:
const { data } = await supabase
  .from('locale_translations')
  .select('key, value_el, value_en')
  .eq('tenant_id', tenantId);
```

## Existing Tenants

| Tenant | locale_module | Behavior |
|--------|---------------|----------|
| Kolokotronis | `false` | Όλα τα content tables locale='el'. Κανένα locale UI. |
| Ktima Kareli | `true` | Translations editor enabled. Public site reads locale. |
| Future tenant | `true` | Same as Ktima Kareli. |

## Migration Path for Existing Content

```
Υπάρχον content (locale='el', καμία αλλαγή)
  ↓
Tenant ενεργοποιεί locale_module
  ↓
Translations editor εμφανίζεται στο CMS
  ↓
Client μεταφράζει keys (ή εισάγει από translations.ts)
  ↓
Public site διαβάζει locale=currentLang
```

## Non-Goals (v0.7)

- Δεν γίνεται μετάφραση του CMS UI (μόνο content)
- Δεν γίνεται auto-translation (machine translation API)
- Δεν γίνεται real-time collaboration σε μεταφράσεις
- Δεν υποστηρίζονται 3+ γλώσσες (μόνο GR/EN)

## Future (v2.0)

- 3+ γλώσσες (π.χ. GR/EN/FR/DE)
- Machine translation suggestions
- Translation memory
- Locale-specific SEO (hreflang tags, canonical per locale)
