---
id: method.core.tenant-resolution
title: Effective Tenant ID Resolution
domain: methods
type: method
status: Standard
maturity: standard
source_of_truth: true
owner: AION Engineering
tags:
  - multi-tenant
  - tenant-isolation
  - rls
related:
  - platform.architecture
  - platform.permissions
used_by:
  - kolokotronis
  - ktima-kareli
  - portfolio
  - retreat
last_reviewed: 2026-07-12
review_after: 2026-10-12
---

# Method: Effective Tenant ID Resolution

## Problem
Every component needs to know WHICH tenant's data to query. Super admins can switch tenants, regular users have a fixed tenant.

## Context
Applied across ALL AION Flow CMS panels. Used by every module.

## Implementation

```typescript
// useTenant() hook resolves:
// SA  → selectedTenantId (from TenantContext / Project Switcher)
// μη-SA → tenantId (from JWT claims or profiles table)
const { effectiveTenantId } = useTenant();
```

## Validation

- [x] Super admin without tenant → null (shows tenant selector)
- [x] Super admin with selected tenant → correct tenant ID
- [x] Tenant admin → own tenant ID
- [x] Refresh → persists (localStorage)
- [x] Re-login → clears (SIGNED_IN event)
- [x] RLS → queries filtered by tenant_id
- [x] `withTenant()` without 2nd arg → localStorage only (SA)
- [x] `withTenant()` with explicit tenantId → SAFE for all users

## Tenant Isolation Rules

1. **ALL Supabase queries must filter by tenant_id.** No exceptions.
2. **Portfolio/Retreat module panels** use `withTenant(..., effectiveTenantId)` — SAFE.
3. **CMS helpers** (site_settings, services, blog, etc.) use `withTenant()` — SAFE for SA.
4. **History logging** uses `tenantId()` (dynamic from localStorage or mock fallback).
5. **CRUD operations** include `.eq('tenant_id', effectiveTenantId)` in updates/deletes.
6. **Inserts** include `tenant_id: effectiveTenantId` in payload.

## Tenant Isolation Audit (2026-07-12)

A full audit of ALL database queries was performed. Results:
- **SAFE:** Portfolio module (45+ queries), Retreat module (30+ queries), CMS helpers (6 helpers)
- **MISSING (low risk):** CRM helpers, e-commerce helpers — not used by active tenants
- **MISSING (admin):** System panels (PlatformOverview, SystemDebug, etc.) — SA-only tools
- **FIXED:** `saveHistoryEntry` no longer uses hardcoded `mockTenantId`

## Reusable
Yes — platform-wide standard.

## Used By
All panels across Portfolio, Retreat, CMS, CRM modules.
