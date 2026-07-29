# Kolokotronis — Development History

**Tenant:** Νικόλας Κολοκοτρώνης (Ψυχολόγος)
**Period:** April 2026 — Present
**Documented:** 2026-07-12 (reconstructed from git logs)
**Last updated:** 2026-07-29 (Phase 5)

---

## Phase 0: CMS Connection (June 6, 2026)

### Initial Session — AION Flow ↔ Kolokotronis Connection

The very first session connected the AION Flow CMS (originally an e-commerce platform) to the Kolokotronis site.

| Decision | Detail |
|----------|--------|
| **Date** | June 6, 2026 — 7:50 AM |
| **CMS base** | AION Flow V2 (React 18 + Vite 5 + Supabase) |
| **Original state** | 100% e-commerce (products, orders, customers) |
| **Goal** | Transform into business CMS for psychologist site |
| **Supabase project** | `qhbgptlklsavezxpksao.supabase.co` (still active) |

### 5 Key Architectural Decisions (made in first session)

1. **`core_values` instead of `values`** — `values` is SQL reserved keyword
2. **Blog content as `jsonb`** — TipTap editor stores JSON document structure
3. **SEO layer from start** — `meta_title`, `meta_description`, `og_image` on all content tables
4. **Generic `site_settings` table** — `key` TEXT UNIQUE, `value` JSONB for all site-wide settings
5. **Storage strategy** — Supabase Storage buckets (`site-images`, `blog-images`) instead of raw URLs

### Multi-Tenant Decision

Before any code was written, the user requested `tenant_id` on ALL new tables. This single decision transformed AION Flow from a single-tenant CMS into a multi-tenant platform.

### Key Quote (from first session)

> "Αν μιλάμε για το template που θα χρησιμοποιήσεις για μελλοντικούς πελάτες του AION, θα έδινα έγκριση αφού γίνουν αυτές οι 5 αλλαγές. Με αυτές αποκτάς ουσιαστικά ένα 'AION Business CMS' που μπορεί να χρησιμοποιηθεί ξανά και ξανά σε κάθε νέο πελάτη."

---

## Phase 1: Foundation (April — May 2026)

### Site Launch

| Event | Detail |
|-------|--------|
| **Initial commit** | `396ded9` — "feat: initial site" |
| **Framework** | TanStack Start + React 19 (SSR) |
| **First deploy** | Vercel (Nitro `vercel` preset) |
| **Stack decisions** | 46 shadcn/ui components, Tailwind CSS 4.2, Cormorant Garamond + DM Sans |

### Migrations

| Change | Reason |
|--------|--------|
| Vercel → Cloudflare Workers | `2d472df` — Better SSR performance, free tier |
| Nitro preset: vercel → cloudflare-module | Multiple fixes for build output |

---

## Phase 2: Content & Features (May — June 2026)

### Books System

| Feature | Commit | Description |
|---------|--------|-------------|
| BooksShowcase on homepage | `856578d` | Featured books section |
| Publisher links | `293e62c` | External buy links |
| Duplicate merge + url_alt | `6cb5add` | Better book management |
| Missing year handling | `9873c00` | "Προσωρινά μη διαθέσιμο" fallback |

### Services & Content

| Feature | Commit | Description |
|---------|--------|-------------|
| Service summaries | `ff626ad` | Single-line descriptions |
| page_data support | `0869d03` | Per-route hero images, titles, subtitles |
| Category filter on blog | `0a3329f` | ΟΜΙΛΙΕΣ, ΣΕΜΙΝΑΡΙΑ, ΟΜΑΔΕΣ |
| Related articles on service pages | `13dd844` | Cross-linking content |

### Contact Form

| Feature | Commit | Description |
|---------|--------|-------------|
| SMTP edge function | `61af64d` | Forward via SMTP instead of Resend |
| Fire-and-forget fix | `9d1eee4` | Await SMTP forwarding |
| Telemetry events | `5facb24` | lead_created + message_received |

---

## Phase 3: Architecture Evolution (June 2026)

### Core Entities Migration

| Change | Commit | Description |
|--------|--------|-------------|
| **Single Source of Truth** | `4e0be0a` | Business info centralized |
| **Core Entities** | `6c77333` | Migrate branding + business info from `site_settings` to `core_entities` with versioning |
| Dynamic contact info | `eb4c902` | Phone, email, address, hours from DB |

