# AION CMS — Module Architecture

> Πώς χωρίζεται η πλατφόρμα σε modules.

## Layer 1 — Core

```
aion-flow/
├── src/
│   ├── main.tsx                  Entry point
│   ├── App.tsx                   Root routing
│   ├── supabase/                 Supabase client, helpers
│   ├── lib/                      Shared libraries
│   │   ├── auth.ts               Authentication helpers
│   │   ├── TenantContext.tsx      React context for tenant
│   │   ├── useTenantQuery.ts     RLS-aware query helper
│   │   ├── storage.ts            Raw storage (Level 1)
│   │   ├── media.ts              CMS media (Level 2)
│   │   ├── dataHelpers.ts        DB helpers per entity
│   │   ├── analytics.ts          Telemetry
│   │   └── mockData.ts           Offline/fallback data
│   ├── types/                    TypeScript types
│   ├── components/
│   │   └── shared/               Reusable UI components
│   └── routes/                   Route definitions
```

## Layer 2 — Modules

### 1. Authentication

```
src/
├── components/auth/
│   └── Auth.tsx              Login, register, recovery
├── lib/auth.ts               Supabase Auth integration
├── components/dashboard/
│   ├── Profile.tsx            User profile
│   └── Credentials.tsx        API key / password management
```

**Status:** ✅ Stable  
**Tenant-aware:** ❌ (global auth)  
**Key files:** `Auth.tsx`, `auth.ts`, `Profile.tsx`

---

### 2. Multi-Tenant

```
src/
├── lib/TenantContext.tsx      Tenant ReactContext + cookie
├── lib/useTenantQuery.ts     withTenant() query modifier
├── components/dashboard/
│   ├── TenantOverview.tsx     Tenant switcher / overview
│   └── SuspensionBanner.tsx   Suspended tenant warning
```

**Status:** ✅ Stable  
**Tenant-aware:** ✅ (core concern)  
**Key files:** `TenantContext.tsx`, `useTenantQuery.ts`

---

### 3. CMS — Content

```
src/components/dashboard/
├── SiteSettingsPanel.tsx      Logo, favicon, hero, footer, colors
├── Pages.tsx                  Page hero + content per route
├── BlogPosts.tsx              Blog CRUD + featured images
├── RichEditor.tsx             TipTap inline content editor
├── Products.tsx               Product CRUD + images
├── Services.tsx               Service CRUD + icons
├── Categories.tsx             Category tree
├── AboutPanel.tsx             Bio, certifications, books
├── CoreValues.tsx             Core values CRUD
├── Testimonials.tsx           Testimonials CRUD
├── CtaPanel.tsx               Call-to-action settings
```

**Status:** ✅ Stable  
**Tenant-aware:** ✅  
**Key files:** All editors under `dashboard/`

---

### 4. Media

```
src/
├── lib/storage.ts             Level 1: raw storage operations
├── lib/media.ts               Level 2: uploadCmsAsset, CRUD
├── components/dashboard/
│   ├── MediaLibrary.tsx       Gallery with categories, filters
│   └── MediaPicker.tsx        Inline picker for editors
```

**Status:** 🟡 Beta  
**Tenant-aware:** ✅  
**Key files:** `media.ts`, `MediaLibrary.tsx`, `MediaPicker.tsx`

---

### 5. SEO

```
Built into each editor (Pages, Blog, Products, Services).
├── meta title/description
├── OG image
├── slug
└── is_active toggle
```

**Status:** ✅ Stable (basic) — meta, OG, slug, canonical, `is_active`  
**Planned:** 🔄 v0.3 — SEO Manager (bulk editor, sitemap, schema generator, analytics integration)  
**Tenant-aware:** ✅  
**Key files:** Integrated in each CMS editor

---

### 6. CRM — Leads

```
src/components/dashboard/
├── History.tsx                Lead timeline / history
├── Inbox (split view)         Threaded email inbox
├── Pipeline (Kanban)          5-stage drag & drop
├── Customers.tsx              Customer list
├── Credentials.tsx            Credentials per contact
├── Orders.tsx                 Order management
```

