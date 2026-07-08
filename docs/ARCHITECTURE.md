# AION — Platform Architecture Overview

## Σύνοψη

Το AION είναι multi-tenant SaaS πλατφόρμα για ψηφιακές επιχειρήσεις.
Αποτελείται από δύο διακριτά προϊόντα στον ίδιο πυρήνα:

- **AION Platform** (Super Admin Console) — κέντρο ελέγχου του SaaS
- **AION Workspace** (Tenant Portal) — περιβάλλον εργασίας κάθε πελάτη

Τρέχει σε React (Vite) + Supabase (PostgreSQL + Auth + Storage + Edge Functions).

> **Για πλήρη κατανόηση της αρχιτεκτονικής, δες:**
> - `docs/MASTER/ARCHITECTURE_MAP.md` — high-level map με data flow
> - `docs/MASTER/PERMISSIONS_MATRIX.md` — permission matrix
> - `docs/MASTER/PROJECT_MEMORY.md` — evolution του project

## Stack

```
Frontend:    React 18.3, Vite 5.4.8, TypeScript, Tailwind CSS, TipTap
Backend:     Supabase (PostgreSQL 15+), Supabase Auth, Supabase Storage
Edge:        Supabase Edge Functions (Deno)
Auth:        Supabase Auth + Custom JWT Hook
Hosting:     Vercel (CMS), Cloudflare Workers (public sites)
Email:       SMTP (Gmail App Password), Edge Function send-contact-email
CI/CD:       Vercel Auto Deploy, GitHub Actions (backups)
```

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                    AION PLATFORM (Vite/React)                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PLATFORM LAYER (super admin only — /dashboard/platform,     │   │
│  │  /settings/usage, /settings/system, /settings/observability) │   │
│  │  Capability Guard: can('platform.*') => isSuperAdmin         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  WORKSPACE LAYER (tenant)                                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │   │
│  │  │ CMS      │ │ CRM      │ │ Pipeline │ │ Business       │  │   │
│  │  │ Editors  │ │ Inbox    │ │ Kanban   │ │ Dashboard      │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  DATA LAYER — Single Source of Truth                         │   │
│  │  analyticsHelper.getDashboardData() queries real DB tables   │   │
│  │  trackEvent() → usage_events (tenant_id auto-detected)       │   │
│  │  withTenant() → tenant-aware queries via TenantContext       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  API Layer (Supabase Client)                                │   │
│  │  RLS Policies + JWT Hook + withTenant() + capability guard  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Supabase                                        │
│  ┌─────────┐  ┌──────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │ Auth    │  │ Database │  │   Storage    │  │ Edge Functions  │   │
│  │ JWT     │  │ Postgres │  │   (S3-like)  │  │ (Deno)         │   │
│  │ Hook    │  │ + Views  │  │              │  │                │   │
│  └─────────┘  └──────────┘  └──────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Concepts

### Multi-Tenancy
- Κάθε tenant έχει δικά του settings, content, media, leads
- JWT hook injects `user_role` + `is_super_admin` στο token
- RLS policies ελέγχουν `tenant_id` σε όλα τα queries
- `withTenant()` helper εξασφαλίζει tenant filtering

### Three-Tier Tenant ID System
- **`tenantId`** — ID του tenant του χρήστη (SA: `selectedTenantId || null`, μη-SA: JWT/profile)
- **`selectedTenantId`** — Ποιο tenant διάλεξε ο SA από το Project Switcher (TenantContext)
- **`effectiveTenantId`** — ΤΙ ΠΡΕΠΕΙ ΝΑ ΧΡΗΣΙΜΟΠΟΙΟΥΝ ΟΛΑ ΤΑ COMPONENTS

### Super Admin Auto-Assign
- `KNOWN_SUPER_ADMIN_EMAILS = ['info@aionweb.gr', 'choliasmenos.panos@gmail.com']`
- Το `useTenant()` hook αναγνωρίζει αυτόματα αυτά τα emails ως SA
- Profile ενημερώνεται στη DB για persistence (χωρίς `refreshSession()`)
- `localStorage.aion_selected_tenant` καθαρίζεται σε κάθε νέο login
- Ο SA ξεκινά πάντα από την οθόνη επιλογής tenant

