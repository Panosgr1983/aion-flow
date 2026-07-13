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
  - platform-rule
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

## Scope
**Status:** Standard — platform-wide  
**Validated contexts:** Retreat, Portfolio, Core CMS  
**Next validation target:** CRM, E-commerce (blocked — see Known Issues)

---

## Implementation

```typescript
// useTenant() hook resolves:
// SA  → selectedTenantId (from TenantContext / Project Switcher)
// μη-SA → tenantId (from JWT claims or profiles table)
const { effectiveTenantId } = useTenant();
```

---

## Platform Rules (Mandatory)

1. **Tenant business components use ONLY `effectiveTenantId`.** No exceptions. No runtime fallback to default/mock tenant UUID.

2. **No query to a tenant-owned table without tenant filter or verified RLS.** Every `supabase.from()` must include `.eq('tenant_id', ...)` or go through `withTenant()`.

3. **No runtime fallback to default or mock tenant UUID.** The `mockTenantId` is allowed only in demo mode, migrations, fixtures, and tests — never in production queries.

4. **Super Admin without selected tenant does NOT load tenant data.** The tenant selector must appear before any tenant-scoped query runs.

5. **Feature flag is NOT enabled unless the module has passed tenant isolation audit.** See `TENANT_ISOLATION_CHECKLIST.md`.

6. **History, telemetry, and storage records use the SAME tenant context as the primary action.** Never `mockTenantId` or hardcoded defaults.

---

## Query Patterns

### Safe (verified)

```typescript
// READ — Portfolio/Retreat panels
const { data } = await withTenant(supabase.from('experiences').select('*'), effectiveTenantId);

// READ — CMS helpers (withTenant reads localStorage)
const { data } = await withTenant(supabase.from('services').select('*') as any);

// CREATE — includes tenant_id in payload
await supabase.from('experiences').insert({ tenant_id: effectiveTenantId, ... });

// UPDATE/DELETE — scoped by tenant_id
await supabase.from('experiences').update({...}).eq('tenant_id', effectiveTenantId);
```

### Unsafe (blocked from production)

```typescript
// ❌ No tenant filter
supabase.from('contact_conversations').select('*');

// ❌ Hardcoded mock tenant
supabase.from('services').insert({ tenant_id: mockTenantId, ... });

// ❌ withTenant() without 2nd arg for non-SA (reads localStorage only)
withTenant(supabase.from('services').select('*'));
// → SAFE for SA, but BROKEN for non-SA users
```

---

## Tenant Isolation Audit (2026-07-12)

| Module | Queries Audited | Status | Notes |
|--------|----------------|--------|-------|
| Portfolio (8 panels) | 45+ | ✅ SAFE | All use `effectiveTenantId` |
| Retreat (5 panels) | 30+ | ✅ SAFE | All use `effectiveTenantId` |
| CMS helpers (6) | 12 | ✅ SAFE | `withTenant()` applied |
| History logging | 4 | ✅ FIXED | No more `mockTenantId` |
| CRM helpers | ~20 | 🔴 BLOCKED | No tenant filter — see Known Issues |
| E-commerce helpers | ~15 | 🔴 BLOCKED | No tenant filter — demo only |

---

## Activation Blocker

CRM and E-commerce modules are BLOCKED from tenant rollout until they pass full tenant isolation audit. See:
- `docs/01_PLATFORM/TECH_DEBT.md` (#20, #21)
- `docs/01_PLATFORM/KNOWN_ISSUES.md` (#16, #17)
- `docs/04_METHODS/Core/TENANT_ISOLATION_CHECKLIST.md`

---

## Validation Matrix

Every new module MUST pass this matrix before feature flag activation:

| Test | Must Pass |
|------|-----------|
| All SELECT queries scoped by tenant_id | ✅ |
| All INSERT rows include tenant_id | ✅ |
| UPDATE/DELETE scoped by tenant_id | ✅ |
| History uses effectiveTenantId | ✅ |
| Telemetry uses effectiveTenantId | ✅ |
| Storage paths tenant-prefixed | ✅ |
| Super Admin → Tenant A data only | ✅ |
| Super Admin → Tenant B data only | ✅ |
| Tenant user → own data only | ✅ |
| Direct URL test (no cross-tenant leak) | ✅ |
| Empty tenant (no data) | ✅ |
| RLS verified | ✅ |

---

## Reusable
Yes — platform-wide standard.

## Used By
All panels across Portfolio, Retreat, CMS, CRM modules.