### CMS Integration (AION Flow)

| Feature | AION Flow Commit | Description |
|---------|-----------------|-------------|
| Services CRUD | `f635e9e` | CMS panels for services |
| Blog CRUD | `86f5ef4` | Blog post management |
| Testimonials CRUD | Early | Review management |
| Site Settings (90+ keys) | `ccca8fc` | Hero, footer, nav, SEO |
| Branding | `b74907b` | Logo, colors, favicon |
| Business Info | `4e0be0a` | Contact, address, hours |
| Media Library | `566a5e7` | Image upload & management |

### Responsive Design

| Fix | Commit | Description |
|-----|--------|-------------|
| Parallax fixes | `2646694` → `f21d0fe` | bg-contain, aspect-ratio, no cropping |
| Full responsive QA | `a4e5371` | 11 viewports checked, 15 files modified |
| Hero heights, spacing | Global CSS | min-h, aspect ratio per breakpoint |

---

## Phase 4: Technical Debt & Hardening (June — July 2026)

### Critical Fixes

| Issue | Commit | Fix |
|-------|--------|-----|
| React error #300 (hydration) | `ff0ce06` → `a497e5b` | Wrap Await in Suspense |
| 500 error (QueryClient) | `fe1beb6` | RootComponent cannot use useQuery before provider |
| Hydration crash (blog filter) | `5d71b84` | validateSearch + useSearch |
| JWT role claim conflict | `d616d20` | role → user_role, auto-profile trigger |

### Current Architecture

```
TanStack Start (SSR)
  ↓ prefetch
Shared Supabase (site_settings, core_entities, services, blog_posts, testimonials, etc.)
  ↓ anon key
Cloudflare Worker (Nitro cloudflare-module)
  ↓
Browser
```

### Key Metrics

| Metric | Value |
|--------|-------|
| **Total commits** | 45+ |
| **CMS panels** | 16 |
| **Site settings keys** | ~95 |
| **Routes** | 11 |
| **DB tables** | 8+ (services, blog, testimonials, credentials, core_values, site_settings, core_entities, contact_submissions) |
| **Images** | logo.png, logo-white.png + dynamic uploaded images |

---

## Phase 5: Content Audit & CMS Migration (July 2026)

### Announcement Taxonomy Fix

The blog category filter had a subtle bug: `CATEGORIES` defined separate "ΟΜΙΛΙΕΣ" and "ΣΕΜΙΝΑΡΙΑ" values, but the DB stored the canonical combined value "ΟΜΙΛΙΕΣ ΣΕΜΙΝΑΡΙΑ". Filtering by individual values would not match stored posts.

| Fix | Description |
|-----|-------------|
| `normalizeBlogCategory()` | Maps individual names (ΟΜΙΛΙΕΣ, ΣΕΜΙΝΑΡΙΑ) → canonical combined (ΟΜΙΛΙΕΣ ΣΕΜΙΝΑΡΙΑ) |
| `matchesCategory()` | Normalizes both sides before comparison |
| `CANONICAL_CATEGORIES` | Filter buttons show canonical values only (3 total: ΑΡΘΡΑ, ΟΜΙΛΙΕΣ ΣΕΜΙΝΑΡΙΑ, ΟΜΑΔΕΣ) |
| `ANNOUNCEMENT_CATEGORIES` | Defines which categories are "announcements" (ΟΜΙΛΙΕΣ ΣΕΜΙΝΑΡΙΑ, ΟΜΑΔΕΣ) |

### Rich-Text Rendering Hardening

`renderTipContent()` was missing handlers for several TipTap node types, causing content to silently drop.

| Node Type | Fix |
|-----------|-----|
| orderedList (ol) | Added `<ol>` output with proper nesting |
| listItem | Corrected `<li>` rendering (was using `<ul>` for all lists) |
| horizontalRule | Added `<hr>` output |
| hardBreak | Changed from `<br/>` (self-closing) to `<br>` (HTML5 void) |
| codeBlock | Added `<pre><code>` wrapper |
| blockquote | Added `<blockquote>` with styling |
| link mark | Added `<a href>` with `target=_blank rel=noopener noreferrer` |
| strike mark | Added `<s>` tag |
| underline mark | Added `<u>` tag |
| All text + attrs | Wrapped in `escapeHtml()` for XSS sanitization |

