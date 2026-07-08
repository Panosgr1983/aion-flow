# AION CMS — Features

> Version: **v0.4.0-dev** — δες `VERSIONS.md` για πλήρες changelog.
> Τι μπορεί να κάνει το AION σήμερα.

## Feature Status Legend

| Badge | Meaning |
|-------|---------|
| ✅ Stable | Production-ready |
| 🟡 Beta | Working, improvements planned |
| 🔄 Planned | On roadmap |
| ❌ Not started | Future |

---

## CMS Core

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | ✅ Stable | Metrics, navigation |
| Authentication | ✅ Stable | Email/password, JWT, Supabase Auth |
| Multi-Tenant | ✅ Stable | RLS, `withTenant()`, tenant isolation |
| Editor Role | ✅ Stable | Full CMS, no `is_super_admin` |
| Site Settings | ✅ Stable | Logo, favicon, hero, colors, footer, contact |
| Pages | ✅ Stable | Edit hero + content per route |
| Blog | ✅ Stable | CRUD, featured image, categories |
| Seminar Section (Homepage) | ✅ Stable | Independent section on homepage; title, subtitle, CTA, count, category filter, visibility — all editable from Site Settings; cards from Blog CMS |
| Recent Articles Section (Homepage) | ✅ Stable | Same pattern as Seminar — independent homepage section, 7 editable fields, cards from Blog CMS, default hidden |
| Products | ✅ Stable | CRUD, images, categories, prices, stock |
| Services | ✅ Stable | CRUD, images, icons, ordering |
| Categories | ✅ Stable | CRUD, tree structure |
| Media Library | 🟡 Beta | Upload, gallery, categories, filters |
| Media Picker | 🟡 Beta | Inline selection |
| Orders | ✅ Stable | View, status management |
| Testimonials | ✅ Stable | CRUD |
| Core Values | ✅ Stable | CRUD |
| CTA Panel | ✅ Stable | Configurable call-to-action |
| SEO | ✅ Stable | Meta tags, OG images per page |

## Artist Module (Planned v0.1)

| Feature | Status | Notes |
|---------|--------|-------|
| Biography editor | 🔄 Planned | |
| Filmography CRUD | 🔄 Planned | |
| Television CRUD | 🔄 Planned | |
| Theatre CRUD | 🔄 Planned | |
| Timeline editor | 🔄 Planned | |
| Gallery management | 🔄 Planned | |
| Press mentions | ❌ Future | |
| Showreels | ❌ Future | |

## Media Architecture

| Feature | Status | Notes |
|---------|--------|-------|
| `uploadImage()` (legacy) | ✅ Stable | Legacy, being replaced |
| `uploadCmsAsset()` | 🟡 Beta | Tenant-aware, metadata, telemetry |
| Media DB table | 🟡 Beta | Tenant, category, source, tags |
| Gallery filters | 🟡 Beta | By category, source, tenant |
| Drag & drop upload | 🔄 Planned | |
| Bulk select/delete | 🔄 Planned | |
| Image optimization | 🔄 Planned | Auto-resize, WebP |
| Usage detection | 🔄 Planned | Warn before delete if in-use |
| `media_type` column (artist extension) | 🔄 Planned | Taxonomy for artist-specific media types |

## CRM

| Feature | Status | Notes |
|---------|--------|-------|
| Inbox (split view) | ✅ Stable | Threading, search |
| Lead Pipeline (Kanban) | ✅ Stable | 5 stages, drag & drop |
| Pipeline automation | 🔄 Planned | Auto-move, triggers |
| Email Workspace | ✅ Stable | Compose, drafts, signatures |
| Contact form | 🟡 Beta | Edge function `send-contact-email` |
| Customers | ✅ Stable | List, details |
| Credentials | ✅ Stable | Manage credentials |

## Analytics & Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Usage Dashboard | ✅ Stable | Churn risk, active days, top events |
| Audit Dashboard | ✅ Stable | Timeline, search, CSV export |
| Real-time stats | 🔄 Planned | |

## Operations

| Feature | Status | Notes |
|---------|--------|-------|
| Backup System | ✅ Stable | Manual/daily/weekly, edge function |
| Supabase Edge Functions | ✅ Stable | Backups, contact form |
| Deployment (Vercel) | ✅ Stable | Auto-deploy |
| Public Site (Cloudflare) | ✅ Stable | Tenant public sites |

## Portfolio Module (v0.1 — Read-only)

| Feature | Status | Notes |
|---------|--------|-------|
| Module Registry | ✅ Stable | `ModuleRegistry.ts` — self-registering modules |
| Module Manifest | ✅ Stable | `portfolio/manifest.ts` — routes, sidebar, permissions |
| Biography editor | ✅ Stable | Full CRUD: RichEditor, MediaPicker, upsert, history |
| Filmography editor | ✅ Stable | Full CRUD: list, create, edit, delete, media, history |
| Television editor | ✅ Stable | Full CRUD: list, create, edit, delete, media, history |
| Theatre editor | ✅ Stable | Full CRUD: list, create, edit, delete, media, history |
| Timeline editor | ✅ Stable | Full CRUD: categories, year/month, status, preview |
| Gallery editor | ✅ Stable | Full CRUD: grid, lightbox, metadata, MediaPicker |
| Press editor | ✅ Stable | Full CRUD: body, featured, MediaPicker, history |
| Showreels editor | ✅ Stable | Full CRUD: video, platform, duration, thumbnail, history |
| Portfolio DB tables | 🟡 Beta | 8 tables + media extension (actor-specific schema) |
| Portfolio sidebar group | 🟡 Beta | Registry-driven, conditional on feature flag |
| Architecture Patterns | ✅ Stable | 12 patterns in `docs/patterns/` |
| Documentation-First Rule | ✅ Stable | ADR-012, pre-commit checklist |
| Generic Portfolio Schema | 🔄 Planned | v0.2 — portfolio_profiles, portfolio_entries |

## Multi-Project Support

| Feature | Status | Notes |
|---------|--------|-------|
| External tenant sites | 🟡 Beta | kolokotronis-website via Cloudflare Workers |
| Cross-project Supabase connection | 🟡 Beta | Shared Supabase across independent projects |

## Upcoming

| Feature | Status | Target |
|---------|--------|--------|
| Gallery 2.0 (categories, filters, bulk) | 🔄 Planned | v0.2 |
| Rich Editor inline media | 🔄 Planned | v0.2 |
| Page Builder (drag & drop) | 🔄 Planned | v0.3 |
| Theme System | 🔄 Planned | v0.3 |
| SEO Manager | 🔄 Planned | v0.3 |
| Form Builder | 🔄 Planned | v0.3 |
| Email Campaigns | 🔄 Planned | v0.4 |
| Pipeline Automation | 🔄 Planned | v0.4 |
| Subscriptions & Billing | 🔄 Planned | v0.5 |
| Public Release (v1.0) | 🔄 Planned | v1.0 |

---

_Τελευταία ενημέρωση: 2026-07-08_
