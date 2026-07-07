# AION — Permissions Matrix

> **Πλήρης πίνακας δικαιωμάτων ανά ρόλο και module.**
> Τελευταία ενημέρωση: 2026-07-06

---

## 1. Permission Matrix

| Module | Super Admin | Tenant Admin | Editor | Sales | Viewer |
|--------|-------------|-------------|--------|-------|--------|
| **Platform Overview** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Tenants (all)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Usage Dashboard** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **System Health** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Observability** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Users** | ✅ All | ✅ Own tenant | ❌ | ❌ | ❌ |
| **Backup** | ✅ All | ✅ Own tenant | ❌ | ❌ | ❌ |
| **CMS — Services** | ✅ All | ✅ | ✅ Edit | ❌ | ✅ Read |
| **CMS — Blog** | ✅ All | ✅ | ✅ Edit | ❌ | ✅ Read |
| **CMS — Products** | ✅ All | ✅ | ✅ Edit | ❌ | ✅ Read |
| **CMS — Pages** | ✅ All | ✅ | ✅ Edit | ❌ | ✅ Read |
| **CMS — Media** | ✅ All | ✅ | ✅ Upload | ❌ | ✅ Read |
| **CMS — Testimonials** | ✅ All | ✅ | ✅ Edit | ❌ | ✅ Read |
| **CMS — Core Values** | ✅ All | ✅ | ✅ Edit | ❌ | ✅ Read |
| **CMS — About** | ✅ All | ✅ | ✅ Edit | ❌ | ✅ Read |
| **CMS — CTA** | ✅ All | ✅ | ✅ Edit | ❌ | ✅ Read |
| **Site Settings** | ✅ All | ✅ | ✅ | ❌ | ❌ |
| **Analytics** | ✅ All | ✅ Own | ✅ Own | ❌ | ✅ Read |
| **Audit Dashboard** | ✅ All | ✅ Own | ✅ Own | ❌ | ❌ |
| **CRM — Inbox** | ✅ * | ✅ * | ❌ | ✅ * | ❌ |
| **CRM — Pipeline** | ✅ * | ✅ * | ❌ | ✅ * | ❌ |
| **CRM — Tasks** | ✅ * | ✅ * | ❌ | ✅ * | ❌ |
| **CRM — Customers** | ✅ * | ✅ * | ❌ | ✅ * | ❌ |
| **Email Workspace** | ✅ * | ✅ * | ❌ | ✅ * | ❌ |

> ✅ All = Όλοι οι tenants (μέσω Project Switcher)  
> ✅ Own = Μόνο ο δικός του tenant  
> ✅ * = Μέσω feature flags (tenant_features), όχι από permission matrix  
> ✅ Edit = CRUD full access  
> ✅ Upload = Μπορεί να ανεβάσει media  
> ✅ Read = Read-only

---

## 2. Πως λειτουργεί

### 2.1 Ιεραρχία ελέγχου

```
is_super_admin = true
  → bypass ΟΛΩΝ των ελέγχων (ακόμα και feature flags)
  → Πλήρης πρόσβαση σε όλους τους tenants

is_super_admin = false
  → tenant.status = suspended/cancelled? → BLOCK
  → featureMap[feature] = false? → BLOCK (CMS, CRM, κλπ)
  → hasPermission(role, action)? → BLOCK (CRUD rights)
  → OK
```

### 2.2 Permission matrix (code)

```typescript
// src/lib/permissions.ts
const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  admin:  ['cms.edit', 'cms.view', 'settings.all', 'users.manage'],
  editor: ['cms.edit', 'cms.view', 'settings.all'],
  sales:  [],
  viewer: ['cms.view'],
};
```

### 2.3 Platform capabilities (super admin only)

```typescript
const PLATFORM_CAPS: Permission[] = [
  'platform.overview', 'platform.analytics', 'platform.tenants',
  'platform.usage', 'platform.observability', 'platform.system',
  'platform.backups',
  'crm.inbox', 'crm.pipeline', 'crm.tasks',
  'history.view', 'history.restore',
];
```

Αυτά τα permissions ΔΕΝ δίνονται ποτέ σε μη-SA, ακόμα κι αν ο ρόλος
τους τα περιλαμβάνει. Η `can()` συνάρτηση τα μπλοκάρει στο επίπεδο
capability guard.

### 2.4 Feature flags (tenant_features)

Για τα CRM modules, η πρόσβαση ελέγχεται από το `tenant_features`
table (feature flags), όχι από το permission matrix. Ο sales ρόλος
έχει άδειο permission matrix — η πρόσβαση στα CRM modules γίνεται
μέσω FEATURE_MODULES + tenant features.

```typescript
// src/lib/access.ts
export const FEATURE_MODULES: Record<string, TenantFeature> = {
  inbox: 'inbox',
  pipeline: 'pipeline',
  emailWorkspace: 'email_workspace',
  // ...
};
```

### 2.5 Super Admin auto-assign

```typescript
const KNOWN_SUPER_ADMIN_EMAILS = [
  'info@aionweb.gr',
  'choliasmenos.panos@gmail.com',
];
```

Αυτά τα emails αναγνωρίζονται αυτόματα ως super admin στο
`useTenant()` hook, χωρίς JWT claims ή DB lookup.

---

## 3. Tenant ID system

Όλα τα components χρησιμοποιούν `useTenant().effectiveTenantId`:

| user type | `tenantId` | `selectedTenantId` | `effectiveTenantId` |
|-----------|-----------|-------------------|-------------------|
| Super Admin | `selectedTenantId \|\| null` | από Project Switcher | `selectedTenantId` |
| Tenant Admin | από JWT/profile | null | `tenant_id` |

---

## 4. Platform vs Workspace

| | AION Platform | AION Workspace |
|---------------|--------------|----------------|
| Ποιος βλέπει | Super Admin | Tenant users |
| Dashboard | Platform Overview | Tenant Overview |
| CMS | Όλοι οι tenants (Project Switcher) | Μόνο ο δικός του |
| CRM | Feature flag (all tenants) | Feature flag |
| Usage | Πλήρη | ❌ |
| System | Debug cockpit | ❌ |
| Settings | Platform + tenant | Μόνο tenant |
