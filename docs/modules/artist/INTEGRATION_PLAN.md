# Artist Module Integration Plan — AION Flow

**Status:** Phase 0 — Planning only, no code changes
**Date:** 2026-07-08
**Source:** `dionisis-xanthos/` (Reference Project v1)
**Target:** `aion-flow-v2/`

---

## 1. Inventory — What Moves, What Stays

### 1.1 Reusable Components (Move to AION Flow)

| Component | Source (dionisis-xanthos) | Target (aion-flow-v2) | Refactor Needed |
|-----------|--------------------------|----------------------|-----------------|
| Timeline.tsx | `src/components/modules/artist/Timeline.tsx` | `src/modules/artist/components/Timeline.tsx` | Minor — make generic, remove `"use client"` if unnecessary |
| GalleryViewer.tsx | `src/components/modules/gallery/GalleryViewer.tsx` | `src/modules/artist/components/GalleryViewer.tsx` | Minor — accept dynamic DB query |
| GalleryCard.tsx | `src/components/modules/gallery/GalleryCard.tsx` | `src/modules/artist/components/GalleryCard.tsx` | Minor — image_url fallback |
| GalleryGrid.tsx | `src/components/modules/gallery/GalleryGrid.tsx` | `src/modules/artist/components/GalleryGrid.tsx` | Minor — empty state |
| GalleryLightbox.tsx | `src/components/modules/gallery/GalleryLightbox.tsx` | `src/modules/artist/components/GalleryLightbox.tsx` | Minor — aria-labels |
| GalleryFilters.tsx | `src/components/modules/gallery/GalleryFilters.tsx` | `src/modules/artist/components/GalleryFilters.tsx` | None |
| GalleryToolbar.tsx | `src/components/modules/gallery/GalleryToolbar.tsx` | `src/modules/artist/components/GalleryToolbar.tsx` | None |
| ContactForm.tsx | `src/components/modules/contact/ContactForm.tsx` | `src/modules/artist/components/ContactForm.tsx` | Already reusable |

### 1.2 Project-Specific Pages (Need Refactor)

| Page | Source | Issue | Action |
|------|--------|-------|--------|
| Homepage (`page.tsx`) | Full page with Hero, AboutPreview, FilmographyPreview, TelevisionPreview, TheatrePreview, CTA | Tightly coupled to Xanthos content, hardcoded labels | Template with DB-driven sections |
| Filmography page | Grid with film cards | Generic pattern — make configurable | Template |
| Television page | Detail table with expandable rows | Generic pattern — make configurable | Template |
| Theatre page | Card grid | Generic pattern — make configurable | Template |
| About page | Bio + timeline + portrait sidebar | Generic pattern | Template |
| Gallery page | Full gallery + filters | Already reusable | Template |

### 1.3 Database Schema (Tables to Add/Migrate)

| Table | Exists in aion-flow-v2? | Action | Notes |
|-------|------------------------|--------|-------|
| `media_library` | Has `media` table (different schema) | Create new or adapt existing `media` | `media` uses different fields. Recommend: extend `media` with `media_type` column and `featured_media_id` FK pattern |
| `biographies` | No | **Add** | Core artist data |
| `filmography_entries` | No | **Add** | Film roles, credits, metadata |
| `television_entries` | No | **Add** | TV appearances |
| `theatre_entries` | No | **Add** | Theatre performances |
| `career_timelines` | No | **Add** | Career milestones |
| `gallery_items` | No | **Add** | Photo gallery |
| `press_items` | No | **Add** (but low priority) | Press mentions |
| `showreels` | No | **Add** (but low priority) | Video reels |
| `news_articles` | No | **Add** (but low priority) | News |
| `site_settings` | Yes | **Reuse** | Store artist name, tagline, SEO defaults as `category='artist'` |
| `core_entities` | Yes | **Reuse** | Store artist branding, social links |
| `tenant_features` | Yes | **Reuse** | Feature flag: `artist_module` |

