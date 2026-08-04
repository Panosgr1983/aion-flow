# AION CMS — Changelog

## 2026-07-29d — Rich Content Engine Expansion + Incident Closure

**Commits:** `203c2f0` → `d193b82` (aion-flow-v2), `a763384` → `f657161` (kolokotronis)

**New:**
- TipTap RichEditor for biography (AboutPanel) + service short/long descriptions
- `renderTipContent()` extracted to shared `content-hooks.ts`
- Blog hero eyebrow → `blog_hero_eyebrow` setting
- Category normalization: `ΟΜΙΛΙΕΣ & ΣΕΜΙΝΑΡΙΑ` ampersand variant
- `extractPlainText()` utility for cards/previews
- `service_faq_visible` toggle
- Engineering Principles (5 foundations)
- ADR-016: Rich Content Pipeline
- Content Engine vision document
- Incident record framework

**Fixed:**
- Homepage TipTap JSON leakage (production regression, no data loss)
- TipTap editor CSS (paragraph spacing, list markers)
- `handleSave` in AboutPanel now creates new settings keys
- `openEdit` scope bug in Services
- 3 bad slugs cleaned (`365----`, `-------------`, `--`)
- Title width constraint removed
- Pre-deploy smoke checklist added

**Tests: 24/24 passed (8 FAQ + 12 manual QA + 3 content pipeline + 1 homepage regression)**

## v0.3.3 (2026-07-08)

### Added
- **Seminar Section (Homepage)**: Νέο ανεξάρτητο section "Ομιλίες & Σεμινάρια" στο homepage του Kolokotronis. 7 editable πεδία στο Site Settings → "Ομιλίες & Σεμινάρια Section" tab:
  - **visible** (toggle): εμφάνιση/απόκρυψη
  - **title** (text): επικεφαλίδα
  - **subtitle** (textarea): υπότιτλος
  - **cta_text** (text): κείμενο CTA
  - **cta_link** (text): σύνδεσμος CTA
  - **count** (number, min=1 max=10): πόσες κάρτες να εμφανίζονται
  - **category** (select, auto-populated): ποια κατηγορία blog να φιλτράρεται
- **blog_section_title**: Ανεξάρτητη ρύθμιση τίτλου blog page (reset σε "Πρόσφατα Άρθρα")
- **Seminar section DB defaults**: 7 νέες `site_settings` keys (`seminar_section_*`) με default values πλήρως λειτουργικά
- **Blog Home Section (Homepage)**: Νέο ανεξάρτητο section "Πρόσφατα Άρθρα" στο homepage, ακολουθώντας ακριβώς το ίδιο pattern με το Seminar Section. 7 editable πεδία στο Site Settings → "Πρόσφατα Άρθρα Section (Homepage)" tab:
  - **visible** (toggle, default `false`): ενότητα κρυμμένη μέχρι ενεργοποίησης από CMS
  - **title** (text): επικεφαλίδα
  - **subtitle** (textarea): υπότιτλος
  - **cta_text** (text): κείμενο CTA
  - **cta_link** (text): σύνδεσμος CTA
  - **count** (number, min=1 max=10): πόσες κάρτες
  - **category** (select, auto-populated με "— Όλες οι κατηγορίες —"): φίλτρο κατηγορίας
- **Blog Home DB defaults**: 7 νέες `site_settings` keys (`blog_home_section_*`) με `visible=false`
- **All categories option**: Τόσο seminar όσο και blog home category dropdown έχουν επιλογή "— Όλες οι κατηγορίες —" που εμφανίζει posts από όλες τις κατηγορίες

### Changed
- **Blog CMS labels**: "Blog Section" tab → "Blog Settings"
- **Homepage independence**: Το homepage seminar section είναι πλήρως ανεξάρτητο από το blog page — αλλαγές στο seminar section ΔΕΝ επηρεάζουν το blog
- **Old blog section removed from homepage**: Η παλιά hardcoded ενότητα "Πρόσφατα Άρθρα" (με `blogPosts.slice(0, 3)`) αντικαταστάθηκε από το νέο `blog_home_section_*` σύστημα. `useBlogPosts()` αφαιρέθηκε από το homepage.

