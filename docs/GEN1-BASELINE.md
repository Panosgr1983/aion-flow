# AION FLOW — Phase 1 Baseline Capture
## Gen1 (Legacy) Behavior for Kolokotronis Tenant — KOL-001
### Date: July 13, 2026

> This document serves as the **frozen reference baseline** for Kolokotronis.
> Before ANY shared-code change, regression tests must verify that Kolokotronis
> sees EXACTLY what is documented here. Any deviation = blocked.

---

## 1. Current Tenant Features (tenant_features table)

| Feature | Value | Source |
|---------|-------|--------|
| `cms` | `true` | Seeded in `20260713000001_seed_tenant_features.sql` |
| `crm` | `true` | Seeded in `20260713000001_seed_tenant_features.sql` |

**No other features exist for KOL-001 in the database.**

---

## 2. featureMap for admin@kolokotronis.gr (non-SA path)

When `admin@kolokotronis.gr` logs in:
1. JWT claims: NOT super admin (email not in `KNOWN_SUPER_ADMIN_EMAILS`)
2. `fetchProfile(user.id)` → returns `{ is_super_admin: false, tenant_id: '00000000-...0001', role: 'admin' }`
3. `fetchTenantFeatures(tid)` → returns `{ cms: true, crm: true }`
4. Query `tenants.status` → returns `'active'`
5. Final state:

```
{
  isSuperAdmin: false,
  tenantId: '00000000-0000-0000-0000-000000000001',
  effectiveTenantId: '00000000-0000-0000-0000-000000000001',
  featureMap: { cms: true, crm: true },
  tenantStatus: 'active',
  loading: false,
}
```

---

## 3. Sidebar Items Visible to Kolokotronis (admin@kolokotronis.gr)

### canAccessModule() logic (lines 124-138 AdminSidebar.tsx)

```
1. Check permission → if fails, return false
2. If super admin → return true (bypass)
3. Extract path segment: item.path.split('/').pop()
4. If FEATURE_MODULES[path] exists AND featureMap exists → check featureMap[feature] === true
5. If path in ['settings','users','backup'] AND not SA → return false
6. FALLBACK: return true  (FAIL-OPEN)
```

### contentItems — always visible section

| Sidebar Label | Path | FEATURE_MODULES key | Feature check | Result |
|--------------|------|---------------------|---------------|--------|
| Αρχική | `/dashboard/tenant` | `'tenant'` not in FEATURE_MODULES | Fail-open (step 6) | **VISIBLE** |
| Διαχείριση Ιστοσελίδας | `/dashboard/tenant-site` | `'tenant-site'` not in FEATURE_MODULES | Fail-open | **VISIBLE** |
| Βιβλία / Προϊόντα | `/dashboard/products` | `'products'` → `'eshop'` | featureMap.eshop = undefined ≠ true | **HIDDEN** |
| Πολυμέσα | `/dashboard/media` | `'media'` → `'cms'` | featureMap.cms = true ✓ | **VISIBLE** |
| Υπηρεσίες | `/dashboard/services` | `'services'` → `'cms'` | featureMap.cms = true ✓ | **VISIBLE** |
| Blog | `/dashboard/blog` | `'blog'` → `'cms'` | featureMap.cms = true ✓ | **VISIBLE** |
| Κριτικές | `/dashboard/testimonials` | `'testimonials'` → `'cms'` | featureMap.cms = true ✓ | **VISIBLE** |
| Πιστοποιήσεις | `/dashboard/credentials` | `'credentials'` → `'cms'` | featureMap.cms = true ✓ | **VISIBLE** |
| Αξίες | `/dashboard/core-values` | `'core-values'` not in FEATURE_MODULES (key is `coreValues`) | Fail-open | **VISIBLE** |
| Σχετικά | `/dashboard/about` | `'about'` → `'cms'` | featureMap.cms = true ✓ | **VISIBLE** |
| Κουμπιά CTA | `/dashboard/cta` | `'cta'` → `'cms'` | featureMap.cms = true ✓ | **VISIBLE** |
| Σελίδες | `/dashboard/pages` | `'pages'` → `'cms'` | featureMap.cms = true ✓ | **VISIBLE** |
| Business Info | `/dashboard/business-info` | `'business-info'` not in FEATURE_MODULES | Fail-open | **VISIBLE** |
| Branding | `/dashboard/branding` | `'branding'` not in FEATURE_MODULES | Fail-open | **VISIBLE** |
| Ρυθμίσεις Site | `/dashboard/site-settings` | `'site-settings'` not in FEATURE_MODULES (key is `siteSettings`) | Fail-open | **VISIBLE** |

