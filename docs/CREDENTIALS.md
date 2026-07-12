# AION Flow — Tenant Credentials

**Last Updated:** 2026-07-12
**Classification:** Internal (do not share with clients without password change)

---

## Super Admin

| Field | Value |
|-------|-------|
| **Email** | `info@aionweb.gr` |
| **Role** | Super Admin (full access to all tenants) |
| **Access** | All modules, all tenants, platform settings |
| **Tenant selector** | Sees all tenants on login |

---

## Tenant: Νικόλας Κολοκοτρώνης

| Field | Value |
|-------|-------|
| **Email** | `admin@kolokotronis.gr` |
| **Password** | (set during client onboarding) |
| **Role** | Admin |
| **Tenant ID** | (assigned) |
| **Feature flags** | `cms`, `crm` |

---

## Tenant: Κτήμα Καρέλη

| Field | Value |
|-------|-------|
| **Email** | `client@ktimakareli.gr` |
| **Password** | `ktimakareli2026` |
| **Role** | Admin |
| **Tenant ID** | `a6a0e182-2e86-4b3a-9601-b055e56a605e` |
| **Feature flags** | `cms`, `portfolio_module` (gallery), `retreat_module`, `locale_module`, `retreat_booking` |
| **Supabase project** | `qhbgptlklsavezxpksao.supabase.co` (shared) |

---

## Tenant: Διονύσης Ξανθός (Reference)

| Field | Value |
|-------|-------|
| **Supabase** | Separate instance (not in shared AION Flow) |
| **Deploy** | `https://dionisis-xanthos.vercel.app` |
| **Note** | Reference project only. Not managed via AION Flow CMS. |

---

## Shared Supabase

| Field | Value |
|-------|-------|
| **URL** | `https://qhbgptlklsavezxpksao.supabase.co` |
| **Anon key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoYmdwdGxrbHNhdmV6eHBrc2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDU2MzQsImV4cCI6MjA5OTAyMTYzNH0.1Gx-QqPJpP6ML6U2Uo-4kZZgLpsMq9SNBZ7rL6Q9B6w` |
| **Service role key** | `sb_secret_o0hY7pCNei6K0wR-qDeRxA_cbRLHQ5U` |

---

## Deployments

| Site | URL | Platform |
|------|-----|----------|
| AION Flow CMS | `https://aion-flowv2.vercel.app` | Vercel |
| Kolokotronis Website | `https://kolokotronis-website.choliasmenos-panos.workers.dev` | Cloudflare Workers |
| Dionysis Xanthos | `https://dionisis-xanthos.vercel.app` | Vercel |
| Ktima Kareli | `https://ktima-kareli-site.vercel.app` | Vercel |

---

> **Security note:** Change default passwords before giving access to clients.
> The service role key should never be exposed in client-side code.