### Fixed
- **blog_section_title isolation**: Δεν χρησιμοποιείται πλέον για το homepage seminar section — έχει δικό του ξεχωριστό title field

## v0.3.2 (2026-07-06)

### Added
- **`effectiveTenantId`**: Νέο πεδίο στο `TenantState` που επιστρέφει
  `selectedTenantId` για SA και `tenant_id` για μη-SA. Όλα τα components
  χρησιμοποιούν `tenant.effectiveTenantId` αντί για απευθείας
  `selectedTenantId` από TenantContext.
- **Super Admin auto-assign**: Τα emails `info@aionweb.gr` και
  `choliasmenos.panos@gmail.com` αναγνωρίζονται αυτόματα ως super admin
  στο `useTenant()` hook — χωρίς JWT claims ή DB lookup.
- **Πλήρης λίστα user permissions** στο `docs/PERMISSIONS.md` με
  πίνακα δικαιωμάτων ανά ρόλο και περιγραφή του three-tier tenant ID
  συστήματος.

### Changed
- **AuthContext**: Στο `SIGNED_IN` event, καθαρίζεται
  `localStorage.aion_selected_tenant` ώστε κάθε νέο login να ξεκινά χωρίς
  προεπιλεγμένο tenant.
- **useTenant**: Προστέθηκε localStorage sync για διόρθωση stale state
  στο `TenantContext` μετά από νέο login.
- **6 components** (Services, BlogPosts, Products, SiteSettingsPanel,
  Pages, AboutPanel): Αλλαγή από `useTenantContext().selectedTenantId`
  σε `useTenant().effectiveTenantId` για tenant-aware uploads/queries.

### Fixed
- **Login loop**: Αφαιρέθηκε `supabase.auth.refreshSession()` από το
  auto-assign profile update — προκαλούσε `SIGNED_OUT` και redirect
  πίσω στη login σελίδα.
- **Stale TenantContext state**: Μετά από SIGNED_IN, το TenantContext
  κρατούσε παλιά τιμή από localStorage — το useTenant τώρα συγχρονίζει
  με live localStorage τιμή.
- **Non-super-admin uploads**: Τα components χρησιμοποιούν πλέον
  `effectiveTenantId` (το tenant_id του χρήστη) αντί για `selectedTenantId`
  (που ήταν null για μη-SA).

## v0.3.1 (2026-06-29)

### Added
- **site_logo_footer**: Ξεχωριστό πεδίο για το logo του footer (ανεξάρτητο από header)
- **site_favicon**: Νέο πεδίο για favicon, με `keepFormat: true` (PNG χωρίς compression)
- **site-images bucket migration**: Δημιουργία bucket + RLS policies για storage.objects
- **Media table columns**: Προστέθηκαν `category`, `source`, `metadata`, `path`, `storage_bucket` στην production (έλειπαν από προηγούμενο migration)
- **beforeLoad prefetch**: Site_settings φορτώνονται στο SSR μέσω `queryClient.prefetchQuery` — όλα τα settings (όνομα, λογότυπο, hero κλπ) διαθέσιμα από τον server

### Changed
- **Upload system**: Αφαιρέθηκε το auto PNG→JPEG conversion για logos (site_logo, site_logo_footer, site_favicon). Οι υπόλοιπες εικόνες συνεχίζουν κανονικά.
- **Auto-save μετά από image upload**: Το logo αποθηκεύεται αμέσως μετά το upload — δε χρειάζεται ξεχωριστό Save
- **dirtyKeys tracking**: Το Save αποθηκεύει ΜΟΝΟ τις ρυθμίσεις που άλλαξαν (όχι και τα 40+ settings)
- **Parallel save**: `Promise.all` αντί για sequential loop στο handleSave

