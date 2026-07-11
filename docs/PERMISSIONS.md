# AION — Permissions & Access Control

> **Τελευταία ενημέρωση:** 2026-07-06
> Δες επίσης: `docs/MASTER/PERMISSIONS_MATRIX.md` για τον πλήρη πίνακα
> δικαιωμάτων ανά module/ρόλο.

## 1. Επισκόπηση Συστήματος

Το AION έχει **τέσσερα επίπεδα ασφαλείας** που εφαρμόζονται πάντα με αυτή
τη σειρά:

```
1. Capability Guard      → can(permission, role, isSuperAdmin)
2. Sidebar Visibility    → canAccessModule() + FEATURE_MODULES
3. Route Protection      → PlatformGuard (platform routes)
4. Database RLS          → withTenant() + is_super_admin bypass
```

## 2. Χρήστες & Λογαριασμοί

### 2.1 Τύποι Λογαριασμών

| Τύπος | Περιγραφή | Πρόσβαση |
|-------|-----------|----------|
| **Super Admin** | Ιδιοκτήτες πλατφόρμας | Όλοι οι tenants, Platform tools |
| **Tenant Admin** | Διαχειριστής πελάτη | Μόνο ο δικός του tenant |
| **Tenant Editor** | Συντάκτης περιεχομένου | CMS μόνο (όχι ρυθμίσεις) |
| **Tenant Sales** | Πωλήσεις | CRM, Pipeline |
| **Tenant Viewer** | Μόνο ανάγνωση | CMS view-only |

### 2.2 Super Admin Auto-Assign

Ορισμένα emails αναγνωρίζονται αυτόματα ως **Super Admin** χωρίς να
χρειάζεται JWT hook ή DB profile:

```typescript
// src/lib/useTenant.ts
const KNOWN_SUPER_ADMIN_EMAILS = [
  'info@aionweb.gr',        // AION Web — ιδιοκτήτης
  'choliasmenos.panos@gmail.com',  // AION Web — developer
];
```

- Με το login, το `useTenant()` hook ανιχνεύει το email και θέτει
  `isSuperAdmin: true` **άμεσα** (χωρίς αναμονή JWT ή DB).
- Παράλληλα ενημερώνει το `profiles.is_super_admin` στη DB για
  persistence.
- ΔΕΝ καλείται `supabase.auth.refreshSession()` (προκαλούσε sign-out).
- Κάθε νέο login καθαρίζει το `localStorage.aion_selected_tenant` ώστε
  ο SA να βλέπει πάντα την οθόνη επιλογής tenant πρώτα.

### 2.3 Three-Tier Tenant ID System

```typescript
// src/lib/useTenant.ts — TenantState interface
interface TenantState {
  isSuperAdmin: boolean;
  tenantId: string | null;           // ID του tenant του χρήστη
  effectiveTenantId: string | null;  // ΤΙ να χρησιμοποιούν τα components
  featureMap: Record<string, boolean> | null;
  tenantStatus: string | null;
  loading: boolean;
}
```

| Πεδίο | SA | μη-SA |
|-------|----|-------|
| `tenantId` | `selectedTenantId \|\| null` | `tenant_id` (από JWT/profile) |
| `effectiveTenantId` | `selectedTenantId` | `tenant_id \|\| jwtTenantId \|\| null` |

**Κανόνας:** Όλα τα components χρησιμοποιούν **`tenant.effectiveTenantId`**
για φιλτράρισμα, uploads και queries. Ποτέ απευθείας `selectedTenantId`
από TenantContext.

### 2.4 Tenant Selection (Super Admin)

- **Login:** `localStorage.aion_selected_tenant` καθαρίζεται → ο SA
  βλέπει την οθόνη επιλογής tenant (grid με όλους τους tenants).
- **Επιλογή:** Κλικ σε tenant → `setSelectedTenantId(id)` →
  `effectiveTenantId` = id → τα components φορτώνουν τα δεδομένα του.
