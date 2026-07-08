# AION CMS — Deployment Guide

## Environments

### Production
| Service | URL | Branch |
|---------|-----|--------|
| CMS | https://aion-flowv2.vercel.app | `main` |
| Supabase | https://supabase.com/dashboard/project/qhbgptlklsavezxpksao | — |

### Development
| Service | URL | Branch |
|---------|-----|--------|
| CMS | Vercel Preview | feature/release branches |
| Supabase | https://supabase.com/dashboard/project/bqvjstaqqgxzjojwodwr | — |

## Deploy Flow

```
Feature → Develop → Preview → QA → Production
```

### 1. Feature Development
```bash
git checkout develop
git checkout -b feature/my-feature
# work, commit, push
```

### 2. Preview Deploy
```bash
# Vercel auto-deploys preview for PRs
# Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to DEV values
```

### 3. QA
- Verify in preview URL
- Test media upload, content CRUD, tenant switching
- Check console for errors

### 4. Merge to Release
```bash
git checkout release/v0.2
git merge feature/my-feature
# Deploy release branch to Vercel preview
# Run migrations on DEV Supabase
```

### 5. Production
```bash
git checkout main
git merge release/v0.2
# Deploy main to Vercel production
# Run migrations on PROD Supabase (with backup first)
```

## Supabase Migrations

### Apply migrations to DEV
```bash
supabase db push --linked --password "$DEV_DB_PASSWORD"
```

### Apply migrations to PROD
```bash
supabase link --project-ref PROD_REF
supabase db push --linked --password "$PROD_DB_PASSWORD"
```

## Environment Variables

```
VITE_SUPABASE_URL=<project_url>
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_ENABLE_MEDIA_MANAGER=false   # Feature flag
```

## Rollback

1. `git revert <commit>` (code)
2. `supabase db push --linked` (reverse migration — γραπτό rollback SQL)
3. Ενημέρωση CHANGELOG

## Τenant Site Deployments (Cloudflare Workers)

### kolokotronis-website

| Property | Value |
|----------|-------|
| **Worker Name** | `kolokotronis-website` |
| **Cloudflare Account ID** | `94b5edc5fc91ada10fe8a213cca836cb` |
| **Framework** | React 19 + TanStack Start 1.168 + Nitro SSR |
| **Preset** | `cloudflare-module` |
| **Entry** | `dist/server/index.mjs` |
| **Static Assets** | `dist/client` |
| **Compat Flags** | `nodejs_compat` |
| **Custom Domain** | TBD |

### Dual Deployment Model

| Project | Platform | Purpose |
|---------|----------|---------|
| **aion-flow-v2** | Vercel | Admin CMS — content management for all tenants |
| **kolokotronis-website** | Cloudflare Workers | Public tenant site — SSR, SEO, contact form |
| **Future tenant sites** | Cloudflare Workers | Each tenant gets its own Worker instance |

**Why dual deployment:**
- **Vercel** excels for the CMS backend: serverless functions, automatic previews, and git-based deployments for the admin panel.
- **Cloudflare Workers** excels for tenant-facing sites: global edge distribution, near-zero cold starts, and cost-effective SSR at scale.
- Each tenant site is a **separate Worker** deployed independently — no single point of failure across tenants.

### Vercel SPA Rewrites (`vercel.json`)

For SPA fallback on Vercel deployments:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures all routes (including deep links like `/services/cognitive-therapy`) are handled by the client-side router rather than returning a 404 from Vercel's static file server.

### Cloudflare Wrangler Configuration (`wrangler.toml`)

```toml
name = "kolokotronis-website"
main = "dist/server/index.mjs"
assets = { directory = "dist/client", binding = "ASSETS" }
account_id = "94b5edc5fc91ada10fe8a213cca836cb"
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2025-04-01"

[env.production]
vars = { NODE_ENV = "production" }

[env.preview]
vars = { NODE_ENV = "preview" }
```

Key points:
- `nodejs_compat` is required for TanStack Start / Nitro SSR runtime compatibility.
- `main` points to the Nitro build output — this is the worker entry point compiled by `@lovable.dev/vite-tanstack-config`.
- `assets` serves the client-side build from `dist/client`.

## External Project Connections — Env Vars Reference

These environment variables bridge the CMS to external projects and services:

| Variable | Used By | Purpose |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | All projects | Supabase project connection |
| `VITE_SUPABASE_ANON_KEY` | All projects | Public anon key for client queries |
| `SUPABASE_SERVICE_ROLE_KEY` | aion-flow-v2, aion-cms-main | Admin DB operations (server-side only) |
| `TENANT_ID` | aion-flow-v2 | Default tenant UUID for seed data |
| `VITE_ENABLE_MEDIA_MANAGER` | aion-flow-v2 | Feature flag for media manager UI |
| `CLOUDFLARE_API_TOKEN` | CI/CD | Deploy Workers via GitHub Actions |
| `CLOUDFLARE_ACCOUNT_ID` | CI/CD | Worker deployment target |

> **Security:** Never expose `SUPABASE_SERVICE_ROLE_KEY` or `CLOUDFLARE_API_TOKEN` in client bundles or public repos.

## Artist Module — Planned Deployment

### New Database Tables

| Table | Purpose |
|-------|---------|
| `artist_portfolio` | Portfolio works, images, descriptions per tenant |
| `artist_events` | Exhibitions, openings, performances |
| `artist_media` | Extended media with dimensions, prices, editions |

### Media Extension

The existing `media` table will gain an `artist_meta` JSONB column for:
- Dimensions (width × height × depth)
- Medium / technique
- Edition number and total
- Price (with currency)
- Availability status (available / sold / on-loan)

### Feature Flag Rollout

1. **Phase 1** — Add `artist_module` to `tenant_features` schema + migration
2. **Phase 2** — Feature toggle UI in CMS → Settings → Features
3. **Phase 3** — Artist portfolio CRUD (developer + admin only initially)
4. **Phase 4** — Public-facing portfolio pages on tenant Worker sites
5. **Phase 5** — Analytics: views, inquiries per artwork

### Deployment Checklist (Artist Module)

- [ ] Run Supabase migration for new tables + `artist_meta` column
- [ ] Deploy CMS changes to Vercel (aion-flow-v2)
- [ ] Deploy tenant site changes to Cloudflare Workers (kolokotronis-website)
- [ ] Enable feature flag for pilot tenant(s)
- [ ] Verify artist CRUD in CMS
- [ ] Verify public portfolio rendering on Worker
- [ ] Update this document with final table schemas