### Fixed
- **site_settings category column**: Έλειπε από production DB — το uploadCmsAsset αποτύγχανε με "Could not find the 'category' column of 'media'"
- **New settings (site_logo_footer, site_favicon)**: Δημιουργούνται INSERT αντί για UPDATE όταν δεν υπάρχουν ακόμα στη DB
- **setValue για νέα keys**: Προσθέτει entry στο local settings array ακόμα κι αν δεν υπάρχει στη DB

## v0.3.0 (2026-06-28)

### Added
- **System Health Cockpit**: `/dashboard/settings/system` — debug dashboard with Supabase, JWT, RLS, telemetry status, event count, live analytics source, one-click `trackEvent()` test
- **Platform Overview**: `/dashboard/platform` — mission control for super admin: active tenants, events today, leads, health, system status
- **Platform Events**: 6 new event types — `tenant_created`, `tenant_archived`, `tenant_upgraded`, `backup_restored`, `module_installed`, `role_changed`
- **Capability Guard**: `can()` permission layer above roles — `platform.*` capabilities blocked for non-super-admins
- **PlatformGuard**: route-level protection for all platform pages (Observability, Usage, System)
- **Platform → Workspace separation**: sidebar divided into Platform (super admin), Επιχείρηση (tenant workspace), Λογαριασμός (account settings)
- **Version bump**: 0.0.0 → 0.3.0

### Fixed
- **TrackEvent tenant_id**: auto-detected from JWT session when not explicitly provided — all CMS/CRM events now store correct tenant_id
- **AnalyticsDashboard**: hardcoded `TENANT_ID` replaced with `selectedTenantId` from tenant context
- **UsageDashboard**: now tenant-aware — filters churn risk, activity, top events by selected tenant
- **analyticsHelper.getDashboardData()**: queries real `orders`, `customers`, `order_items`, `products`, `categories`, `pageviews` instead of `mockAnalytics`
- **Sidebar**: Usage and System pages now gated to super-admin only (were accessible to any user with `users.manage`)

### Changed
- **Data Principle #1**: No production dashboard reads mock data. Mock data allowed only for demo mode, local dev, empty state placeholders, and tests.
- **Permission model**: New `can(permission, role, isSuperAdmin)` function — platform capabilities (`platform.*`) are super-admin-only; business permissions checked by role matrix

## v0.1.0 (2026-06-27)

### Added
- **Authentication**: Supabase Auth + Custom JWT Hook
- **Multi-Tenant**: JWT hook with `user_role` + `is_super_admin` claims
- **CMS**: Services, Blog, Products, Pages editors
- **Media Library**: Upload, gallery, folder filter
- **Site Settings**: Hero, colors, footer (branding + contact + nav), logo, SEO
- **About Panel**: Hero, portrait, books
- **CRM Inbox**: Split view, threading, search, compose/reply/forward, drafts/sent/trash/archive
- **Pipeline**: 5-stage Kanban, drag & drop, inline editing, follow-ups
- **Email Workspace**: Unified ComposeWindow, signatures, attachments, auto-save
- **Usage Dashboard**: Churn risk, active days, top events per tenant
- **Audit Dashboard**: Timeline, search, CSV export, restore
- **Backup System**: Edge function, manual/daily/weekly, 30d retention
- **Roles**: admin, editor, sales, viewer + is_super_admin bypass
- **Telemetry**: 20 event types via `analytics.ts`

### Fixed
- **CRITICAL**: JWT hook was overriding `role: "authenticated"` with custom role
  → Renamed to `user_role` (migration `20260610000014_fix_jwt_role_claim.sql`)
- Auto-create profiles on signup (trigger `handle_new_user`)
- useTenant hook: JWT fallback + DB fetch + auto-upsert

