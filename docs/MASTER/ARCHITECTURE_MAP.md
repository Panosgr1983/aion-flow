# AION — Architecture Map

> **Πλοήγηση στην αρχιτεκτονική.** High-level map του codebase,
> data flow, και key concepts.

---

## 1. Project Structure

```
aion-flow-v2/
├── src/
│   ├── main.tsx                     Entry point
│   ├── App.tsx                      Root: AuthProvider → TenantProvider → Routes
│   │
│   ├── components/
│   │   ├── admin/                   AdminSidebar, AdminHeader, TenantSelector
│   │   ├── dashboard/               Όλα τα editor components (Services, Blog, κλπ)
│   │   ├── inbox/                   InboxPage, ComposeWindow, ThreadView
│   │   ├── settings/                Users, Backup, Observability, Usage, System
│   │   └── shared/                  Reusable UI (buttons, cards, modals)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx          AuthProvider: user, session, signIn/signOut
│   │
│   ├── lib/
│   │   ├── supabase.ts              Supabase client + isSupabaseAvailable()
│   │   ├── TenantContext.tsx         TenantProvider: selectedTenantId, persistence
│   │   ├── useTenant.ts             useTenant() hook: tenantId, effectiveTenantId
│   │   ├── permissions.ts           Permission types + can() + hasPermission()
│   │   ├── access.ts                canAccess() + FEATURE_MODULES
│   │   ├── dataHelpers.ts           CRUD helpers per entity
│   │   ├── storage.ts               Raw storage operations (Level 1)
│   │   ├── media.ts                 Media CRUD + uploadCmsAsset (Level 2)
│   │   ├── analytics.ts             trackEvent() + telemetry
│   │   └── mockData.ts              Demo/offline data
│   │
│   ├── pages/                       LandingPage, LoginPage, SignUpPage, Dashboard
│   └── types/                       Όλοι οι TypeScript τύποι
│
├── supabase/
│   ├── migrations/                  12 SQL migrations
│   └── functions/                   3 Edge Functions (send-contact-email, crm-backup, gmail-sync)
│
├── docs/                            Documentation
│   └── MASTER/                      Single Source of Truth docs
│
└── .github/workflows/               CI/CD (backups, email sync)
```

---

## 2. Data Flow

### 2.1 Login → Dashboard

```
Login Form
  → AuthContext.signIn()
    → supabase.auth.signInWithPassword()
      → onAuthStateChange(SIGNED_IN)
        → localStorage.removeItem('aion_selected_tenant')
        → setUser(session.user)
  → navigate('/dashboard')
    → AppRoutes → ProtectedRoute → Dashboard
      → useTenant() effect runs
        → check KNOWN_SUPER_ADMIN_EMAILS
        → set isSuperAdmin / effectiveTenantId
      → TenantOverview renders
        → if isSuperAdmin && !tenantId → tenant selection grid
        → if isSuperAdmin && tenantId → tenant dashboard
        → if !isSuperAdmin → customer dashboard
```

### 2.2 Tenant Selection (Super Admin)

```
Tenant Grid (click tenant)
  → setSelectedTenantId(tenant.id)
    → TenantContext state updates
    → localStorage.setItem('aion_selected_tenant', id)
  → useTenant() effect re-runs
    → effectiveTenantId = id
  → TenantOverview re-renders
    → fetches tenant data with effectiveTenantId
```

### 2.3 CMS Data Query (component)

```
Component mounts
  → useEffect fetches data
    → uses tenant.effectiveTenantId
    → queries Supabase with .eq('tenant_id', effectiveTenantId)
    → RLS policy checks JWT claims
    → returns tenant-scoped data
```

---

## 3. Key Files & Their Roles

| File | Role | Depends On |
|------|------|-----------|
| `useTenant.ts` | Three-tier ID: tenantId, selectedTenantId, effectiveTenantId | AuthContext, TenantContext |
| `TenantContext.tsx` | selectedTenantId state + localStorage persistence | — |
| `AuthContext.tsx` | User/session state + signIn/signOut | supabase.auth |
| `permissions.ts` | Permission types + can() + hasPermission() | — |
| `access.ts` | canAccess() + FEATURE_MODULES | — |
| `dataHelpers.ts` | CRUD for all DB tables | supabase, TenantContext |
| `analytics.ts` | trackEvent() | supabase |

---

## 4. Three-Tier Tenant ID System

```
┌─────────────────────────────────────────────────────┐
│                   useTenant()                        │
│                                                       │
│  tenantId:            Ο tenant του χρήστη            │
│                       (SA: selectedTenantId || null)  │
│                       (μη-SA: JWT/profile tenant_id)  │
│                                                       │
│  selectedTenantId:    Τι διάλεξε ο SA από Project     │
│                       Switcher (TenantContext)         │
│                                                       │
│  effectiveTenantId:   ΤΙ ΠΡΕΠΕΙ ΝΑ ΧΡΗΣΙΜΟΠΟΙΗΣΟΥΝ    │
│                       ΟΛΑ ΤΑ COMPONENTS                │
│                       (SA: selectedTenantId)           │
│                       (μη-SA: tenantId)                │
└─────────────────────────────────────────────────────┘
```

---

## 5. Module Dependency Graph

```
Authentication (AuthContext)
  └── Multi-Tenant (useTenant + TenantContext)
        ├── CMS Editors (Services, Blog, Products, Pages, κλπ)
        │     └── Media (uploads via effectiveTenantId)
        ├── CRM (Inbox, Pipeline, Email)
        ├── Platform (Overview, Usage, System, Observability)
        ├── Settings (Site Settings, Users, Backups)
        └── Analytics (telemetry, churn, usage events)
```

---

## 6. Key Architecture Decisions

| ADR | Απόφαση | Link |
|-----|----------|------|
| ADR-001 | Supabase ως backend | `docs/DECISIONS.md` |
| ADR-002 | Multi-Tenant JWT + RLS | `docs/DECISIONS.md` |
| ADR-003 | Edge Functions για email | `docs/DECISIONS.md` |
| ADR-004 | Feature branches + dev env | `docs/DECISIONS.md` |
| ADR-005 | Modular architecture | `docs/DECISIONS.md` |
| ADR-006 | Industry profiles | `docs/DECISIONS.md` |
