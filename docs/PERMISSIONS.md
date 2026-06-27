# AION — Permissions & Access Control

## Overview

Το AION έχει τέσσερα επίπεδα ασφαλείας που εφαρμόζονται πάντα με αυτή τη
σειρά:

```
1. Capability Guard      → can(permission, role, isSuperAdmin)
2. Sidebar Visibility    → canAccessModule()
3. Route Protection      → PlatformGuard (platform routes)
4. Database RLS          → withTenant() + is_super_admin bypass
```

## Levels

### Level 1: Capability Guard (`can()`)

```typescript
can('cms.edit', userRole, isSuperAdmin)
```

Η συνάρτηση `can()` ελέγχει δύο κατηγορίες permissions:

**Platform capabilities** (super admin only):
```
platform.overview        → Platform Overview dashboard
platform.tenants         → Tenant list & management
platform.usage           → Usage & Telemetry dashboard
platform.observability   → Observability dashboard
platform.system          → System Health cockpit
platform.backups         → Backup management
```

**Business permissions** (role-based):
```
cms.edit                 → Επεξεργασία CMS περιεχομένου
cms.view                 → Προβολή CMS
crm.inbox                → Πρόσβαση στο Inbox
crm.pipeline             → Πρόσβαση στο Pipeline
crm.tasks                → Διαχείριση Tasks
history.view             → Προβολή ιστορικού αλλαγών
history.restore          → Επαναφορά από ιστορικό
settings.all             → Πρόσβαση σε ρυθμίσεις
users.manage             → Διαχείριση χρηστών
```

### Level 2: Sidebar Visibility

Το sidebar ελέγχει την ορατότητα κάθε module με βάση:
1. `can(permission, role, isSuperAdmin)` — capability check
2. `FEATURE_MODULES` — feature flag για το συγκεκριμένο tenant

Το sidebar χωρίζεται σε τρεις ενότητες:

```
⚡ Platform        → μόνο super admin (Overview, Tenants, Usage, Observability, System)
🏢 Επιχείρηση     → όλοι οι χρήστες (CMS, CRM, Pipeline, Site Settings)
🔧 Λογαριασμός    → super admin (Profile, Settings, Users, Backup)
```

### Level 3: Route Protection

Οι platform routes προστατεύονται από το `PlatformGuard` component:

```typescript
<Route path="settings/usage" element={<PlatformGuard><UsageDashboard /></PlatformGuard>} />
```

Αν ένας non-super-admin χρήστης επισκεφτεί απευθείας τη διεύθυνση,
γίνεται redirect στο `/dashboard`.

### Level 4: Database RLS

Σε επίπεδο database:
- `is_super_admin()` — bypass όλων των policies
- `current_tenant_id()` — φιλτράρισμα ανά tenant
- `withTenant()` helper — προσθέτει `.eq('tenant_id', X)` αυτόματα

```sql
CREATE POLICY "tenant_read_own_events"
  ON usage_events FOR SELECT
  USING (tenant_id = current_tenant_id());

CREATE POLICY "super_admin_all_events"
  ON usage_events FOR ALL
  USING (is_super_admin());
```

## Platform vs Workspace

| | AION Platform (Super Admin) | AION Workspace (Tenant) |
|---|---|---|
| **Dashboard** | Platform Overview: active tenants, events today, health | Tenant Overview: content stats, CRM stats |
| **CMS** | Όλοι οι tenants | Μόνο το δικό του content |
| **CRM** | Όλοι οι tenants | Μόνο τα δικά του leads/messages |
| **Usage** | Πλήρη telemetry & churn risk | ❌ Δεν βλέπει |
| **System** | Debug cockpit | ❌ Δεν βλέπει |
| **Observability** | Platform health | ❌ Δεν βλέπει |
| **Tenants** | Tenant switcher + όλοι οι tenants | ❌ Δεν βλέπει άλλους tenants |
| **Settings** | Platform + tenant settings | Μόνο tenant settings |

## Adding a New Permission

1. Πρόσθεσε το permission string στο `Permission` type στο `src/lib/permissions.ts`
2. Αν είναι platform-level, πρόσθεσέ το στο `PLATFORM_CAPS[]`
3. Αν είναι business-level, πρόσθεσέ το στο αντίστοιχο role array στο `PERMISSION_MATRIX`
4. Χρησιμοποίησε `can('your.permission', role, isSuperAdmin)` για έλεγχο

## Testing Permissions

Το System Health cockpit (`/dashboard/settings/system`) δείχνει live:
- JWT claims (`user_role`, `is_super_admin`)
- RLS access status
- Analytics source (live vs mock)
