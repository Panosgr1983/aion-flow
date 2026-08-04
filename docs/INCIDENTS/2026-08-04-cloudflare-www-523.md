# Incident Report: Cloudflare www HTTP 523 (2026-08-04)

**Status:** RESOLVED  
**Severity:** Production availability regression — www subdomain  
**Detection:** Client/owner reported `www.nikolaskolokotronis.gr` returning HTTP 523.

---

## Symptoms

- `https://www.nikolaskolokotronis.gr` → HTTP 523 (origin unreachable)
- `https://nikolaskolokotronis.gr` (root) → HTTP 200 ✅
- Workers.dev URL → HTTP 200 ✅

## Root Cause

HTTP 523 = Cloudflare could not reach the origin for that specific hostname. The `www` hostname was either:
- Not registered as a custom domain on the Worker, or
- The Worker route for `www` was missing/stale.

Root domain worked because its route existed; `www` did not.

## Timeline

| Time | Event |
|------|-------|
| 2026-08-04 | `www` returns 523 |
| Immediate | Root + workers.dev verified 200 (origin healthy) |
| Immediate | Custom domain config inspected — `www` missing/incorrect |
| Immediate | `www.nikolaskolokotronis.gr` added to Worker custom domains |
| Immediate | Both hosts verified HTTP 200 |

## Resolution

- Added `www.nikolaskolokotronis.gr` as custom domain on the `kolokotronis-website` worker.
- Verified:
  ```
  https://nikolaskolokotronis.gr        → 200
  https://www.nikolaskolokotronis.gr   → 200
  ```

## Prevention

- **Runbook:** `RUNBOOKS/cloudflare-worker-domains.md` — documents both root + www setup for every tenant.
- **Post-setup verification checklist:** both hosts must return 200 before handoff.
- GA4 stream + Search Console property use root domain; www redirects/canonicals prevent duplicate signals.

## Related

- Runbook: `docs/RUNBOOKS/cloudflare-worker-domains.md`
- SEO operations: `docs/OPERATIONS/SEO_OPERATIONS.md`
