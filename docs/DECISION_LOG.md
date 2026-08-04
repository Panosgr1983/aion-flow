# Decision Log — AION Flow

**Purpose:** Short, reversible engineering decisions that do not warrant a full ADR.  
**Format:** `date | Decision | Reason | Reference`

---

| Date | Decision | Reason | Reference |
|------|----------|--------|-----------|
| 2026-07-29 | Homepage service cards always use `extractPlainText()` | Prevent TipTap JSON leakage | ADR-016 |
| 2026-07-29 | Service descriptions stored as TipTap JSON string (TEXT column) | Consistent with blog content format | ADR-016 |
| 2026-07-29 | `service_faq_visible` is a global toggle (not per-service) | Simple UX, matches client request | — |
| 2026-07-29 | Blog hero eyebrow from `blog_hero_eyebrow` setting | Client-editable, no code changes | — |
| 2026-07-29 | `ΟΜΙΛΙΕΣ & ΣΕΜΙΝΑΡΙΑ` normalized to canonical category | Fixes announcement detection (dates, back button) | — |
| 2026-07-29 | Blog/service titles free width (removed max-w-3xl) | Titles fit one line, client request | — |
| 2026-07-29 | Slugs fixed via service-role API (direct DB) | Immediate fix without full CMS migration | — |
| 2026-07-29 | GA4 Measurement ID hardcoded in `__root.tsx` (not per-tenant setting) | Single-tenant public site; revisit if multi-tenant sites | — |
| 2026-08-04 | `www.nikolaskolokotronis.gr` added as custom domain on Worker | www returned 523; route missing | INCIDENTS/2026-08-04-cloudflare-www-523.md |
| 2026-08-04 | Canonical URLs point to root domain only | Site served from both domain + workers.dev; prevents duplicate content | OPERATIONS/SEO_OPERATIONS.md |