**Status:** ✅ Stable  
**Tenant-aware:** ✅  
**Key files:** `History.tsx`, Pipeline inline, inbox inline

---

### 7. Analytics

```
src/components/dashboard/
├── AnalyticsDashboard.tsx     Usage analytics
├── Analytics.tsx              Detailed analytics
├── DashboardMetrics.tsx       Metrics cards
├── Overview.tsx               Overview dashboard
├── lib/analytics.ts           Telemetry helpers
```

**Status:** ✅ Stable  
**Tenant-aware:** ✅  
**Key files:** `AnalyticsDashboard.tsx`, `analytics.ts`

---

### 8. Operations

```
docs/
├── DEPLOYMENT.md             Vercel + Cloudflare deployment
├── BACKUP.md                 Backup strategy
├── DATABASE.md               Schema reference
├── CODING_STANDARDS.md       Developer conventions
├── CONTRIBUTING.md           Contribution guide
├── DECISIONS.md              Architectural decisions
```

**Status:** ✅ Stable  
**Tenant-aware:** N/A  
**Key files:** Documentation

---

### 9. Commerce

```
src/components/dashboard/
├── Products.tsx               Product CRUD (shared with CMS)
├── Orders.tsx                 Order management
└── Customers.tsx              Customer management
```

**Status:** ✅ Stable (basic)  
**Tenant-aware:** ✅  
**Notes:** Basic commerce. Cart, checkout, payments — future.

---

### 10. Forms (Planned)

- Contact form (edge function exists)
- Booking form
- Newsletter subscription

**Status:** 🔄 Planned  
**Target:** v0.3

---

### 11. Website Builder (Planned)

**Purpose:**  
Generate complete websites based on Blueprint definitions.

**Inputs:**
- Blueprint (page architecture, sections, SEO rules)
- Brand (logo, colors, fonts)
- Services / Products
- Assets (images, icons)

**Outputs:**
- Pages with correct section structure
- SEO metadata (meta, schema, OG, canonical)
- Navigation (header, footer, structure)
- Theme (design tokens, dark/light mode)
- CMS content structure (categories, fields)
- Copywriting (titles, subtitles, CTAs)

**Design principles:**  
The Website Builder consumes a Blueprint definition and produces a fully configured tenant site. It does NOT replace the CMS — it configures it.

This module will be built incrementally across multiple releases (v0.3+).  
For existing blueprints, see [BLUEPRINTS.md](./BLUEPRINTS.md).

**Status:** 🔄 Planned  
**Target:** v0.3+

---

### 12. CRM Pro (Future)

- Email campaigns
- Pipeline automation
- Reporting

**Status:** 🔄 Planned  
**Target:** v0.4

---

### 13. Subscriptions & Billing (Future)

- Subscription management
- Usage-based billing
- Payment gateway (Stripe)

**Status:** 🔄 Planned  
**Target:** v0.5

---

## Module Dependency Graph

```
Authentication
    └── Multi-Tenant
            ├── CMS (all editors)
            ├── Media
            ├── SEO
            ├── CRM
            ├── Analytics
            ├── Commerce
            │       └── Orders
            └── Operations (docs)
```

---

---

### 8. Artist Module (Planned v0.1)

**Purpose:** Digital archive for artists, actors, musicians, writers, and other cultural figures.

**Source reference project:** `dionisis-xanthos/` (Next.js 16, separate Supabase instance)

