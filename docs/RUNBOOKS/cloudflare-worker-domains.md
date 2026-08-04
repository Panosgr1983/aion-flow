# Runbook: Cloudflare Worker Custom Domains

**Purpose:** Connect custom domains (root + www) to an AION Flow Cloudflare Worker.  
**Applies to:** kolokotronis (`nikolaskolokotronis.gr`), future tenants.

---

## Architecture

```
Client Domain (e.g. nikolaskolokotronis.gr)
    └── Cloudflare zone (DNS)
          ├── A/AAAA → Cloudflare proxy
          └── Worker route:
                - https://nikolaskolokotronis.gr/*    → kolokotronis-website
                - https://www.nikolaskolokotronis.gr/* → kolokotronis-website
```

## Steps

1. **Add domain to Cloudflare zone**
   - Cloudflare dashboard → Add site → follow DNS setup
   - Update nameservers at domain registrar

2. **Create custom domain on Worker**
   ```
   npx wrangler domains add nikolaskolokotronis.gr
   npx wrangler domains add www.nikolaskolokotronis.gr
   ```
   (or via dashboard: Workers → kolokotronis-website → Settings → Domains)

3. **Verify both resolve**
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://<domain>          # expect 200
   curl -s -o /dev/null -w "%{http_code}\n" https://www.<domain>     # expect 200
   ```

4. **Verify content served**
   ```bash
   curl -s https://<domain> | grep -o "<title>[^<]*</title>"
   ```

## Incident History

- **2026-08-04:** `www.nikolaskolokotronis.gr` served HTTP 523 (origin unreachable). Worker route for `www` missing/stale. Fixed by adding `www` custom domain on the worker. See `INCIDENTS/2026-08-04-cloudflare-www-523.md`.

## Common Issues

| Issue | Fix |
|-------|-----|
| HTTP 523 | Origin unreachable — check worker route for that hostname |
| HTTP 404 on www | Route exists but worker can't serve — verify `main`/`assets` config |
| SSL error | Cloudflare SSL mode: Full (strict) |
| Subdomain not proxied | DNS record orange-cloud = proxy ON |

## Note on GA4 / Search Console

GA4 stream and Search Console property must use the **final domain** (not workers.dev) so analytics/indexing track the canonical host.
