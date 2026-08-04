# Runbook: Google Search Console Setup

**Purpose:** Get a tenant site indexed by Google.  
**Applies to:** Any AION Flow tenant site.

---

## Prerequisites

- Site deployed on final domain
- Sitemap exists at `https://<domain>/sitemap.xml`

## Steps

1. **Add property**
   - https://search.google.com/search-console
   - Add property → **Domain** type → enter `https://<domain>`

2. **Verify (DNS)**
   - Search Console provides a TXT record
   - Add it in Cloudflare DNS (zone of the domain)
   - Wait for propagation (minutes) → Search Console auto-verifies

3. **Submit sitemap**
   - Sitemaps → `https://<domain>/sitemap.xml` → Submit
   - Verify status: "Success"

4. **Request indexing**
   - URL Inspection → enter `/` → Request Indexing
   - Repeat for key pages: `/services`, `/contact`, `/blog`, etc.
   - Note: Google queues these — indexing takes hours to days

5. **Verify canonical domain choice**
   - Confirm canonical URLs point to the chosen domain (see SEO_OPERATIONS.md)

## Expected Timeline

| Event | Time |
|-------|------|
| Priority crawl queue | Immediate |
| First indexing | Hours to days |
| Full sitemap crawl | Days to weeks |
| Rankings stabilize | 1-3 months |

## Common Issues

| Issue | Fix |
|-------|-----|
| Property not verified | Check DNS TXT record in Cloudflare |
| Sitemap errors | Validate XML, confirm URL returns 200 |
| Duplicate content | Check canonical tags (workers.dev vs domain) |
