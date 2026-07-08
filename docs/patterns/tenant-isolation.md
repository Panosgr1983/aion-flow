# Tenant Isolation — AION Flow

## Vision

Πλήρης απομόνωση δεδομένων μεταξύ tenants.

## Three-Tier Tenant ID

| Level | Source | Super Admin | Regular User |
|-------|--------|-------------|-------------|
| `tenantId` | JWT/profile | null | User's tenant |
| `selectedTenantId` | TenantContext (localStorage) | Chosen tenant | null |
| `effectiveTenantId` | Resolved by useTenant() | selectedTenantId \|\| null | tenantId |

## RLS

```sql
-- Κάθε πίνακας:
CREATE POLICY "tenant_isolation" ON <table>
  USING (tenant_id = current_tenant_id() OR is_super_admin());
```

## JWT Hook

`custom_access_token_hook` injects:
- `tenant_id` — user's tenant
- `user_role` — admin/editor/sales/viewer
- `is_super_admin` — bypass flag

## Banned UUID

`00000000-0000-0000-0000-000000000001` — never hardcoded in runtime code.
