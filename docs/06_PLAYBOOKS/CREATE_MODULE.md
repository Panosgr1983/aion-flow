# Playbook: Create Module

**Part of AKES v1 — 06_PLAYBOOKS**

---

## Overview

Creating a new vertical module (e.g., Medical, Hotel, Restaurant).

## Sequence

### Step 1: Analysis
- [ ] Review existing modules (Portfolio, Retreat) for reusable patterns
- [ ] Check `07_REUSE/` for reusable components
- [ ] Check `04_METHODS/` for existing methods
- [ ] Document content mapping from client's existing site

### Step 2: Architecture
- [ ] Define module name, feature flag, permissions
- [ ] Define DB tables (additive only, no destructive changes)
- [ ] Create migration SQL
- [ ] Register in `src/types/supabase.ts` (TenantFeature)
- [ ] Register in `src/lib/access.ts` (FEATURE_MODULES)
- [ ] Register in `src/lib/useTenant.ts` (SA feature map)

### Step 3: Implementation
- [ ] Create `src/modules/{name}/manifest.ts`
- [ ] Create `src/modules/{name}/types/{name}.ts`
- [ ] Create CRUD panels (reuse CRUD pattern from `method.core.crud-pattern`)
- [ ] Import manifest in `Dashboard.tsx` + `AdminSidebar.tsx`
- [ ] Add icons to `AdminSidebar.tsx` iconMap
- [ ] Build (zero errors)

### Step 4: Tenant Isolation — MANDATORY
- [ ] Run `TENANT_ISOLATION_CHECKLIST.md` against ALL queries
- [ ] Every SELECT scoped by `effectiveTenantId`
- [ ] Every INSERT includes `tenant_id`
- [ ] Every UPDATE/DELETE scoped by `.eq('tenant_id', ...)`
- [ ] History logging uses `effectiveTenantId`
- [ ] Telemetry uses correct tenant context
- [ ] Validation matrix passed (SA → Tenant A, SA → Tenant B, Tenant user)

**Module is BLOCKED from feature flag activation until this step passes.**

### Step 5: Documentation
- [ ] Create `03_MODULES/{name}/README.md`
- [ ] Create `03_MODULES/{name}/METHODS.md`
- [ ] Create `03_MODULES/{name}/KNOWN_ISSUES.md`
- [ ] Update `00_INDEX/CURRENT_STATE.md`
- [ ] Update `01_PLATFORM/ROADMAP.md`
- [ ] Update `01_PLATFORM/FEATURES.md`
- [ ] Create tenant folder in `02_TENANTS/{slug}/` (if new tenant)

### Step 6: Feature Flag Activation
- [ ] All steps above complete
- [ ] Tenant isolation verified
- [ ] Build: zero errors
- [ ] Approval received
- [ ] Enable feature flag for tenant
- [ ] Deploy

---

## Golden Rules Applied

- **Generalize When Proven** — don't create module if an existing one can be adapted
- **No Docs, No Done** — every step requires documentation
- **Tenant isolation before feature flag** — never activate unvalidated module
