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

## Reusable
Yes — platform-wide standard.

## Used By
All panels across Portfolio, Retreat, CMS, CRM modules.