### CMS Settings — 5 New Keys

| Key | Type | Default | Purpose |
|-----|------|---------|---------|
| `announcement_show_dates` | text | `"false"` | Hide/show dates on announcement posts |
| `blog_back_button_text` | text | `"Όλα τα άρθρα"` | Back link on regular blog posts |
| `announcement_back_button_text` | text | `"Όλες οι ανακοινώσεις"` | Back link on announcement posts |
| `blog_empty_message` | text | `"Δεν υπάρχουν ακόμα άρθρα."` | Empty state for blog list |
| `announcement_empty_message` | text | `"Δεν υπάρχουν ακόμα ανακοινώσεις."` | Empty state for announcement list |

### Date Visibility Toggle

- `announcement_show_dates` controls date display on all 5 announcement render points
- Pattern: `=== "true"` (no DB entry = false, opt-in)
- Regular article dates unaffected

### CMS Editor Enhancements

| Feature | Description |
|---------|-------------|
| @tiptap/extension-underline | Underline button in toolbar |
| Strike button | Toggle strike-through formatting |
| H3 heading button | Third-level heading support |
| Clear Formatting button | Remove all marks from selection |

### Release Process Established

| Artifact | Purpose |
|----------|---------|
| `QA_CHECKLIST.md` | 10-section mandatory QA checklist per release |
| `RELEASE_PROCESS.md` | 6-phase release workflow (dev → pre-deploy → deploy → QA → cleanup → close) |
| `AGENT_PERFORMANCE.md` | Metrics schema, KPIs, release comparison |
| `docs/releases/2026-07-29/RELEASE.md` | Full release record (47/47 tests, 2 deferred) |
| `SESSION_LOG_TEMPLATE.md` | Canonical template for all future sessions |
| `MEMORY_UPDATE_PROTOCOL.md` | Mandatory post-task sequence |
| `SESSION_OBJECTIVE.md` | Protocol for session objectives |
| Machine-readable metrics | `METRICS/releases/2026-07-29.json` |

### 2026-07-29 Release Summary

| Metric | Value |
|--------|-------|
| **Release type** | Process Baseline |
| **Commits (kolokotronis)** | 8 |
| **Commits (aion-flow-v2)** | 4 |
| **Automated QA** | 47/47 Playwright tests |
| **Deploy targets** | Cloudflare Workers + Vercel (CMS) |
| **Demo content lifecycle** | Created → verified → deleted |
| **Responsive screenshots** | 18 (6 viewports × 3 pages) |
| **Deferred manual checks** | 2 (CMS auth, paste) |
| **AGENTS.md rules added** | 8 working rules |
| **AKES docs created** | 7 new files |
| **AKES docs updated** | 6 existing files |

### Current Architecture (post-Phase 5)

```
TanStack Start (SSR)
  ↓ prefetch
Shared Supabase
  ├── site_settings (~95 keys)
  ├── core_entities (branding, contact, hours)
  ├── services (5 services)
  ├── blog_posts (3 categories, TipTap JSON content)
  ├── testimonials
  ├── credentials
  ├── core_values
  └── contact_submissions
  
CMS: AION Flow Vercel (16 panels)
Public: Cloudflare Workers (11 routes)
```

---

## Timeline Summary

```
April 2026     ─ Initial site launch (TanStack Start)
May 2026       ─ Books, services, blog, contact form
               ─ Vercel → Cloudflare Workers migration
June 2026      ─ Core Entities architecture
               ─ CMS integration with AION Flow
               ─ Responsive QA (11 viewports)
               ─ Hydration crash fixes (React #300)
July 2026      ─ AION Flow Platform: Module Registry, Portfolio, Retreat
               ─ AKES v1 Documentation
               ─ Tenant fully stable
               ─ Phase 5: Content Audit & CMS Migration
               ─ Announcement taxonomy fix
               ─ Rich-text rendering hardening (all node types)
               ─ 5 new CMS settings keys
               ─ Release process established (Process Baseline)
               ─ QA: 47/47 Playwright tests
               ─ 2 deferred manual checks
```

---

*Reconstructed from git history by AKES. Some early decisions may not be captured.*  
*Last updated: 2026-07-29 (Phase 5 — Content Audit & CMS Migration)*