- **Refresh:** Η επιλογή persistei στο localStorage → μετά από F5,
  ο SA βλέπει το ίδιο tenant.
- **Logout/Login:** Η επιλογή καθαρίζεται → ξανά η οθόνη επιλογής.

### 2.5 Συγχρονισμός TenantContext ↔ localStorage

Κατά το login, υπάρχει race condition:
1. `TenantProvider` αρχικοποιείται με παλιά τιμή από localStorage
2. `AuthContext` SIGNED_IN event καθαρίζει το localStorage
3. Το `useTenant()` ανιχνεύει την ασυμφωνία και διορθώνει:

```typescript
// src/lib/useTenant.ts
if (selectedTenantId !== lsTenantId) {
  setSelectedTenantId(lsTenantId);
  return; // effect re-runs with corrected value
}
```

## 3. Επίπεδα Ασφαλείας

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

## 4. Platform vs Workspace

| | AION Platform (Super Admin) | AION Workspace (Tenant) |
|---|---|---|
| **Dashboard** | Platform Overview: active tenants, events today, health | Tenant Overview: content stats, CRM stats |
| **CMS** | Όλοι οι tenants (μέσω Project Switcher) | Μόνο το δικό του content |
| **CRM** | Όλοι οι tenants | Μόνο τα δικά του leads/messages |
| **Usage** | Πλήρη telemetry & churn risk | ❌ Δεν βλέπει |
| **System** | Debug cockpit | ❌ Δεν βλέπει |
| **Observability** | Platform health | ❌ Δεν βλέπει |
| **Tenants** | Project Switcher + όλοι οι tenants | ❌ Δεν βλέπει άλλους tenants |
| **Settings** | Platform + tenant settings | Μόνο tenant settings |

## 5. Πίνακας Δικαιωμάτων (Permission Matrix)

```typescript
// src/lib/permissions.ts
const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  admin:  ['cms.edit', 'cms.view', 'settings.all', 'users.manage'],
  editor: ['cms.edit', 'cms.view', 'settings.all'],
  sales:  [],
  viewer: ['cms.view'],
};
```

| Ρόλος | CMS Edit | CMS View | Settings | Users | CRM Inbox | Pipeline | History |
|-------|----------|----------|----------|-------|-----------|----------|---------|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Editor** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Sales** | ❌ | ❌ | ❌ | ❌ | ✅* | ✅* | ❌ |
| **Viewer** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

> *Sales: CRM Inbox/Pipeline πρόσβαση γίνεται μέσω `isSuperAdmin` bypass
> ή feature flags. Ο sales ρόλος έχει άδειο permission matrix — η
> πρόσβαση στα CRM modules γίνεται μέσω `FEATURE_MODULES` + tenant
> features.

## 6. Users Management

**Διαχείριση:** `Settings → Χρήστες` (super admin only)

Λειτουργίες:
- Λίστα όλων των χρηστών
- Αλλαγή role (admin/editor/sales/viewer)
- Toggle super admin
- Αντιστοίχηση σε tenant

**Self-fix (legacy):** Στο TenantOverview υπάρχει κουμπί "Ενεργοποίηση
πρόσβασης super admin" για χρήστες με email info@aionweb.gr ή
choliasmenos.panos@gmail.com. Χρησιμοποιείται μόνο αν η auto-assign
λογική στο `useTenant.ts` δεν έχει τρέξει (π.χ. πρώτο login πριν την
αναβάθμιση).

## 7. Προσθήκη Νέου Permission

1. Πρόσθεσε το permission string στο `Permission` type στο `src/lib/permissions.ts`
2. Αν είναι platform-level, πρόσθεσέ το στο `PLATFORM_CAPS[]`
3. Αν είναι business-level, πρόσθεσέ το στο αντίστοιχο role array στο `PERMISSION_MATRIX`
4. Χρησιμοποίησε `can('your.permission', role, isSuperAdmin)` για έλεγχο