### accountItems — bottom section

| Sidebar Label | Path | Permission | can() check | Result |
|--------------|------|-----------|-------------|--------|
| Προφίλ | `/dashboard/profile` | none | always passes | **VISIBLE** |
| Ρυθμίσεις (Account) | `/dashboard/settings` | `settings.all` | admin has it ✓ BUT block list catches 'settings' | **HIDDEN** (blocked by `['settings','users','backup']` — KNOWN BUG) |
| Ρυθμίσεις Site | `/dashboard/site-settings` | `settings.all` | fail-open (no FEATURE_MODULES match) | **VISIBLE** (correct — this is Site Settings, different path) |
| Χρήστες | `/dashboard/settings/users` | `users.manage` | admin has it ✓ BUT step 5 (`path='users'` in block list) | **HIDDEN** |
| Backup | `/dashboard/settings/backup` | `users.manage` | admin has it ✓ BUT step 5 (`path='backup'` in block list) | **HIDDEN** |

### platformItems — NOT visible (only rendered when `isPlatform` is true, which requires SA)

### Module Registry sidebar groups

Module Registry sidebar items (AdminSidebar.tsx:284-313) **bypass `canAccessModule()`** — there is NO permission check in the rendering code. The `module.sidebar.permission` field exists in manifests but is never enforced at render time.

| Module | featureFlag | getEnabled() result | Sidebar visible? | Route accessible? |
|--------|-----------|---------------------|------------------|-------------------|
| portfolio | `portfolio_module` | false (not in featureMap) | **HIDDEN** (getEnabled blocks) | **HIDDEN** (getRoutes blocks) |
| retreat | `retreat_module` | false (not in featureMap) | **HIDDEN** (getEnabled blocks) | **HIDDEN** (getRoutes blocks) |
| akes | `cms` | **true** (featureMap.cms = true ✓) | **VISIBLE** (bypasses permission check) | **ACCESSIBLE** (no route guard) |

**KNOWN BUG:** AKES sidebar item is visible AND the route is accessible for admin@kolokotronis.gr because:
1. AKES manifest has `featureFlag: 'cms'` — wrong, should be platform scope
2. `featureMap.cms = true` → ModuleRegistry.getEnabled() returns AKES
3. Sidebar rendering (line 284) does NOT check permissions — items render directly
4. Route rendering in Dashboard.tsx (line 104) does NOT wrap in permission guard — AKESDashboard renders directly
5. AKES manifest defines `permission: 'platform.akes.view'` but it's metadata only, never enforced

**EXPECTED behavior:** AKES is platform-only, super-admin-only. No tenant user should see it.
**This will be fixed in Gen2:** AKES becomes `scope: 'platform'` with `requiredCapability: 'platform.akes.view'`.

### Total visible sidebar items for Kolokotronis: **16** (15 content + 1 AKES bug)

1. Αρχική
2. Διαχείριση Ιστοσελίδας
3. Πολυμέσα
4. Υπηρεσίες
5. Blog
6. Κριτικές
7. Πιστοποιήσεις
8. Αξίες
9. Σχετικά
10. Κουμπιά CTA
11. Σελίδες
12. Business Info
13. Branding
14. Ρυθμίσεις Site
15. Προφίλ

---

## 4. Routes Accessible to Kolokotronis (admin@kolokotronis.gr)

All CMS routes are accessible by URL — NO route-level CMS feature guard exists.
Only PlatformGuard (SA check) blocks platform routes.

