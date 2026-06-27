# AION CMS — Architecture Overview

## Σύνοψη

Το AION είναι multi-tenant CMS πλατφόρμα με CRM, Pipeline, Email
Workspace και realtime analytics. Τρέχει σε React (Vite) + Supabase
(PostgreSQL + Auth + Storage + Edge Functions).

## Stack

```
Frontend:    React 18, Vite, TypeScript, Tailwind CSS, TipTap
Backend:     Supabase (PostgreSQL 15+), Supabase Auth, Supabase Storage
Edge:        Supabase Edge Functions (Deno)
Auth:        Supabase Auth + Custom JWT Hook
Hosting:     Vercel (CMS), Cloudflare Workers (public sites)
Email:       SMTP (Gmail App Password), Edge Function send-contact-email
CI/CD:       Vercel Auto Deploy, GitHub Actions (backups)
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AION CMS (Vite/React)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ CMS      │ │ CRM      │ │ Pipeline │ │ Workspace      │  │
│  │ Editors  │ │ Inbox    │ │ Kanban   │ │ Email          │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
│         │            │            │              │           │
│         ▼            ▼            ▼              ▼           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │           Data Helpers (dataHelpers.ts)               │   │
│  │           Media Service (media.ts)                    │   │
│  │           Storage (storage.ts)                        │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌───────────────────────────────────────────────────────┐   │
│  │           API Layer (Supabase Client)                  │   │
│  │    RLS Policies + JWT Hook + withTenant() Helper      │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                                │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Auth    │  │ Database │  │ Storage  │  │ Edge         │ │
│  │         │  │(Postgres)│  │(S3-like) │  │ Functions    │ │
│  └─────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### Multi-Tenancy
- Κάθε tenant έχει δικά του settings, content, media, leads
- JWT hook injects `user_role` + `is_super_admin` στο token
- RLS policies ελέγχουν `tenant_id` σε όλα τα queries
- `withTenant()` helper εξασφαλίζει tenant filtering

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
