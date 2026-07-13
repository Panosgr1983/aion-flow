# Kolokotronis — Development History

**Tenant:** Νικόλας Κολοκοτρώνης (Ψυχολόγος)
**Period:** April 2026 — Present
**Documented:** 2026-07-12 (reconstructed from git logs)

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
| **Total commits** | 40+ |
| **CMS panels** | 16 |
| **Site settings keys** | ~90 |
| **Routes** | 11 |
| **DB tables** | 8+ (services, blog, testimonials, credentials, core_values, site_settings, core_entities, contact_submissions) |
| **Images** | logo.png, logo-white.png + dynamic uploaded images |

---

## Timeline Summary

```
April 2026    ─ Initial site launch (TanStack Start)
May 2026      ─ Books, services, blog, contact form
              ─ Vercel → Cloudflare Workers migration
June 2026     ─ Core Entities architecture
              ─ CMS integration with AION Flow
              ─ Responsive QA (11 viewports)
              ─ Hydration crash fixes (React #300)
July 2026     ─ AION Flow Platform: Module Registry, Portfolio, Retreat
              ─ AKES v1 Documentation
              ─ Tenant fully stable
```

---

*Reconstructed from git history by AKES. Some early decisions may not be captured.*
