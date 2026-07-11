# External Project Setup — AION Flow

## Status: Documented (v0.1)

## Vision

Πώς ένα εξωτερικό project (π.χ. Kolokotronis website, Ktima Kareli website) συνδέεται με το AION Flow CMS.

## Architecture

```
AION Flow CMS (aion-flow-v2)
  Vercel: aion-flowv2.vercel.app
  Supabase: qhbgptlklsavezxpksao.supabase.co (shared)
      │
      │ Tenant isolation via tenant_id
      │ Feature flags per tenant
      │ External project config in tenants.external_project
      │
      ▼
External Project (public site)
  Cloudflare Workers or Vercel
  Reads data from shared Supabase via anon key
  Submits forms to AION Flow tables
  Deployed independently from CMS
```

## Tenant Configuration

### tenants.external_project JSONB

```json
{
  "name": "Κτήμα Καρέλη",
  "type": "cloudflare-worker",
  "worker_url": "https://ktima-kareli.gr",
  "supabase_url": "https://qhbgptlklsavezxpksao.supabase.co",
  "supabase_anon_key": "sb_publishable_...",
  "notes": "Wellness retreat site. React SPA → Cloudflare Workers."
}
```

### Feature Flags

| Tenant | cms | crm | portfolio_module | locale_module | retreat_module | retreat_booking |
|--------|-----|-----|-----------------|---------------|----------------|-----------------|
| Kolokotronis | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ktima Kareli | ✅ | ❌ | ✅ (gallery) | ✅ | ✅ | ✅ |
| Xanthos (ref) | — | — | (own Supabase) | — | — | — |

## Connection Patterns

### Pattern A: Shared Supabase (recommended)

Το εξωτερικό project χρησιμοποιεί το ίδιο Supabase instance με το AION Flow CMS.

```
CMS writes → shared Supabase → public site reads
```

**Κατάλληλο για:** Kolokotronis, Ktima Kareli, και κάθε νέο tenant.

**Πλεονεκτήματα:**
- Μία βάση δεδομένων, zero sync overhead
- RLS policies προστατεύουν τα δεδομένα
- Άμεση εμφάνιση αλλαγών (no cache invalidation)

**Ρύθμιση στο public site:**
```typescript
// supabase client for public site
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY  // Publishable key
);
```

### Pattern B: Separate Supabase

Το εξωτερικό project έχει δικό του Supabase instance.

```
CMS writes → shared Supabase
                  │ (sync mechanism, if any)
                  ▼
Public site reads → separate Supabase
```

**Κατάλληλο για:** Όταν ο πελάτης απαιτεί πλήρη απομόνωση δεδομένων.

**Πλεονεκτήματα:** Πλήρης απομόνωση.
**Μειονεκτήματα:** Απαιτεί sync mechanism, πιο σύνθετο deployment.

## Tenant Setup Steps

```
1. Create tenant in AION Flow CMS
   supabase.from('tenants').insert({ name, slug, industry, ... })

2. Create user with tenant_id
   supabase.from('profiles').insert({ email, role: 'admin', tenant_id })

3. Enable feature flags
   supabase.from('tenant_features').insert([
     { tenant_id, feature: 'cms', enabled: true },
     { tenant_id, feature: 'retreat_module', enabled: true },
     ...
   ])

4. Configure external project
   supabase.from('tenants').update({
     external_project: { type, worker_url, ... }
   }).eq('id', tenantId)

5. Set content in CMS panels
   SiteSettings, Branding, BusinessInfo, etc.

6. Deploy public site
   Cloudflare Workers or Vercel
```

## Deployment Targets

| Target | When | Example |
|--------|------|---------|
| Cloudflare Workers | SSR needed, custom domain | Kolokotronis (TanStack Start) |
| Vercel | SPA/static, Vercel domain | Dionysis Xanthos (Next.js) |
| Netlify | Static site | Portfolio (Vite SPA) |

## RLS for External Projects

```sql
-- Public read for published content
CREATE POLICY "public_read_published" ON services
  FOR SELECT USING (status = 'published');

-- Public insert for booking/contact forms
CREATE POLICY "public_insert_booking" ON booking_submissions
  FOR INSERT WITH CHECK (true);
```

## Environment Variables (External Project)

```
VITE_SUPABASE_URL=https://qhbgptlklsavezxpksao.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_TENANT_ID=<tenant-uuid>
VITE_SITE_URL=https://ktima-kareli.gr
```

## Current External Projects

| Project | Type | Supabase | Deploy | Status |
|---------|------|----------|--------|--------|
| Kolokotronis Website | TanStack Start SSR | Shared | Cloudflare Workers | ✅ Live |
| Dionysis Xanthos (ref) | Next.js SSR | Separate | Vercel | ✅ Reference |
| Ktima Kareli | React SPA | Shared | TBD | 🔜 Planned |