| Route Path | Guard | Component | Accessible? |
|-----------|-------|-----------|-------------|
| `/dashboard` | None | TenantOverview | **YES** |
| `/dashboard/platform` | PlatformGuard | PlatformOverview | NO (redirects to /dashboard) |
| `/dashboard/evolution` | PlatformGuard | PlatformEvolution | NO |
| `/dashboard/categories` | `isDemoMode` only | Categories | NO |
| `/dashboard/orders` | `isDemoMode` only | Orders | NO |
| `/dashboard/customers` | `isDemoMode` only | Customers | NO |
| `/dashboard/products` | None | Products | **YES** (sidebar hides it) |
| `/dashboard/media` | None | MediaLibrary | **YES** |
| `/dashboard/profile` | None | Profile | **YES** |
| `/dashboard/settings` | None | DashboardSettings | **YES** |
| `/dashboard/settings/users` | None | UsersManager | **YES** (sidebar hides it) |
| `/dashboard/settings/backup` | None | BackupManager | **YES** (sidebar hides it) |
| `/dashboard/settings/observability` | PlatformGuard | ObservabilityDashboard | NO |
| `/dashboard/settings/usage` | PlatformGuard | UsageDashboard | NO |
| `/dashboard/settings/system` | PlatformGuard | SystemDebug | NO |
| `/dashboard/services` | None | Services | **YES** |
| `/dashboard/blog` | None | BlogPosts | **YES** |
| `/dashboard/testimonials` | None | Testimonials | **YES** |
| `/dashboard/credentials` | None | Credentials | **YES** |
| `/dashboard/core-values` | None | CoreValues | **YES** |
| `/dashboard/about` | None | AboutPanel | **YES** |
| `/dashboard/cta` | None | CtaPanel | **YES** |
| `/dashboard/business-info` | None | BusinessInformationPanel | **YES** |
| `/dashboard/branding` | None | BrandingPanel | **YES** |
| `/dashboard/pages` | None | Pages | **YES** |
| `/dashboard/site-settings` | None | SiteSettingsPanel | **YES** |
| `/dashboard/analytics` | None | AnalyticsDashboard | **YES** |
| `/dashboard/history` | PlatformGuard | History | NO |
| `/dashboard/contact-messages` | None → redirect | Navigate to /dashboard/inbox | **YES** (redirects, then blocked) |
| `/dashboard/inbox` | PlatformGuard | InboxPage | NO |
| `/dashboard/pipeline` | PlatformGuard | PipelinePage | NO |
| `/dashboard/tenant` | None | TenantOverview | **YES** |
| `/dashboard/tenant-site` | None | TenantSiteManagement | **YES** |
| `/dashboard/portfolio/*` | ModuleRegistry.getEnabled | Portfolio CRUD | NO (portfolio_module=undefined) |
| `/dashboard/retreat/*` | ModuleRegistry.getEnabled | Retreat CRUD | NO (retreat_module=undefined) |
| `/dashboard/akes` | ModuleRegistry.getEnabled | AKESDashboard | **YES** (featureFlag=cms=true ✓, NO route guard — permission `platform.akes.view` is metadata only) |

**Note:** Routes with NO guard are accessible even if sidebar hides them (e.g., `/dashboard/products`, `/dashboard/settings/users`, `/dashboard/settings/backup`).

---

## 5. FEATURE_MODULES Mapping (access.ts)

```typescript
{
  services: 'cms',           // ✓ matches /dashboard/services
  blog: 'cms',               // ✓ matches /dashboard/blog
  testimonials: 'cms',       // ✓ matches /dashboard/testimonials
  credentials: 'cms',        // ✓ matches /dashboard/credentials
  coreValues: 'cms',         // ✗ MISMATCH — /dashboard/core-values → pop() = 'core-values'
  about: 'cms',              // ✓ matches /dashboard/about
  cta: 'cms',                // ✓ matches /dashboard/cta
  pages: 'cms',              // ✓ matches /dashboard/pages
  media: 'cms',              // ✓ matches /dashboard/media
  siteSettings: 'cms',       // ✗ MISMATCH — /dashboard/site-settings → pop() = 'site-settings'
  inbox: 'inbox',
  pipeline: 'pipeline',
  emailWorkspace: 'email_workspace',
  products: 'eshop',
  orders: 'eshop',
  customers: 'eshop',
  categories: 'eshop',
  portfolio: 'portfolio_module',
  retreat: 'retreat_module',
  akes: 'cms',
}
```

