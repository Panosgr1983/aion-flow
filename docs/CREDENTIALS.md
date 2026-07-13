# AION Flow — Tenant Credentials

**Last Updated:** 2026-07-13
**Classification:** Internal — metadata only. Full credentials in `CREDENTIALS.private.md` (gitignored).

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
| **Password** | `[see CREDENTIALS.private.md]` |
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
| **Anon key** | `[see CREDENTIALS.private.md]` |
| **Service role key** | `[see CREDENTIALS.private.md]` |

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
