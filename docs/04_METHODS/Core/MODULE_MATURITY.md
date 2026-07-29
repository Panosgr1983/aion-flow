# Module Maturity Model (MMI)

**Part of AKES v1.1 — Governance Engine**
**Status:** Standard — applies to ALL modules

---

## Maturity Levels

| Layer | Name | Description | Weight |
|-------|------|-------------|--------|
| L1 | **Data** | Database schema exists, columns defined, tenant_id present | 25% |
| L2 | **Authoring** | CMS panels exist, CRUD works, permissions configured | 25% |
| L3 | **Delivery** | Public site / API renders correctly, tenant isolation verified | 25% |
| L4 | **Intelligence** | Telemetry, analytics, tests, validations, fallback behavior | 25% |

Each layer has sub-criteria. A layer is COMPLETE only when ALL sub-criteria pass.

---

## Scoring

| Score | Label | Meaning |
|-------|-------|---------|
| 100% | **PRODUCTION** | All layers complete, tenant-ready |
| 75-99% | **STABLE** | Core complete, intelligence gaps |
| 50-74% | **DEVELOPMENT** | Data + Authoring ready, delivery or intelligence pending |
| 25-49% | **EARLY** | Data ready, authoring in progress |
| 1-24% | **PLANNED** | Schema or concept exists |
| 0% | **NOT STARTED** | No implementation |

---

## Completeness Rule

A feature is **COMPLETE** only when verified at ALL three delivery layers (L1 + L2 + L3).  
Intelligence (L4) is optional for v1 but required for v2 status.

### VERIFIED

In addition to COMPLETE, a module may be marked as **VERIFIED** by the product owner:

```yaml
status: COMPLETE
verified: true
verified_by: "Panagiotis"
verified_date: "2026-07-13"
verified_version: "0.7.0"
```

Until VERIFIED, the module is technically COMPLETE but not owner-approved.

---

## Module Maturity Scores

### Portfolio Module

| Layer | Sub-criteria | Status |
|-------|-------------|--------|
| L1 Data | 8 tables (biographies, filmography, TV, theatre, timeline, gallery, press, showreels) | ✅ |
| L1 Data | All tables have tenant_id | ✅ |
| L1 Data | EN columns (title_en, description_en) | ✅ |
| L2 Authoring | 8 CRUD panels | ✅ |
| L2 Authoring | Permissions: view + edit | ✅ |
| L2 Authoring | History logging (content_history) | ✅ |
| L3 Delivery | Tenant isolation audit passed | ✅ |
| L3 Delivery | All panels use effectiveTenantId | ✅ |
| L3 Delivery | Empty/loading/error states | ✅ |
| L4 Intelligence | Telemetry events | ❌ |
| L4 Intelligence | Automated tests | ❌ |
| L4 Intelligence | Reuse score tracking | ❌ |

**Score:** 8/12 criteria = 75%  
**Status:** STABLE  
**Verified:** ✅ (frozen v1.0)

### Retreat Module

| Layer | Sub-criteria | Status |
|-------|-------------|--------|
| L1 Data | 5 tables (experiences, workshops, events, faq, bookings) | ✅ |
| L1 Data | All tables have tenant_id | ✅ |
| L1 Data | EN columns (events ✅, experiences/workshops partial) | 🟡 |
| L2 Authoring | 5 CRUD panels | ✅ |
| L2 Authoring | Permissions: view + edit + bookings | ✅ |
| L2 Authoring | History logging | ✅ |
| L3 Delivery | Tenant isolation audit passed | ✅ |
| L3 Delivery | All panels use effectiveTenantId | ✅ |
| L3 Delivery | Empty/loading/error states | ✅ |
| L4 Intelligence | Telemetry events | ❌ |
| L4 Intelligence | Automated tests | ❌ |
| L4 Intelligence | Reuse score tracking | ❌ |

**Score:** 9.5/12 = 79%  
**Status:** STABLE  
**Verified:** ❌

### Locale Module

