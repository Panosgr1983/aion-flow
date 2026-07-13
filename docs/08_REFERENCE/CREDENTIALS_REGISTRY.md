# Credentials Registry

**Security classification:** References only — no secrets stored here.
**Secrets are stored in:** Vercel Environment Variables, Cloudflare Worker Secrets, Supabase Dashboard.

---

## Shared Supabase

| Field | Value (reference) | Storage Location |
|-------|-------------------|-----------------|
| **URL** | `https://qhbgptlklsavezxpksao.supabase.co` | Public (not a secret) |
| **Anon key** | Publishable key (safe in client bundle) | `VITE_SUPABASE_ANON_KEY` in Vercel |
| **Service role key** | 🔴 **ROTATED** — was in git history | `SUPABASE_SERVICE_ROLE_KEY` in Vercel |
| **DB password** | 🔴 **ROTATED** — was in git history | Supabase Dashboard → Database Settings |
| **Project ref** | `qhbgptlklsavezxpksao` | Supabase Dashboard |

## Vercel Deployments

| Project | Env Vars Set | Last Rotation |
|---------|-------------|---------------|
| aion-flow-v2 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `CONTACT_EMAIL` | TBD |
| ktima-kareli-site | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | TBD |

## Cloudflare Workers

| Project | Secrets Set | Last Rotation |
|---------|------------|---------------|
| kolokotronis-website | Supabase keys, `CONTACT_EMAIL` | TBD |

## Tenant Credentials (Non-Secret)

| Tenant | User Email | Role | Storage |
|--------|-----------|------|---------|
| Kolokotronis | `admin@kolokotronis.gr` | Admin | AION Flow CMS |
| Ktima Kareli | `client@ktimakareli.gr` | Admin | AION Flow CMS |
| Super Admin | `info@aionweb.gr` | Super Admin | AION Flow CMS |
| Super Admin | `choliasmenos.panos@gmail.com` | Super Admin | AION Flow CMS |

---

## Security History

| Date | Action | Reason |
|------|--------|--------|
| 2026-07-12 | 🔴 Service role key exposed in git | Moved to Vercel env vars. Key should be rotated in Supabase Dashboard. |
| 2026-07-12 | 🔴 DB password exposed in git | Moved to Supabase Dashboard only. Password should be rotated. |

## Rotation Instructions

1. **Supabase service_role key:** Supabase Dashboard → Settings → API → `service_role` key → Regenerate
2. **DB password:** Supabase Dashboard → Database → Connection string → Reset password
3. **Update Vercel env vars** with new keys after rotation
4. **Update Cloudflare Worker secrets** if applicable
5. **Verify** all services (aion-flow-v2, kolokotronis, ktima-kareli) still connect

---

**Next scheduled rotation:** 2026-10-01