### Changed
- SiteSettings: Dedicated Footer tab (branding, contact, navigation)
- SiteHeader/Footer: Logo image support (fallback to monogram)
- Email display in public site footer
- Migration `20260610000013_auto_create_profiles.sql`: seed profiles + site_logo setting

### Infrastructure
- Cloudflare Worker deployment for public sites
- Dual Supabase environment (Production + Dev)
- Feature branch development flow

## v0.4.0-dev (2026-07-08)

### Added
- **Documentation Update Pass**: All 10 architecture docs updated with current state
- **Artist Module INTEGRATION_PLAN.md**: Complete integration plan for artist module in `docs/modules/artist/`
- **Artist Module v0.1 — Read-only CMS Shell**:
  - `src/modules/artist/` structure with types, DB helpers, 8 read-only panels
  - `artist_module` feature flag in `TenantFeature` type + `useTenant.ts`
  - Conditional sidebar menu (only shown when `artist_module = true`)
  - 9 new routes under `/dashboard/artist/*`
  - 8 read-only panels: Biography, Filmography, Television, Theatre, Timeline, Gallery, Press, Showreels
  - Additive migration `20260708000002_artist_module.sql`: 8 new tables, media table extension, RLS policies
  - Empty states for all panels when no data exists
- **media table extension**: `media_type`, `photographer`, `copyright`, `source_url` columns
- **Artist types**: `Biographies`, `FilmographyEntry`, `TelevisionEntry`, `TheatreEntry`, `CareerTimeline`, `GalleryItem`, `PressItem`, `Showreel`
- **Artist DB helpers**: Read-only queries for all 8 tables in `src/modules/artist/db/queries.ts`

### Changed
- `TenantFeature` type: added `artist_module`
- `FEATURE_MODULES` in `access.ts`: added artist paths
- `useTenant.ts` SA feature map: includes `artist_module: true`
- `AdminSidebar.tsx`: new "Καλλιτέχνης" nav group with conditional rendering
- `Dashboard.tsx`: 9 new artist routes

### Documentation Updated
- `docs/MODULES.md` — Artist Module section + updated dependency graph
- `docs/FEATURES.md` — v0.4.0-dev bump, Artist Module features
- `docs/DATABASE.md` — 8 new tables, media column extensions
- `docs/ROADMAP.md` — v0.4 Artist Module milestone
- `docs/PERMISSIONS.md` — Artist Module permissions
- `docs/DEPLOYMENT.md` — Artist module deployment phases
- `docs/ARCHITECTURE.md` — Artist Module planned section
- `docs/KNOWN_ISSUES.md` — Updated
- `docs/TECH_DEBT.md` — Updated
- `docs/modules/artist/INTEGRATION_PLAN.md` — Updated with v0.1 status

### Migration
- `20260708000002_artist_module.sql` — 8 new artist tables, media extension, RLS policies

### Build
- ✅ Zero errors, 2,380 modules transformed, 1.7 MB bundle

## v0.5.3-dev (2026-07-08) — Week 3: Television + Theatre CRUD

### Added
- **Television CRUD panel** — list/create/edit/delete + MediaPicker + history logging
- **Theatre CRUD panel** — list/create/edit/delete + MediaPicker + history logging
- **Development Constitution** (`docs/CONSTITUTION.md`) — 8 Golden Rules, Definition of Done
- **Portfolio MASTER** (`docs/modules/portfolio/MASTER.md`) — central module reference
- **Reports**: week-03-television.md, week-03-theatre.md

### Changed
- Portfolio manifest: TV + Theatre routes use CRUD panels (were read-only)

### Build
- ✅ Zero errors, 2,382 modules

## v0.5.0-dev (2026-07-08) — Week 1: Biography CRUD