**CURRENT BUG:** Keys `coreValues` and `siteSettings` do not match their URL path segments (`core-values`, `site-settings`). This means `FEATURE_MODULES[path]` returns `undefined`, causing fail-open → these items are always visible regardless of feature flags. **Do NOT fix this for Gen1.** (Fix only for Gen2.)

---

## 6. Module Manifests (as registered)

| Module | featureFlag | Routes | Sidebar items | Permission |
|--------|-----------|-------|---------------|------------|
| portfolio | `portfolio_module` | 8 routes | 8 sidebar items | `portfolio.view/edit` |
| retreat | `retreat_module` | 5 routes | 5 sidebar items | `retreat.view/edit/bookings` |
| akes | `cms` | 1 route | 1 sidebar item | `platform.akes.view` |

---

## 7. Permission Matrix (current)

| Role | Permissions |
|------|------------|
| admin | `cms.edit`, `cms.view`, `settings.all`, `users.manage` |
| editor | `cms.edit`, `cms.view`, `settings.all` |
| viewer | `cms.view` |

Platform permissions: SA only.

---

## 8. Suspension (current behavior)

`SuspensionBanner` component checks `tenant.tenantStatus`.
- If `'suspended'` or `'cancelled'` → shows warning banner at top.
- **NO route blocking** — user can still navigate and potentially write data.
- DB-level RLS for suspension: **NOT implemented** (UI-only).

---

## 9. SaDeleteTenantTenant (current)

When SA selects Kolokotronis tenant:
- `effectiveTenantId` = Kolokotronis ID
- `featureMap` = hardcoded all-true map (NOT real DB features)
- `tenantStatus` = `'active'` (hardcoded, NOT from DB)

**BUG:** SA sees ALL features as enabled even if Kolokotronis only has `cms + crm` in DB.
**Do NOT fix for Gen1.** Fix only for Gen2 SA behavior.

---

## 10. Key Code Files (with line numbers)

| File | Key lines | Purpose |
|------|-----------|---------|
| `src/lib/useTenant.ts:86-98` | `fetchTenantFeatures()` | Queries DB for non-SA features |
| `src/lib/useTenant.ts:140-148` | SA hardcoded featureMap | SA always sees all features enabled |
| `src/lib/useTenant.ts:173-192` | Non-SA path | Fetches features + status from DB |
| `src/lib/useTenant.ts:112` | `KNOWN_SUPER_ADMIN_EMAILS` | SA detection |
| `src/components/admin/AdminSidebar.tsx:124-138` | `canAccessModule()` | FAIL-OPEN logic |
| `src/components/admin/AdminSidebar.tsx:49-65` | `contentItems` | All CMS sidebar items |
| `src/components/admin/AdminSidebar.tsx:82-87` | `accountItems` | Profile + Settings |
| `src/lib/access.ts:57-80` | `FEATURE_MODULES` | URL path → feature mapping |
| `src/lib/access.ts:29-39` | `canAccess()` | Feature-level gate |
| `src/lib/ModuleRegistry.ts:81-89` | `getEnabled()` | Module filtering by featureMap |
| `src/modules/akes/manifest.ts:9` | `featureFlag: 'cms'` | AKES tied to CMS feature (BUG) |
| `src/pages/Dashboard.tsx:64-108` | Routes | Route definitions |

---

## 11. Known Bugs (documented, NOT protected baseline)

