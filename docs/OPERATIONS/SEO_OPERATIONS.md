# SEO & Analytics Operations — Kolokotronis

**Tenant:** KOL-001  
**Domain:** `nikolaskolokotronis.gr` (root + www)  
**Updated:** 2026-08-04

---

## Google Analytics 4

| Item | Value |
|------|-------|
| Property name | `nikolaskolokotronis.gr` |
| Property ID | 548380342 |
| Stream ID | 15379022057 |
| Measurement ID | `G-R4QXRW0Y88` |
| Timezone | Greece (GMT+03:00) |
| Currency | EUR |

**Integration:** gtag script in `src/routes/__root.tsx` RootShell → every page loads GA4.

**Verification:** `grep -o "G-R4QXRW0Y88" <(curl -s https://nikolaskolokotronis.gr)` → must match.

**Note:** First data appears 24-48h after tag deployment. Use **Realtime report** for immediate verification.

---

## Google Search Console

| Item | Value |
|------|-------|
| Property type | Domain |
| Property | `nikolaskolokotronis.gr` |
| DNS verification | Cloudflare TXT record (auto) |
| Sitemap | `https://nikolaskolokotronis.gr/sitemap.xml` ✅ submitted |
| Indexing requested | `/`, `/services`, `/contact`, `/blog` |

---

## Sitemap

**File:** `public/sitemap.xml` — 25 URLs, static (manual update on new content).

| Section | URLs |
|---------|------|
| Core pages | `/`, `/about`, `/services`, `/blog`, `/books`, `/contact`, `/privacy`, `/terms` |
| Services (16) | All service detail pages |
| Blog (3) | All published articles |

**Note:** Sitemap is manual — new blog posts/services require sitemap update before deploy.

---

## Canonical URLs

Why: site is served from both `nikolaskolokotronis.gr` and `kolokotronis-website.choliasmenos-panos.workers.dev`. Canonicals prevent duplicate-content penalties.

| Page | Canonical |
|------|-----------|
| Root | `https://nikolaskolokotronis.gr/` |
| Blog post | `https://nikolaskolokotronis.gr/blog/{slug}` |
| Service | `https://nikolaskolokotronis.gr/services/{slug}` |

---

## robots.txt

**Served by:** Cloudflare Managed Content (overrides origin robots.txt).

Behavior:
- `Allow: /` for all bots (incl. Google)
- Blocks AI crawlers (GPTBot, ClaudeBot, Google-Extended, etc.)
- No `Sitemap:` directive present (managed file) — sitemap submitted directly in Search Console

To serve a custom robots.txt: disable "Managed Content / robots.txt" in Cloudflare dashboard.

---

## OG / Social Tags

| Tag | Value |
|-----|-------|
| og:site_name | Νικόλας Κολοκοτρώνης — Ψυχολόγος, Ψυχοθεραπευτής |
| og:locale | el_GR |
| og:url | Per-page canonical domain |
| twitter:card | summary |

---

## Deployment Notes

| Change | Commit (kolokotronis) |
|--------|------------------------|
| GA4 + robots + sitemap + canonicals | `cd84e26` |
| Root canonical | `1d3cf2e` |

## Related

- Runbook: GA4 setup → `RUNBOOKS/ga4-setup.md`
- Runbook: Search Console → `RUNBOOKS/search-console-setup.md`
- Runbook: Cloudflare domains → `RUNBOOKS/cloudflare-worker-domains.md`