| Layer | Sub-criteria | Status |
|-------|-------------|--------|
| L1 Data | locale_translations table (not yet created) | ❌ |
| L1 Data | locale column on content tables (planned) | ❌ |
| L2 Authoring | Translations editor panel | ❌ |
| L2 Authoring | EN tabs on ExperiencesCRUD | ❌ |
| L2 Authoring | EN tabs on WorkshopsCRUD | ❌ |
| L3 Delivery | Public site locale rendering | ⚠️ Partial (Events only) |
| L3 Delivery | Fallback: GR when EN missing | ⚠️ Hardcoded fallback |
| L4 Intelligence | Missing translation detection | ❌ |
| L4 Intelligence | Translation coverage metrics | ❌ |

**Score:** 1/12 = 8%  
**Status:** EARLY  
**Verified:** ❌

### Media Module

| Layer | Sub-criteria | Status |
|-------|-------------|--------|
| L1 Data | media table with full schema | ✅ |
| L1 Data | Storage buckets (site-images, blog-images) | ✅ |
| L1 Data | tenant_id on all records | ✅ |
| L2 Authoring | MediaLibrary panel | ✅ |
| L2 Authoring | MediaPicker in all editors | ✅ |
| L2 Authoring | UploadCmsAsset pipeline | ✅ |
| L3 Delivery | Images served from Storage | ✅ |
| L3 Delivery | Tenant isolation verified | ✅ |
| L3 Delivery | Methods documented (7) | ✅ |
| L4 Intelligence | Telemetry (media.upload, media.delete) | ✅ |
| L4 Intelligence | Duplicate detection | ❌ |
| L4 Intelligence | Image optimization / WebP | ❌ |

**Score:** 10/12 = 83%  
**Status:** PRODUCTION  
**Verified:** ❌

### CRM Module

| Layer | Sub-criteria | Status |
|-------|-------------|--------|
| L1 Data | 6 tables (conversations, messages, email, etc.) | ✅ |
| L1 Data | tenant_id on tables | ✅ |
| L2 Authoring | Inbox, Pipeline, Email panels | ✅ |
| L2 Authoring | Permissions configured | ✅ |
| L3 Delivery | Tenant isolation audit | ❌ **BLOCKED** |
| L3 Delivery | withTenant() in helpers | ❌ **BLOCKED** |
| L4 Intelligence | Telemetry | ❌ |
| L4 Intelligence | Tests | ❌ |

**Score:** 4/12 = 33%  
**Status:** EARLY (BLOCKED)  
**Verified:** ❌  
**Blocker:** Tenant isolation — see TECH_DEBT #20

### Blog Module

| Layer | Sub-criteria | Status |
|-------|-------------|--------|
| L1 Data | blog_posts table with TipTap content | ✅ |
| L1 Data | tenant_id present | ✅ |
| L2 Authoring | BlogPosts CRUD panel | ✅ |
| L2 Authoring | Categories (canonical: ΟΜΙΛΙΕΣ ΣΕΜΙΝΑΡΙΑ, ΟΜΑΔΕΣ, ΑΡΘΡΑ) | ✅ |
| L2 Authoring | Rich-text editor: Underline, Strike, H3, Clear Formatting | ✅ |
| L2 Authoring | Permissions (cms.edit) | ✅ |
| L3 Delivery | Public site renders correctly | ✅ |
| L3 Delivery | All TipTap node types rendered (12/12) | ✅ |
| L3 Delivery | XSS sanitization (escapeHtml on all text + attrs) | ✅ |
| L3 Delivery | withTenant() verified | ✅ |
| L4 Intelligence | Telemetry | ❌ |
| L4 Intelligence | Tests (Playwright) | ✅ 47 tests in kolokotronis repo |

**Score:** 10/12 = 83%  
**Status:** PRODUCTION  
**Verified:** ❌

**Last evidence update:** 2026-07-29d (RichEditor unified across Blog/About/Services. `renderTipContent` extracted to shared lib. Blog eyebrow dynamic. Category normalization fixed.)

---

### Services Module (FAQ)