**Components to migrate:**
```
src/modules/artist/
├── components/
│   ├── Timeline.tsx         Career timeline with icons
│   ├── GalleryViewer.tsx    Gallery orchestrator (filters + grid + lightbox)
│   ├── GalleryCard.tsx      Single image card
│   ├── GalleryGrid.tsx      Responsive image grid
│   ├── GalleryLightbox.tsx  Fullscreen lightbox with keyboard nav
│   ├── GalleryFilters.tsx   Category filter pills
│   ├── GalleryToolbar.tsx   Photo count display
│   ├── ContactForm.tsx      Already generic
│   ├── FilmCard.tsx         Filmography card
│   ├── TelevisionTable.tsx  Expandable TV entries
│   ├── TheatreCard.tsx      Theatre performance card
│   └── BioPortrait.tsx      Bio sidebar with portrait
├── pages/
│   ├── ArtistHomePage.tsx   Template homepage
│   ├── BioPage.tsx          Biography + timeline
│   ├── FilmographyPage.tsx  Film grid + video films
│   ├── TelevisionPage.tsx   TV appearance table
│   ├── TheatrePage.tsx      Theatre card grid
│   ├── GalleryPage.tsx      Full gallery page
│   └── ContactPage.tsx      Contact form page
├── types/
│   └── artist.ts            All 10+ interfaces
└── db/
    ├── queries.ts           Tenant-aware DB queries
    └── schema.ts            Table schemas for reference
```

**New DB tables (8):**
- `biographies` — Bio content, portrait, birth info, pseudonyms
- `filmography_entries` — Film roles, credits, metadata, trailer, IMDb
- `television_entries` — TV appearances, channel, role, descriptions
- `theatre_entries` — Theatre performances, venue, playwright
- `career_timelines` — Career milestones with icons, year, description
- `gallery_items` — Photo gallery linked to `media` table
- `press_items` — Press mentions (post-MVP)
- `showreels` — Video reels (post-MVP)

**Existing tables extended:**
- `media` — Add `media_type` column (poster/portrait/gallery/document/video/other)
- `tenant_features` — Add `artist_module` flag
- `site_settings` — Reuse for artist name, tagline, SEO

**Status:** 🔄 Planned (v0.1)
**Tenant-aware:** ✅ (all queries via existing `withTenant()`)
**Feature flag:** `artist_module` (gated via `canAccess()`)
**Key files:** Pending migration to `src/modules/artist/`

---

### 9. Retreat Module (Planned v0.6)

**Purpose:** Wellness retreats, καταφύγια, φυσιολατρικά καταλύματα.

**Feature flag:** `retreat_module` (default: false)

**Panels:**
- Experiences CRUD — activities/durations/levels
- Workshops CRUD — group sessions
- Events CRUD — bilingual GR/EN
- FAQ CRUD — Q&A management
- Bookings Manager — submission pipeline

**Reuses from Portfolio:**
- GalleryCRUD, MediaPicker, RichEditor, ModuleRegistry

**New tables (5):** experiences, workshops, retreat_events, faq_entries, booking_submissions

**Status:** 🔄 Planned (v0.6)
**Tenant-aware:** ✅ (existing withTenant() pattern)

---

### 10. Locale Module (Planned v0.7)

**Purpose:** Platform-wide multi-language support (GR/EN).

**Feature flag:** `locale_module` (default: false)

**Components to migrate:**
```
src/modules/locale/
├── pages/
│   └── TranslationsEditor.tsx    CMS panel for key-value GR/EN editing
├── types/
│   └── locale.ts                 TranslationKey, LocaleEntry interfaces
└── db/
    └── queries.ts                CRUD for locale_translations
```

**New tables (1):** locale_translations
**Affected tables:** locale column (TEXT DEFAULT 'el') on content tables

**Status:** 🔄 Planned (v0.7)
**Tenant-aware:** ✅ (via tenant_id + feature flag)

---

### Module Dependency Graph (Updated)

```
Authentication
    └── Multi-Tenant
            ├── CMS (all editors)
            ├── Media
            ├── SEO
            ├── CRM
            ├── Analytics
            ├── Commerce
            │       └── Orders
            ├── Operations (docs)
            ├── Portfolio Module (v1.0, frozen)
            │       └── Biography
            │       └── Filmography
            │       └── Television
            │       └── Theatre
            │       └── Timeline
            │       └── Gallery (shared)
            │       └── Press
            │       └── Showreels
            ├── Retreat Module (v0.6, planned)
            │       └── Experiences
            │       └── Workshops
            │       └── Events
            │       └── FAQ
            │       └── Bookings
            │       └── Gallery (reused from Portfolio)
            └── Locale Module (v0.7, planned)
                    └── Translations Editor
```

---

_Τελευταία ενημέρωση: 2026-07-08_
