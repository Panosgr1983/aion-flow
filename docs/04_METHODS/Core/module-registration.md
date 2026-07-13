---
id: method.core.module-registration
title: Module Registry Self-Registration
domain: methods
type: method
status: Standard
maturity: standard
source_of_truth: true
owner: AION Engineering
tags:
  - module-registry
  - architecture
related:
  - platform.architecture
  - method.core.tenant-resolution
used_by:
  - portfolio
  - retreat
last_reviewed: 2026-07-12
review_after: 2026-10-12
---

# Method: Module Registry Self-Registration

## Problem
Adding a new module required manual changes to Dashboard.tsx (routes), AdminSidebar.tsx (nav items), access.ts (feature flags), and types/supabase.ts (feature type). Doesn't scale.

## Context
Applied in Portfolio and Retreat modules. Platform-wide standard.

## Implementation

```typescript
// 1. Create manifest.ts
ModuleRegistry.register({
  name: 'portfolio',
  featureFlag: 'portfolio_module',
  routes: [
    { path: '/dashboard/portfolio/films', element: FilmographyCRUD, ... },
  ],
  sidebar: {
    label: 'Χαρτοφυλάκιο',
    icon: 'Briefcase',
    items: [
      { path: '/dashboard/portfolio/films', label: 'Ταινίες', icon: 'Film' },
    ],
  },
});

// 2. Import manifest (triggers self-registration)
import '../modules/portfolio/manifest';

// 3. Dashboard.tsx reads routes from registry
{ModuleRegistry.getRoutes(tenant.featureMap, tenant.isSuperAdmin).map(...)}

// 4. AdminSidebar.tsx reads sidebar from registry
{ModuleRegistry.getEnabled(tenant.featureMap, tenant.isSuperAdmin).map(...)}
```

## Required Setup

| File | Change |
|------|--------|
| `src/types/supabase.ts` | Add feature flag to `TenantFeature` type |
| `src/lib/access.ts` | Add path → feature mapping |
| `src/lib/useTenant.ts` | Add flag to SA feature map |
| `src/pages/Dashboard.tsx` | Import manifest |
| `src/components/admin/AdminSidebar.tsx` | Import manifest + add icons |

## Reusable
Yes — standard for ALL new modules.

## Used By
Portfolio Module, Retreat Module.