### Tenant Selection Flow (SA)
1. **Login** → localStorage cleared → βλέπει tenant selection grid
2. **Επιλογή tenant** → `setSelectedTenantId(id)` → `effectiveTenantId = id`
3. **Refresh** → persistence από localStorage (ίδιο tenant)
4. **Logout/Login** → cleared → ξανά selection grid

### JWT Claims
```json
{
  "role": "authenticated",
  "user_role": "admin",
  "is_super_admin": false
}
```
- `role: "authenticated"` (standard Supabase) — ΔΕΝ αλλάζεται ποτέ
- `user_role` (custom) — admin/editor/sales/viewer
- `is_super_admin` (custom) — bypass RLS για internal users

### Module Architecture
Κάθε module ακολουθεί την ίδια δομή:
```
src/
├── components/dashboard/ModuleName.tsx    → UI component
├── lib/dataHelpers.ts                     → CRUD operations
├── lib/ModuleNameContext.tsx              → State management
├── types/supabase.ts                      → Interface definitions
├── supabase/migrations/                   → SQL migrations
└── docs/                                  → Documentation
```

### Versioning
Semantic Versioning: `v<major>.<minor>.<patch>`
- **major**: Breaking changes (απαιτεί migration)
- **minor**: Νέες λειτουργίες (backward compatible)
- **patch**: Bug fixes (no schema changes)

---

## Platform vs Workspace

Το AION είναι δύο προϊόντα στον ίδιο πυρήνα:

### AION Platform (Super Admin Console)
- **Πρόσβαση**: μόνο `is_super_admin = true`
- **Route guard**: `PlatformGuard` component redirects non-super-admins
- **Sidebar section**: "⚡ Platform" — Overview, Tenants, Usage, Observability, System
- **Σκοπός**: διαχείριση ολόκληρου του SaaS (tenants, telemetry, health, events)
- **Dashboard**: Platform Overview (active tenants, events today, leads, storage, system health)

### AION Workspace (Tenant Portal)
- **Πρόσβαση**: κάθε authenticated user του tenant
- **Sidebar section**: "🏢 Επιχείρηση" — business modules (CMS, CRM, Pipeline, Site Settings)
- **Sidebar section**: "🔧 Λογαριασμός" — προφίλ, ρυθμίσεις (μόνο για super admin)
- **Σκοπός**: ο πελάτης διαχειρίζεται την επιχείρησή του
- **Ποτέ δεν βλέπει**: telemetry, usage, system debug, observability, άλλους tenants

---

## Capability Guard — `can()`

Τρία επίπεδα ασφαλείας, εφαρμόζονται πάντα με αυτή τη σειρά:

```
1. Sidebar visibility    → canAccessModule() → can() + feature flags
2. Route guard            → PlatformGuard (platform routes)
3. Database RLS           → withTenant() + is_super_admin bypass
```

### Capabilities

```
Platform-level (super admin only):
  platform.overview, platform.tenants, platform.usage,
  platform.observability, platform.system, platform.backups

Business-level (role-based):
  cms.edit, cms.view, crm.inbox, crm.pipeline, crm.tasks,
  history.view, history.restore, settings.all, users.manage
```

### Παράδειγμα

```typescript
// super admin: true (bypass)
// tenant admin: false (platform.* blocked)
can('platform.usage', userRole, isSuperAdmin)

// super admin: true
// tenant admin: true (admin role has cms.edit)
can('cms.edit', userRole, isSuperAdmin)
```

---

## Single Source of Truth

**Data Principle #1**: Κανένα production dashboard δεν διαβάζει mock data.

```
Database
├── orders, customers, products, order_items
├── usage_events, views
├── pageviews, daily_stats
↓
analyticsHelper.getDashboardData()
↓
Overview, Analytics, Usage Dashboard

Mock data επιτρέπονται ΜΟΝΟ για:
- demo mode
- local development
- empty state placeholders
- automated tests
```

---

