# Tenant: Νικόλας Κολοκοτρώνης

**Slug:** `kolokotronis`
**Tenant ID:** `00000000-0000-0000-0000-000000000001`
**Industry:** psychology
**Type:** Psychologist — Individual practice
**Client email:** `admin@kolokotronis.gr`

## Stack

| Component | Technology |
|-----------|-----------|
| **Public site** | TanStack Start + React 19 SSR |
| **Hosting** | Cloudflare Workers |
| **CMS** | AION Flow (`aion-flowv2.vercel.app`) |
| **Database** | Shared Supabase (`qhbgptlklsavezxpksao`) |
| **Theme** | Dark gold/olive, Cormorant Garamond + DM Sans |

## Active Modules

| Module | Feature Flag | Notes |
|--------|-------------|-------|
| CMS Core | `cms` | All editors |
| CRM | `crm` | Inbox, Pipeline |

## Routes (11)

| Path | Purpose |
|------|---------|
| `/` | Homepage with hero, services, about, testimonials, blog, contact |
| `/about` | Biography, credentials, books |
| `/services` | Services listing |
| `/services/:slug` | Service detail |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog post |
| `/books` | Books showcase |
| `/contact` | Contact form + map |
| `/privacy` | Privacy policy (hardcoded) |
| `/terms` | Terms of use (hardcoded) |

## Site Settings

~90 keys in `site_settings` table. Full mapping in `CONTENT_MAPPING.md`.

## Deploy

| Target | URL | Env Vars |
|--------|-----|----------|
| CMS | `https://aion-flowv2.vercel.app` | Supabase keys |
| Public site | `https://kolokotronis-website.choliasmenos-panos.workers.dev` | Supabase keys + CONTACT_EMAIL |

## Key Contacts

- **Email:** nikolashealing@yahoo.gr
- **Phone:** +30 697 437 1139
- **Address:** Απόλλωνος 30, Νέο Ηράκλειο, 14121

---

*See `CONTENT_MAPPING.md` for complete content inventory.*