### 1.4 Types/Interfaces to Migrate

All interfaces from `dionisis-xanthos/src/lib/types.ts` need to move to `aion-flow-v2/src/types/`:
- `MediaLibraryItem` → map to existing `Media` type or create `ArtistMedia`
- `Biography` → new
- `FilmographyEntry` → new
- `TelevisionEntry` → new
- `TheatreEntry` → new
- `CareerTimeline` → new
- `GalleryItem` → new
- `PressItem` → new (low priority)
- `Showreel` → new (low priority)
- `NewsArticle` → new (low priority)

---

## 2. Target Structure — `src/modules/artist/`

```
src/modules/artist/
├── components/
│   ├── Timeline.tsx
│   ├── GalleryViewer.tsx
│   ├── GalleryCard.tsx
│   ├── GalleryGrid.tsx
│   ├── GalleryLightbox.tsx
│   ├── GalleryFilters.tsx
│   ├── GalleryToolbar.tsx
│   ├── ContactForm.tsx
│   ├── FilmCard.tsx
│   ├── TelevisionTable.tsx
│   ├── TheatreCard.tsx
│   ├── BioPortrait.tsx
│   └── HeroSection.tsx
├── pages/
│   ├── ArtistHomePage.tsx
│   ├── BioPage.tsx
│   ├── FilmographyPage.tsx
│   ├── TelevisionPage.tsx
│   ├── TheatrePage.tsx
│   ├── GalleryPage.tsx
│   └── ContactPage.tsx
├── hooks/
│   ├── useArtistData.ts
│   └── useGalleryLightbox.ts
├── types/
│   └── artist.ts
├── db/
│   ├── queries.ts
│   └── schema.ts
├── media/
│   └── upload-pipeline.mjs
└── docs/
    └── README.md
```

**Design Principle:** Each component should be generic enough to work for any artist type (actor, musician, painter, writer). Artist-specific content comes from DB queries, not hardcoded text.

---

## 3. Database Mapping

### 3.1 Tables Already in AION Flow

| Existing Table | Used For | Artist Module Mapping |
|---------------|----------|----------------------|
| `media` | File metadata | Extend with `media_type` column (`poster`/`portrait`/`gallery`/`document`/`video`/`other`) |
| `site_settings` | Per-tenant key-value config | Artist name, tagline, bio short text, SEO metadata |
| `core_entities` | Structured JSONB data | Artist social links, navigation, branding |
| `tenant_features` | Feature flags | Add `artist_module` flag |
| `services` | Business services | Reuse for "acting services" if needed |
| `blog_posts` | Blog | Keep as-is for news/blog |
| `contact_submissions` | Contact form | Reuse as-is |

### 3.2 Tables to Add (New Migration)

Create these 8 new tables in `supabase/migrations/`:

```sql
-- 01: biographies
CREATE TABLE biographies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  locale TEXT DEFAULT 'el',
  content TEXT,
  short_bio TEXT,
  birth_year TEXT,
  birth_place TEXT,
  pseudonyms TEXT[],
  featured_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  seo_title TEXT, seo_description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_biographies_tenant ON biographies(tenant_id);

-- 02: filmography_entries
CREATE TABLE filmography_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  locale TEXT DEFAULT 'el',
  title TEXT NOT NULL, title_en TEXT,
  year INT, role TEXT, genre TEXT,
  director TEXT, duration TEXT,
  description TEXT,
  featured_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  trailer_url TEXT, imdb_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_filmography_tenant ON filmography_entries(tenant_id);

-- 03: television_entries
CREATE TABLE television_entries ( ...similar... );

-- 04: theatre_entries
CREATE TABLE theatre_entries ( ...similar... );

-- 05: career_timelines
CREATE TABLE career_timelines ( ...similar... );

-- 06: gallery_items
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT, alt_text TEXT,
  category TEXT CHECK (category IN ('film_stills','behind_scenes','portraits','theatre','events','other')),
  photographer TEXT, copyright TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 07: press_items (low priority)
-- 08: showreels (low priority)
-- 09: news_articles (low priority)
```