| Layer | Sub-criteria | Status |
|-------|-------------|--------|
| L1 Data | services table with slug, title, description, content | ✅ |
| L1 Data | service_faq_entries table (question, answer, sort_order, is_active) | ✅ |
| L1 Data | Both tables have tenant_id + FK + CHECK constraints | ✅ |
| L2 Authoring | Services CRUD panel (5 services) | ✅ |
| L2 Authoring | FAQ tab (inline add/edit/delete/reorder, empty state, sort_order) | ✅ |
| L2 Authoring | Permissions (cms.edit) | ✅ |
| L3 Delivery | Service detail page renders bio + FAQ + related articles | ✅ |
| L3 Delivery | FAQ accordion expand/collapse | ✅ |
| L3 Delivery | JSON-LD FAQPage structured data | ✅ |
| L3 Delivery | Tenant isolation verified (tenant_id FK on service_faq_entries) | ✅ |
| L4 Intelligence | Telemetry | ❌ |
| L4 Intelligence | Tests (Playwright) | ✅ 8 tests in kolokotronis repo |

**Score:** 10/12 = 83%  
**Status:** PRODUCTION  
**Verified:** ❌

**Last evidence update:** 2026-07-29d (RichEditor for short_description + long_description, backward compatible plain-text rendering, `extractPlainText` helper for list view, `service_faq_visible` toggle).

---

## Tenant Readiness Scores

### Kolokotronis

| Area | Score | Notes |
|------|-------|-------|
| Website (public) | 100% | Live, SSR, Cloudflare |
| CMS panels | 100% | 16 panels operational |
| Services | 100% | 5 services CRUD + RichEditor (short + long description) + FAQ tab + FAQ visibility toggle |
| Blog | 100% | 3 categories, canonical filters, rich-text hardened, dynamic eyebrow (Ανακοινώσεις), no date on seminars |
| Testimonials | 100% | CRUD with ratings |
| Bookings | — | Not applicable |
| Locale | — | GR only, not needed |
| Analytics | 100% | Pageviews, telemetry |
| **Overall** | **100%** | Production |

**Verified evidence:**
- **Last verified:** 2026-07-29d
- **Release:** `docs/releases/2026-07-29d/RELEASE.md`
- **Commit (kolokotronis):** `c5a9377`
- **Commit (aion-flow-v2):** `93980ec`
- **Automated QA:** 47/47 (Process Baseline) + 8/8 (PB#1 Service FAQ) + 12/12 (Manual QA) = **67 total**
- **Manual deferred:** 2 (CMS auth save/persist, Word/Google Docs paste)
- **Selector strategy:** `data-testid` for dynamic/repeated/translated elements
- **Next review:** 2026-10-29 (3-month cycle)

### Ktima Kareli

| Area | Score | Notes |
|------|-------|-------|
| Website (public) | 98% | SPA live, some static images not in Media Library |
| Experiences | 78% | DB + CMS ready, EN tabs pending |
| Workshops | 74% | DB + CMS ready, EN tabs pending |
| Events | 100% | Full bilingual, GR/EN tabs |
| FAQ | 100% | GR only (acceptable) |
| Bookings | 100% | Form + manager operational |
| Gallery | 100% | 10 images uploaded |
| Locale | 42% | Events complete, rest partial |
| **Overall** | **87%** | Active development |

---

## Platform Readiness

| Module | MMI Score | Status | Verified |
|--------|-----------|--------|----------|
| CMS Core | 100% | PRODUCTION | ✅ |
| Portfolio | 75% | STABLE | ✅ (frozen) |
| Retreat | 79% | STABLE | ❌ |
| Media | 83% | PRODUCTION | ❌ |
| Blog | 83% | PRODUCTION | ❌ |
| Services (FAQ) | 83% | PRODUCTION | ❌ |
| Bookings | 100% | PRODUCTION | ❌ |
| CRM | 33% | BLOCKED | ❌ |
| Locale | 8% | EARLY | ❌ |
| AKES | 88% | PRODUCTION | ❌ | (Dashboard live at `/dashboard/akes` — MMI, doc search, blockers) |
| Content Engine | 5% | PLANNED | — | RichEditor + renderTipContent unified across modules. Registry + normalizer pending Phases 1-6. |
| **Platform** | **71%** | **STABLE** | — |
