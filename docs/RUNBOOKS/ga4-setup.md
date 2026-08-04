# Runbook: GA4 Setup for a New Tenant

**Purpose:** Create a GA4 property + Web Data Stream for a client site.  
**Applies to:** Any AION Flow tenant site (kolokotronis, kareli, etc.)

---

## Prerequisites

- Google account with access to Google Analytics
- Production site URL (final domain, not workers.dev)

## Steps

1. **Create property**
   - Google Analytics → Admin → Create Property
   - Name: use the domain (e.g. `nikolaskolokotronis.gr`)
   - Timezone: client's timezone (e.g. Greece GMT+03:00)
   - Currency: EUR

2. **Create Web Data Stream**
   - Admin → Data Streams → Add stream → Web
   - URL: `https://<client-domain>`
   - Record: Measurement ID (format `G-XXXXXXXXXX`)

3. **Add tag to site**
   - In `src/routes/__root.tsx` of the public site, update `GA4_MEASUREMENT_ID`
   - Deploy (Cloudflare Workers)

4. **Verify**
   ```bash
   curl -s https://<domain> | grep -o "G-XXXXXXXXXX"
   ```
   - Open site in browser → GA4 Realtime should show 1 active user

5. **Document**
   - Record Property ID, Stream ID, Measurement ID in `docs/OPERATIONS/SEO_OPERATIONS.md`
   - Update `CREDENTIALS_REGISTRY.md` (three-tier: describe only, no values in docs)

## Troubleshooting: "No data in last 48h"

| Check | Command |
|-------|---------|
| Tag present in HTML | `curl -s <domain> \| grep -o "gtag"` |
| Correct ID | `curl -s <domain> \| grep -o "G-[A-Z0-9]\{10\}"` |
| gtag.js loads | Open DevTools → Network → filter `googletagmanager` |
| GA4 delay | Normal: 24-48h before data appears; use Realtime for immediate check |