### 3.3 Extend Existing `media` Table

The existing `media` table in aion-flow-v2:
```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  size INT,
  folder TEXT,
  category TEXT,
  source TEXT,
  tenant_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Minimal migration to support artist media:
```sql
ALTER TABLE media ADD COLUMN IF NOT EXISTS media_type TEXT 
  CHECK (media_type IN ('poster','portrait','gallery','document','video','other'));
ALTER TABLE media ADD COLUMN IF NOT EXISTS alt_text TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS photographer TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS copyright TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
```

---

## 4. CMS Mapping — New Dashboard Panels

### 4.1 Panels to Add

| Panel | Route | Data Source | Purpose |
|-------|-------|-------------|---------|
| **Artist Info** | `/dashboard/artist` | `biographies` + `site_settings` | Bio content, portrait, birth info, pseudonyms |
| **Filmography** | `/dashboard/artist/films` | `filmography_entries` | CRUD for film entries, poster assignment |
| **Television** | `/dashboard/artist/tv` | `television_entries` | CRUD for TV appearances |
| **Theatre** | `/dashboard/artist/theatre` | `theatre_entries` | CRUD for theatre performances |
| **Timeline** | `/dashboard/artist/timeline` | `career_timelines` | Career milestone CRUD |
| **Gallery** | `/dashboard/artist/gallery` | `gallery_items` + `media` | Gallery management (reuse MediaPicker) |
| **Press** | `/dashboard/artist/press` | `press_items` | Press mentions (post-MVP) |
| **Showreels** | `/dashboard/artist/showreels` | `showreels` | Video reel manager (post-MVP) |

### 4.2 Integration Points

- **Media Picker:** Extend the existing `MediaPicker.tsx` to support `media_type` filtering (poster/portrait/gallery)
- **Rich Editor:** Existing `RichEditor.tsx` (TipTap) works for biography content
- **Site Settings:** Artist name/tagline can reuse existing `BrandingPanel.tsx` by adding field mapping
- **Navigation:** Artist-specific nav links can reuse `SiteSettingsPanel.tsx` with `category='navigation'`

---

## 5. Feature Flags

### 5.1 New Flag

```sql
INSERT INTO tenant_features (tenant_id, feature, enabled)
VALUES ($tenant_id, 'artist_module', true);
```

### 5.2 Access Control

In `src/lib/access.ts`, add to `FEATURE_MODULES`:
```typescript
'/dashboard/artist': 'artist_module',
'/dashboard/artist/*': 'artist_module',
```

In `useTenant.ts`, add to default `featureMap`:
```typescript
const defaultFeatureMap = {
  ...existingFeatures,
  artist_module: false, // disabled by default
};
```

### 5.3 Tenant Gating

- **Kolokotronis** (psychologist): `artist_module = false` — no artist UI anywhere
- **Xanthos** (actor): `artist_module = true` — full artist module active
- **New artist tenants**: `artist_module = true` on signup if `industry='artist'`

---

## 6. Migration Safety

### 6.1 No-Break Rules

| Rule | Enforcement |
|------|-------------|
| All existing `media` columns remain unchanged | Migration uses `ADD COLUMN IF NOT EXISTS` |
| Existing CMS panels untouched | New artist panels are independent routes |
| Existing `dataHelpers.ts` unchanged | Artist queries in separate `artist/queries.ts` |
| Existing routes unchanged | Artist pages under new `/dashboard/artist/*` space |
| Existing feature flags unchanged | New `artist_module` flag independent of existing ones |
| Existing landing pages unchanged | Artist public pages will be separate tenant site template |

### 6.2 Safe Integration Strategy

| Step | Files Affected | Risk |
|------|---------------|------|
| 1. New migration (artist tables) | `supabase/migrations/` | Low — only creates new tables |
| 2. Extend `media` table | `supabase/migrations/` | Low — non-destructive ALTER TABLE |
| 3. Add `artist_module` feature flag | `src/lib/access.ts`, `src/lib/useTenant.ts` | Low — default false |
| 4. Create artist types | `src/types/artist.ts` (new) | Zero — no imports yet |
| 5. Create artist DB queries | `src/modules/artist/db/queries.ts` (new) | Zero — no Routes yet |
| 6. Create artist CMS panels | `src/pages/dashboard/artist/*.tsx` (new) | Zero — Routes not registered |
| 7. Register routes in Dashboard | `src/pages/Dashboard.tsx` | Low — new guarded routes |
| 8. Create public artist templates | `src/pages/templates/artist/*.tsx` | Low — new routes under tenant domain |
| 9. Add to AdminSidebar | `src/components/admin/AdminSidebar.tsx` | Low — conditional on feature flag |

---

## 7. Deliverable — `docs/modules/artist/INTEGRATION_PLAN.md`

This file.

---

## 8. Implementation Steps (After Approval)

```
Phase 1: DB + Types (est. 1 day)
├── Create migration: artist tables
├── Extend `media` table
├── Create artist types
└── Run migration on shared Supabase

Phase 2: CMS Panels (est. 2-3 days)
├── Artist Info panel (bio + portrait)
├── Filmography CRUD panel
├── Television CRUD panel
├── Theatre CRUD panel
├── Timeline CRUD panel
├── Gallery management panel
└── Route registration + sidebar items

Phase 3: Public Templates (est. 2-3 days)
├── Artist homepage template
├── Bio page template
├── Filmography page template
├── Television page template
├── Theatre page template
├── Gallery page template
└── Contact page template

Phase 4: Feature Flags + Tenant Gating (est. 0.5 day)
├── Feature flag registration
├── Access control in canAccess()
├── Sidebar visibility gating
└── New tenant signup flag

Phase 5: Media Pipeline (est. 1 day)
├── Extend MediaPicker for media_type
├── Upload pipeline script
└── Metadata editor (alt, caption, copyright)

Phase 6: Documentation (est. 1 day)
├── Update docs/modules/ with artist module
├── Update ARCHITECTURE.md
├── Update DATABASE.md (new tables)
└── Update FEATURES.md

Total: ~8-10 days (first implementation)
```

---

## 9. QA Checklist

- [ ] New DB migration runs without errors on production Supabase
- [ ] All existing CMS panels unaffected
- [ ] Kolokotronis tenant has no artist UI (feature flag = false)
- [ ] Artist tenant sees all 6+ new CMS panels
- [ ] Media picker works with new `media_type` column
- [ ] Gallery lightbox opens/closes/navigates correctly
- [ ] Timeline renders events in correct order
- [ ] Contact form submits to existing `contact_submissions` table
- [ ] Filmography, TV, theatre pages render with proper data
- [ ] Responsive on mobile (320px+) and desktop
- [ ] Build succeeds with zero errors

---

## 10. v2+ Roadmap

| Feature | Priority | Notes |
|---------|----------|-------|
| Awards table + panel | Medium | Festival appearances, nominations |
| Press/News sections | Low | Content from external publications |
| Showreels with video embed | Low | YouTube/Vimeo integration |
| Concert/Tour module (musicians) | Future | Different schema from film/TV/theatre |
| Exhibition module (painters) | Future | Gallery shows, collections |
| Bibliography module (writers) | Future | Books, publications, translations |
| Multi-language artist pages | Future | Locale support in all artist tables |

---

*This plan freezes the dionisis-xanthos project as Reference v1 and provides a safe, modular migration path into the AION Flow platform. No production functionality is affected until Phase 1 approval.*