| Bug | File | Impact | Fix planned for |
|-----|------|--------|----------------|
| AKES visible to tenant users | `modules/akes/manifest.ts:9` — `featureFlag: 'cms'` should be platform scope | Tenant users see AKES sidebar item + route | Gen2: `scope: 'platform'` |
| Account Settings hidden by block list | `AdminSidebar.tsx:136` — `['settings', 'users', 'backup']` includes 'settings' | `/dashboard/settings` hidden in sidebar (route still accessible) | Gen2: separate Account from block list |
| `coreValues`/`siteSettings` key mismatch | `access.ts:61,66` — camelCase keys don't match kebab-case URLs | Items always visible via fail-open | Gen2: use kebab-case keys |
| Module Registry sidebar bypasses permission checks | `AdminSidebar.tsx:284-313` — no permission filter | AKES sidebar shown despite `platform.akes.view` permission | Gen2: add permission check |

---

## 12. Regression Test Checklist

After ANY shared-code change, verify ALL of the following for admin@kolokotronis.gr:

### Sidebar visibility (must see exactly 16 items — 15 content + 1 AKES Module Registry):
- [ ] Αρχική visible
- [ ] Διαχείριση Ιστοσελίδας visible
- [ ] Βιβλία / Προϊόντα HIDDEN
- [ ] Πολυμέσα visible
- [ ] Υπηρεσίες visible
- [ ] Blog visible
- [ ] Κριτικές visible
- [ ] Πιστοποιήσεις visible
- [ ] Αξίες visible
- [ ] Σχετικά visible
- [ ] Κουμπιά CTA visible
- [ ] Σελίδες visible
- [ ] Business Info visible
- [ ] Branding visible
- [ ] Ρυθμίσεις Site visible
- [ ] Προφίλ visible
- [ ] Ρυθμίσεις HIDDEN (blocked by ['settings','users','backup'] list)
- [ ] Χρήστες HIDDEN
- [ ] Backup HIDDEN
- [ ] Platform section HIDDEN (all items)
- [ ] AKES **visible** (Module Registry, bypasses permission — existing behavior to preserve)

### Route accessibility:
- [ ] `/dashboard` → TenantOverview, no redirect
- [ ] `/dashboard/services` → Services panel, 200
- [ ] `/dashboard/blog` → BlogPosts, 200
- [ ] `/dashboard/testimonials` → Testimonials, 200
- [ ] `/dashboard/credentials` → Credentials, 200
- [ ] `/dashboard/core-values` → CoreValues, 200
- [ ] `/dashboard/about` → AboutPanel, 200
- [ ] `/dashboard/cta` → CtaPanel, 200
- [ ] `/dashboard/pages` → Pages, 200
- [ ] `/dashboard/media` → MediaLibrary, 200
- [ ] `/dashboard/business-info` → BusinessInformationPanel, 200
- [ ] `/dashboard/branding` → BrandingPanel, 200
- [ ] `/dashboard/site-settings` → SiteSettingsPanel, 200
- [ ] `/dashboard/tenant` → TenantOverview, 200
- [ ] `/dashboard/tenant-site` → TenantSiteManagement, 200
- [ ] `/dashboard/analytics` → AnalyticsDashboard, 200
- [ ] `/dashboard/platform` → REDIRECT to /dashboard
- [ ] `/dashboard/inbox` → REDIRECT to /dashboard
- [ ] `/dashboard/pipeline` → REDIRECT to /dashboard
- [ ] `/dashboard/akes` → AKESDashboard, 200 (accessible despite no permission — existing behavior)

### featureMap state:
- [ ] featureMap = `{ cms: true, crm: true }` exactly (not null, not more keys)
- [ ] tenantStatus = `'active'`
- [ ] isSuperAdmin = `false`

### SA (info@aionweb.gr) with Kolokotronis selected:
- [ ] isSuperAdmin = `true`
- [ ] featureMap = hardcoded all-true (12 keys)
- [ ] tenantStatus = `'active'` (hardcoded)
- [ ] SA sees ALL sidebar items (including platform)
- [ ] SA still sees Kolokotronis content when selecting that tenant
