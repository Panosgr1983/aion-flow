# Tenant Isolation Checklist

**Part of:** `method.core.tenant-resolution`
**Scope:** Every module, panel, or feature before feature flag activation
**Last updated:** 2026-07-12

---

## Pre-Audit

- [ ] Identify ALL tables the module reads/writes
- [ ] Identify ALL `supabase.from()` calls in the module
- [ ] Identify ALL storage paths used by the module
- [ ] Identify ALL history/telemetry events the module generates

---

## Query Audit

| Check | How to Verify |
|-------|---------------|
| [ ] All SELECT queries scoped by `tenant_id` | Grep for `supabase.from.*select` — every query must use `withTenant()` or `.eq('tenant_id', ...)` |
| [ ] All INSERT rows include `tenant_id` | Check payload — must include `tenant_id: effectiveTenantId` |
| [ ] All UPDATE queries scoped by `tenant_id` | Must include `.eq('tenant_id', effectiveTenantId)` |
| [ ] All DELETE queries scoped by `tenant_id` | Must include `.eq('tenant_id', effectiveTenantId)` |

## Context Audit

| Check | How to Verify |
|-------|---------------|
| [ ] Component uses `useTenant().effectiveTenantId` | NOT `tenantId` or hardcoded UUID |
| [ ] No `mockTenantId` in runtime code | grep for `mockTenantId` — only allowed in mockData.ts and tests |
| [ ] No hardcoded tenant UUID in business logic | grep for `00000000-...` — only allowed in migrations/fixtures |
| [ ] History logging uses same tenant context | `saveHistoryEntry` or direct `content_history` insert must pass `effectiveTenantId` |
| [ ] Telemetry uses same tenant context | `trackEvent()` must receive correct `tenantId` |

## Storage Audit

| Check | How to Verify |
|-------|---------------|
| [ ] Storage paths include tenant ID | Path format: `{tenantId}/{category}/{filename}` |
| [ ] Media records include `tenant_id` | INSERT into `media` table must include tenant_id |

## Integration Test

| Test | Expected Result |
|------|----------------|
| [ ] Super Admin selects Tenant A → sees ONLY Tenant A data | No cross-tenant leakage |
| [ ] Super Admin selects Tenant B → sees ONLY Tenant B data | Data changes correctly per tenant |
| [ ] Tenant user logs in → sees ONLY own data | No other tenant visible |
| [ ] Direct URL access to another tenant's data → blocked or empty | RLS or filter blocks it |
| [ ] Empty tenant (no data) → graceful empty state | No crash, no fallback to another tenant's data |
| [ ] Refresh → tenant context persists | localStorage sync works |
| [ ] Re-login → tenant context clears | SIGNED_IN event clears selection |

## RLS Verification

| Check | How to Verify |
|-------|---------------|
| [ ] RLS policy exists for every tenant-owned table | `SELECT * FROM pg_policies WHERE tablename = '...'` |
| [ ] RLS policy checks `tenant_id = current_tenant_id()` OR `is_super_admin()` | Policy `USING` clause must include tenant check |
| [ ] Anon key cannot read other tenants' data | Test with anon key against production |

---

## Sign-off

```
Module: _______________
Audited by: ___________
Date: _________________

[ ] All checks passed → feature flag can be enabled
[ ] Blocked — issues found: _______________
```
