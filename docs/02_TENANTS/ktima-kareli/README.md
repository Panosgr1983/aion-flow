# Tenant: Κτήμα Καρέλη

**Slug:** `ktima-kareli`
**Tenant ID:** `a6a0e182-2e86-4b3a-9601-b055e56a605e`
**Industry:** wellness
**Type:** Retreat / Wellness center
**Client email:** `client@ktimakareli.gr`

## Stack

| Component | Technology |
|-----------|-----------|
| **Public site** | React 19 + Vite 8 SPA |
| **Hosting** | Vercel |
| **CMS** | AION Flow (`aion-flowv2.vercel.app`) |
| **Database** | Independent Supabase (`idagkrwpmcnppjpnrbgv`) |
| **Theme** | OKLCH sage/olive, Cormorant Garamond + Inter |

## Active Modules

| Module | Feature Flag | Notes |
|--------|-------------|-------|
| CMS Core | `cms` | Site Settings, Branding, Business Info |
| Portfolio (gallery) | `portfolio_module` | Gallery CRUD only |
| Retreat | `retreat_module` | Experiences, Workshops, Events, FAQ |
| Locale | `locale_module` | GR/EN translations |
| Booking | `retreat_booking` | Booking form + manager |

## Routes (8)

| Path | Purpose |
|------|---------|
| `/` | Homepage: hero, welcome, spaces, experiences, community, gallery, reviews, booking |
| `/experiences` | Experiences listing |
| `/experiences/:slug` | Experience detail |
| `/workshops` | Workshops listing |
| `/workshops/:slug` | Workshop detail |
| `/events` | Events listing |
| `/events/:id` | Event detail |
| `/community` | Community + FAQ |

## Site Content

~101 translation keys (GR/EN). Full mapping in `CONTENT_MAPPING.md`.

## Deploy

| Target | URL | Env Vars |
|--------|-----|----------|
| CMS | `https://aion-flowv2.vercel.app` | Supabase keys |
| Public site | `https://ktima-kareli-site.vercel.app` | `VITE_SUPABASE_URL=idagkrwpmcnppjpnrbgv`, `VITE_SUPABASE_ANON_KEY=sb_publishable_Bhg4ZXamykEokOHUS2PGTA_MrvZpMeT` |

## Key Contacts

- **Email:** info@ktimakareli.gr
- **Phone:** +30 27440 12345
- **Address:** Λουτράκι, Κορινθία

## Database Tables (9)

| Table | Rows | Purpose |
|-------|------|---------|
| `experiences` | 4 | Retreat activities |
| `workshops` | 3 | Workshops |
| `retreat_events` | 6 | Events (bilingual) |
| `faq_entries` | 5 | FAQ |
| `booking_submissions` | 0 | Booking requests |
| `testimonials` | 6 | Guest reviews |
| `gallery_items` | 10 | Gallery photos |
| `site_settings` | 8 | Contact, SEO, branding |
| `locale_translations` | 102 | GR/EN translation keys |

---

## Storage

| Bucket | Files | Purpose |
|--------|-------|---------|
| `kareli-images` | 20 | Hero, experiences, gallery, logos, icons |

*See `CONTENT_MAPPING.md` for complete content inventory.*