## 8. Testing Permissions

Το System Health cockpit (`/dashboard/settings/system`) δείχνει live:
- JWT claims (`user_role`, `is_super_admin`)
- RLS access status
- Analytics source (live vs mock)

## 9. Artist Module (Feature-Gated)

### 9.1 Permission Entry

| Capability | admin | editor | sales | viewer | super_admin |
|------------|-------|--------|-------|--------|-------------|
| `artist_module` | ✅ | ❌ | ❌ | ❌ | ✅ (bypass) |

### 9.2 Two-Layer Gating

The artist module is gated at **two independent layers**:

1. **Database layer — `tenant_features` table**: Each tenant row has a `tenant_features.features` JSONB column. The module is only visible if `features ? 'artist_module'` resolves to `true` for that tenant.
2. **Runtime layer — `canAccess()`**: The capability check `can('artist_module', role, isSuperAdmin)` must also pass. This prevents non-admin roles from accessing the module even if the feature flag is enabled.

```typescript
// Both conditions must be true:
const featureEnabled = featureMap?.artist_module === true;
const hasPermission = can('artist_module', role, isSuperAdmin);
```

### 9.3 Tenant Industry Filter

Only tenants matching specific criteria see the artist module:

- Tenants with `industry = 'artist'` in the `tenants` table are **auto-eligible** — the module appears in their sidebar without manual flagging.
- Tenants with other industries can also be granted access by a Super Admin via the **explicit feature flag** toggle in CMS → Settings → Features.
- The sidebar `canAccessModule()` function checks both `industry` and `featureMap`:

```typescript
// src/lib/permissions.ts (conceptual)
const ARTIST_INDUSTRIES = ['artist'];
const isArtistIndustry = ARTIST_INDUSTRIES.includes(tenantIndustry);
const hasArtistFlag = featureMap?.artist_module === true;
const showArtistModule = (isArtistIndustry || hasArtistFlag) && hasPermission;
```

### 9.4 Super Admin Bypass

Super Admins **always** see the artist module regardless of:

- `tenant_features` flags
- `industry` field value
- Tenant selection

```typescript
// canAccess('artist_module') for SA returns true without DB checks
if (isSuperAdmin) return true;
```

This ensures the SA can access, preview, and debug artist features for any tenant from the Platform perspective.

### 9.5 Adding a New Feature-Gated Module

1. Add permission string to `Permission` type in `src/lib/permissions.ts`
2. Add entry to `PERMISSION_MATRIX` for desired roles
3. Add feature key to `FEATURE_MODULES` list in sidebar config
4. Use `canAccess('module_name')` in sidebar visibility logic
5. Add industry auto-eligibility logic if applicable
6. Create the feature toggle UI in CMS → Settings → Features

---

### 9.6 Portfolio Module (v1.0, frozen)

| Permission | Description | admin | editor | viewer |
|-----------|-------------|-------|--------|--------|
| `portfolio.view` | Read-only portfolio panels | ✅ | ✅ | ✅ |
| `portfolio.edit` | Create/edit/delete portfolio content | ✅ | ✅ | ❌ |

### 9.7 Retreat Module (planned v0.6)

| Permission | Description | admin | editor | viewer |
|-----------|-------------|-------|--------|--------|
| `retreat.view` | Read-only retreat panels | ✅ | ✅ | ✅ |
| `retreat.edit` | Create/edit/delete retreat content | ✅ | ✅ | ❌ |
| `retreat.bookings` | Manage booking submissions | ✅ | ❌ | ❌ |

### 9.8 Locale Module (planned v0.7)

| Permission | Description | admin | editor | viewer |
|-----------|-------------|-------|--------|--------|
| `locale.view` | View translations | ✅ | ✅ | ✅ |
| `locale.edit` | Edit translations | ✅ | ✅ | ❌ |