## Telemetry System

Το AION καταγράφει 35+ event types:
- **cms.*** — ενέργειες CMS (login, page_updated, blog_published)
- **crm.*** — ενέργειες CRM (lead_created, message_sent, stage_changed)
- **platform.*** — ενέργειες συστήματος (tenant_created, backup_restored, role_changed)

```typescript
// Αυτόματο tenant_id από JWT session
trackEvent('cms.page_updated', { page_slug: 'about', fields_changed: ['content'] })

// Με override tenant_id
trackEvent('cms.login', { session_source: 'dashboard' }, { tenantId })
```

Δες [TELEMETRY.md](./TELEMETRY.md) για πλήρη αναφορά.

---

## Multi-Project Support (v0.1)

Το AION υποστηρίζει σύνδεση με εξωτερικά Supabase projects για διαχείριση πελατειακών sites που βρίσκονται σε διαφορετική βάση.

### multiProjectClient.ts
- Βρίσκεται στο `src/lib/multiProjectClient.ts`
- Δημιουργεί Supabase client για εξωτερικό project βάσει credentials
- Χρησιμοποιείται από components που διαχειρίζονται remote sites

### external_project fields (tenants table)
- `connection_url` — Supabase URL του εξωτερικού project
- `api_key` — anon/service key για το εξωτερικό project
- `worker_url` — URL του Cloudflare Worker για deployment

### Reference: kolokotronis-pshychologist-main
- Εξωτερικό project μέσω `aion_website` connection
- Το tenant site είναι deployed στο Cloudflare Workers
- Το CMS (aion-flow-v2) ελέγχει settings μέσω Supabase
- Το public site διαβάζει δεδομένα από την shared βάση

---

## Current Tenant Model (July 2026)

### Default UUID
- `00000000-0000-0000-0000-000000000001` είναι **banned** σε runtime code
- Ποτέ δεν χρησιμοποιείται ως hardcoded reference

### KNOWN_SUPER_ADMIN_EMAILS
```typescript
const KNOWN_SUPER_ADMIN_EMAILS = [
  'info@aionweb.gr',
  'choliasmenos.panos@gmail.com'
]
```

### JWT custom_access_token_hook Flow
1. User logs in → Supabase Auth triggers `custom_access_token_hook`
2. Hook injects `user_role` + `is_super_admin` στο JWT token
3. RLS policies διαβάζουν τα claims για access control

### Three-Tier Tenant ID
- `tenantId` — ID του tenant του χρήστη (από JWT/profile)
- `selectedTenantId` — επιλογή SA από Project Switcher (TenantContext, localStorage)
- `effectiveTenantId` — χρησιμοποιείται από όλα τα components

---

## Shared Supabase Model

### Project Details
- **URL:** `https://qhbgptlklsavezxpksao.supabase.co`
- Χρησιμοποιείται από aion-flow-v2 και kolokotronis-pshychologist-main
- Table isolation μέσω `tenant_id` σε κάθε πίνακα

### Anon Keys (Publishable)
- `sb_publishable_zKTp8O_IAPrvEEXs6qgO4w_d9BNqSYC` — publishable anon key
- Service role key (`sb_secret_...`) διαθέσιμη μόνο σε aion-flow-v2 `.env`

---

## Planned: Artist Module v0.1

Νέο module για καλλιτέχνες / πολιτιστικές προσωπικότητες.

### New Tables (8)
1. `artist_biographies` — βιογραφικά στοιχεία
2. `artist_filmography` — φιλμογραφία
3. `artist_television` — τηλεοπτικές εμφανίσεις
4. `artist_theatre` — θεατρικές παραστάσεις
5. `artist_timelines` — χρονολόγιο σταδιοδρομίας
6. `artist_gallery` — φωτογραφίες/έργα
7. `artist_press` — άρθρα/συνεντεύξεις
8. `artist_showreels` — βίντεο/demo reels

### Feature Flag
- `artist_module` μέσω `tenant_features` table
- Non-breaking, additive migrations only

### Reference Project
- dionisis-xanthos (Next.js, separate Supabase instance)