### Added
- **Biography CRUD panel** (`src/modules/portfolio/pages/BiographyCRUD.tsx`):
  - Full form: professional_type, short_bio, birth_year, birth_place, pseudonyms
  - RichEditor for bio content (TipTap)
  - MediaPicker for profile portrait
  - Status selector (draft/review/published)
  - Verified toggle
  - Upsert pattern (single row per tenant)
  - Archive button (soft delete)
  - Validation (4-digit birth year)
  - History logging (content_history)
  - Empty state + error state + loading state
  - Has-changes tracking for save button state
- **professional_type column** on `biographies` table (migration applied)
- **Biographies type** updated with professional_type field

### Changed
- Portfolio manifest: biography routes use BiographyCRUD (was read-only BiographyPanel)

### Migration
- `ALTER TABLE biographies ADD COLUMN professional_type TEXT DEFAULT 'actor'` (applied to production)

## v0.5.1-dev (2026-07-08) — Week 2: Filmography CRUD

### Added
- **Filmography CRUD panel** (`src/modules/portfolio/pages/FilmographyCRUD.tsx`):
  - List view with all entries, status badges, edit/delete actions
  - Create/edit form: title, title_en, year, genre, director, duration, role, sort_order
  - RichEditor for description
  - MediaPicker for poster image
  - IMDb + Trailer URL fields with validation
  - Status selector (draft/review/published) + verified toggle
  - Hard delete with confirmation dialog
  - History logging on create/update/delete
  - Empty state with "Προσθέστε την πρώτη" action
  - Sort order field (numeric)

### Changed
- Portfolio manifest: films route uses FilmographyCRUD (was read-only FilmographyPanel)

### Build
- ✅ Zero errors, 2,382 modules

## v0.4.1-dev (2026-07-08) — Registry Stabilization

### Added
- **ModuleRegistry.ts**: Self-registering module system (routes, sidebar, permissions)
- **Portfolio manifest.ts**: First module to use the registry
- **docs/patterns/**: 12 reusable architectural patterns
- **ADR-012**: Documentation-First Architecture Rule
- **ADR-013**: Module Registry System

### Changed
- **Artist Module → Portfolio Module**: Generic name covering actors, musicians, painters, writers, etc.
- **Dashboard routes**: Dynamic from ModuleRegistry.getRoutes()
- **AdminSidebar**: Dynamic from ModuleRegistry.getEnabled()
- Feature flag: added `portfolio_module` (artist_module kept for backward compat)

### Migration
- `20260708000002_artist_module.sql` applied to production Supabase ✓
- All 8 tables created: biographies, filmography_entries, television_entries, theatre_entries, career_timelines, gallery_items, press_items, showreels
- media table extended: media_type, photographer, copyright, source_url

### Smoke Test Results
- ✅ Kolokotronis (no portfolio_module) → no portfolio UI
- ✅ Tenant with portfolio_module=true → portfolio menu visible
- ✅ Dynamic routes from ModuleRegistry work correctly
- ✅ Sidebar groups: no duplication (single getEnabled() call)
- ✅ artist_module backward compat: both flags accepted
- ✅ Build: zero errors (2,382 modules)
- ✅ Deploy: aion-flowv2.vercel.app (HTTP 200)
- ✅ Migration: production Supabase (8 tables + media extension)
- ✅ No leftover `modules/artist` references in Dashboard or Sidebar

---

## Phase Close — Platform Evolution Milestone

### What transformed
The AION Flow evolved from **"CMS with features"** to **"modular platform with verticals"**.

### Key deliverables
- Module Registry (self-registering modules)
- Portfolio Module v1.0 (8 CRUD panels, architecture freeze)
- 12 reusable architecture patterns
- Development Constitution (9 Golden Rules)
- 25+ documentation files (100% coverage)
- 6 weekly completion reports
- ADR governance (13 architecture decisions)

### Core principles established
1. **Generalize When Proven, Not When Predicted** — protects from over-engineering
2. **No Docs. No Done.** — every feature requires code + QA + docs + commit

### Next phase: v1.0.x Platform Hardening
Performance, security, tests, accessibility, observability.
