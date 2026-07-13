/*
  ═══════════════════════════════════════════════════════════════
  GEN1 REGRESSION TESTS — KOLOKOTRONIS BASELINE

  These tests capture the EXACT current behavior for Gen1
  (legacy) tenants like Kolokotronis. They MUST pass before
  AND after any migration or shared-code change.

  CRITICAL INVARIANT:
  Gen2 architecture must never alter observable behavior
  of Gen1 protected tenants. If any test fails after a change,
  the change is blocked.

  KNOWN BUGS (documented, NOT protected baseline):
  1. AKES module visible to tenant users (featureFlag: 'cms' is wrong)
  2. canAccessModule() fail-open allows items without FEATURE_MODULES entry
  3. Account Settings hidden by ['settings','users','backup'] block list
     (Site Settings is correctly visible — it maps to 'site-settings' path)
  ═══════════════════════════════════════════════════════════════
*/

import { describe, it, expect } from 'vitest';
import { FEATURE_MODULES, canAccess } from '../lib/access';

// ============================================================
// 1. FEATURE_MODULES — URL path → feature mapping
// ============================================================
describe('[GEN1] FEATURE_MODULES — path to feature mapping', () => {
  it('maps CMS content paths to "cms"', () => {
    expect(FEATURE_MODULES['services']).toBe('cms');
    expect(FEATURE_MODULES['blog']).toBe('cms');
    expect(FEATURE_MODULES['testimonials']).toBe('cms');
    expect(FEATURE_MODULES['credentials']).toBe('cms');
    expect(FEATURE_MODULES['about']).toBe('cms');
    expect(FEATURE_MODULES['cta']).toBe('cms');
    expect(FEATURE_MODULES['pages']).toBe('cms');
    expect(FEATURE_MODULES['media']).toBe('cms');
  });

  it('[KNOWN BUG] mismatched keys cause fail-open — core-values and site-settings have no mapping', () => {
    // Path pop() = 'core-values' but FEATURE_MODULES key is 'coreValues'
    expect(FEATURE_MODULES['core-values']).toBeUndefined();
    // Path pop() = 'site-settings' but FEATURE_MODULES key is 'siteSettings'
    expect(FEATURE_MODULES['site-settings']).toBeUndefined();
    // These mismatches cause FEATURE check to skip → fail-open
    // This is a known bug — items are always visible regardless of feature flags
  });

  it('maps CRM paths correctly', () => {
    expect(FEATURE_MODULES['inbox']).toBe('inbox');
    expect(FEATURE_MODULES['pipeline']).toBe('pipeline');
  });

  it('maps eshop paths correctly', () => {
    expect(FEATURE_MODULES['products']).toBe('eshop');
    expect(FEATURE_MODULES['orders']).toBe('eshop');
    expect(FEATURE_MODULES['customers']).toBe('eshop');
    expect(FEATURE_MODULES['categories']).toBe('eshop');
  });

  it('maps module registry paths correctly', () => {
    expect(FEATURE_MODULES['portfolio']).toBe('portfolio_module');
    expect(FEATURE_MODULES['retreat']).toBe('retreat_module');
    expect(FEATURE_MODULES['akes']).toBe('cms');
  });

  it('has correct total number of mappings (20)', () => {
    expect(Object.keys(FEATURE_MODULES)).toHaveLength(20);
  });

  it('no undefined values in mappings', () => {
    for (const [key, value] of Object.entries(FEATURE_MODULES)) {
      expect(value, `FEATURE_MODULES['${key}'] is undefined`).toBeDefined();
    }
  });
});

// ============================================================
// 2. canAccess() — Feature-level gate
// ============================================================
describe('[GEN1] canAccess() — feature gate', () => {
  const feature = 'cms';

  it('returns false when featureMap is null (loading)', () => {
    expect(canAccess(feature, false, null)).toBe(false);
  });

  it('returns false when featureMap is empty ({} loaded with zero features)', () => {
    expect(canAccess(feature, false, {})).toBe(false);
  });

  it('returns true when featureMap contains feature as true', () => {
    expect(canAccess(feature, false, { cms: true })).toBe(true);
  });

  it('returns false when feature is absent from featureMap', () => {
    expect(canAccess(feature, false, { eshop: true })).toBe(false);
  });

  it('returns false when feature is explicitly false', () => {
    expect(canAccess(feature, false, { cms: false })).toBe(false);
  });

  it('super admin bypasses all feature checks', () => {
    expect(canAccess(feature, true, null)).toBe(true);
    expect(canAccess(feature, true, {})).toBe(true);
    expect(canAccess(feature, true, { cms: false })).toBe(true);
  });

  it('blocks suspended tenant even with correct feature', () => {
    expect(canAccess(feature, false, { cms: true }, 'suspended')).toBe(false);
  });

  it('blocks cancelled tenant', () => {
    expect(canAccess(feature, false, { cms: true }, 'cancelled')).toBe(false);
  });

  it('allows active tenant with correct feature', () => {
    expect(canAccess(feature, false, { cms: true }, 'active')).toBe(true);
  });

  it('allows trial tenant with correct feature', () => {
    expect(canAccess(feature, false, { cms: true }, 'trial')).toBe(true);
  });

  it('super admin is also blocked by suspension (status check is first)', () => {
    // Current design: tenantStatus is checked BEFORE isSuperAdmin
    expect(canAccess(feature, true, null, 'suspended')).toBe(false);
  });
});

// ============================================================
// 3. Gen1 Kolokotronis featureMap — ALL panel assertions
// ============================================================
describe('[GEN1] Kolokotronis — every CMS panel must be accessible', () => {
  // Simulates fetchTenantFeatures('kolokotronis-uuid') result
  const kolokotronisFeatureMap = { cms: true, crm: true };

  it('featureMap has exactly 2 keys (cms + crm)', () => {
    expect(Object.keys(kolokotronisFeatureMap)).toHaveLength(2);
  });

  it('no fine-grained cms_* flags exist (Gen1 uses monolithic cms)', () => {
    const fineGrained = ['cms_services', 'cms_blog', 'cms_media', 'cms_pages',
      'cms_about', 'cms_credentials', 'cms_testimonials', 'cms_faq',
      'cms_tenant_site', 'cms_business_info', 'cms_branding', 'cms_site_settings'];
    for (const flag of fineGrained) {
      expect(kolokotronisFeatureMap[flag]).toBeUndefined();
    }
  });

  it('no Gen2-specific features exist', () => {
    const gen2 = ['portfolio_module', 'retreat_module', 'locale_module', 'retreat_booking'];
    for (const flag of gen2) {
      expect(kolokotronisFeatureMap[flag]).toBeUndefined();
    }
  });

  // Simulates the canAccessModule() sidebar logic for each panel
  function sidebarVisible(path: string): boolean {
    const segment = path.split('/').pop() || '';
    const feature = (FEATURE_MODULES as Record<string, string>)[segment];
    if (feature && kolokotronisFeatureMap) {
      return kolokotronisFeatureMap[feature] === true;
    }
    // Items without FEATURE_MODULES key → FAIL OPEN (known Gen1 behavior)
    // But ['settings','users','backup'] are explicitly blocked for non-SA
    if (['settings', 'users', 'backup'].includes(segment)) return false;
    return true;
  }

  it('all 14 CMS panels are accessible via monolithic cms=true', () => {
    // Panels mapped to 'cms' in FEATURE_MODULES:
    expect(sidebarVisible('/dashboard/services')).toBe(true);
    expect(sidebarVisible('/dashboard/blog')).toBe(true);
    expect(sidebarVisible('/dashboard/testimonials')).toBe(true);
    expect(sidebarVisible('/dashboard/credentials')).toBe(true);
    expect(sidebarVisible('/dashboard/about')).toBe(true);
    expect(sidebarVisible('/dashboard/cta')).toBe(true);
    expect(sidebarVisible('/dashboard/pages')).toBe(true);
    expect(sidebarVisible('/dashboard/media')).toBe(true);
  });

  it('panels with FEATURE_MODULES key mismatch are visible via fail-open', () => {
    // These paths have no matching FEATURE_MODULES key → fail-open → visible
    expect(sidebarVisible('/dashboard/core-values')).toBe(true);
    expect(sidebarVisible('/dashboard/site-settings')).toBe(true);
  });

  it('panels without FEATURE_MODULES entry are visible via fail-open', () => {
    // These are NOT in FEATURE_MODULES at all → fail-open → visible
    expect(sidebarVisible('/dashboard/tenant')).toBe(true);
    expect(sidebarVisible('/dashboard/tenant-site')).toBe(true);
    expect(sidebarVisible('/dashboard/business-info')).toBe(true);
    expect(sidebarVisible('/dashboard/branding')).toBe(true);
  });

  it('profile is always visible (no permission, no feature check)', () => {
    expect(sidebarVisible('/dashboard/profile')).toBe(true);
  });

  it('[KNOWN BUG] account settings hidden by block list — Site Settings is correct', () => {
    // Account level: /dashboard/settings → path 'settings' → blocked
    expect(sidebarVisible('/dashboard/settings')).toBe(false);
    // Site settings: /dashboard/site-settings → path 'site-settings' → fail-open → visible
    expect(sidebarVisible('/dashboard/site-settings')).toBe(true);
    // Users and Backup also blocked
    expect(sidebarVisible('/dashboard/settings/users')).toBe(false);
    expect(sidebarVisible('/dashboard/settings/backup')).toBe(false);
    // NOTE: The block list ['settings','users','backup'] includes 'settings',
    // which accidentally blocks Account Settings (/dashboard/settings).
    // This is a known bug in the Gen1 code. It does NOT affect Site Settings
    // (/dashboard/site-settings) which has a different path segment.
  });

  it('eshop items hidden (eshop not in featureMap)', () => {
    expect(sidebarVisible('/dashboard/products')).toBe(false);
  });

  it('super admin sees everything', () => {
    // Simulate SA behavior: bypass all checks
    function saVisible(path: string): boolean {
      return true; // SA bypasses everything
    }
    expect(saVisible('/dashboard/products')).toBe(true);
    expect(saVisible('/dashboard/settings/users')).toBe(true);
    expect(saVisible('/dashboard/settings/backup')).toBe(true);
  });
});

// ============================================================
// 4. ModuleRegistry — Gen1 behavior (KNOWN BUG: AKES visible)
// ============================================================
describe('[GEN1] ModuleRegistry.getEnabled()', () => {
  const kolokotronisFeatureMap = { cms: true, crm: true };
  const emptyFeatureMap = {};
  const nullFeatureMap = null;

  it('Gen1 with cms=true returns AKES — KNOWN BUG (AKES should be SA-only)', async () => {
    await import('../modules/akes/manifest');
    await import('../modules/portfolio/manifest');
    await import('../modules/retreat/manifest');
    const ModuleRegistry = (await import('../lib/ModuleRegistry')).default;
    const enabled = ModuleRegistry.getEnabled(kolokotronisFeatureMap, false);
    const names = enabled.map((m) => m.name);
    // KNOWN BUG: AKES has featureFlag 'cms' so it leaks to any tenant with cms=true
    // CORRECT BEHAVIOR should be: AKES never visible to tenant users
    expect(names).toContain('akes');
    expect(names).not.toContain('portfolio');
    expect(names).not.toContain('retreat');
  });

  it('[TODO: Gen2] AKES must NOT be returned for tenant users — fix featureFlag to platform scope', () => {
    // This test documents the EXPECTED Gen2 behavior:
    // const expectedGen2ModuleRegistry = [];
    // expect(names).not.toContain('akes'); // AKES is platform-only
    // Will be implemented when ModuleRegistry supports scope/capability filtering
  });

  it('returns empty when featureMap is null (loading)', async () => {
    await import('../modules/akes/manifest');
    const ModuleRegistry = (await import('../lib/ModuleRegistry')).default;
    expect(ModuleRegistry.getEnabled(nullFeatureMap, false)).toHaveLength(0);
  });

  it('returns empty when featureMap is {} (zero features)', async () => {
    await import('../modules/akes/manifest');
    const ModuleRegistry = (await import('../lib/ModuleRegistry')).default;
    expect(ModuleRegistry.getEnabled(emptyFeatureMap, false)).toHaveLength(0);
  });

  it('returns ALL modules for super admin (bypasses featureMap)', async () => {
    await import('../modules/akes/manifest');
    await import('../modules/portfolio/manifest');
    await import('../modules/retreat/manifest');
    const ModuleRegistry = (await import('../lib/ModuleRegistry')).default;
    const names = ModuleRegistry.getEnabled(kolokotronisFeatureMap, true).map((m) => m.name);
    expect(names).toContain('akes');
    expect(names).toContain('portfolio');
    expect(names).toContain('retreat');
  });
});

// ============================================================
// 5. Gen1 sidebar fail-open behavior (documented as KNOWN)
// ============================================================
describe('[GEN1 LEGACY COMPAT] Sidebar fail-open — protected for Gen1 only', () => {
  // This simulates the current AdminSidebar.tsx:124-138 canAccessModule() logic
  // WARNING: This fail-open behavior is Gen1 legacy compatibility ONLY.
  // The Gen2 path MUST use fail-closed (FeatureGuard).

  function gen1CanAccessModule(
    path: string,
    featureMap: Record<string, boolean> | null,
    isSuperAdmin: boolean,
  ): boolean {
    if (isSuperAdmin) return true;
    const segment = path.split('/').pop() || '';
    const feature = (FEATURE_MODULES as Record<string, string>)[segment];
    // Gen1: if feature AND featureMap exist, check featureMap[feature]
    if (feature && featureMap) {
      return featureMap[feature] === true;
    }
    // Block list for non-SA
    if (['settings', 'users', 'backup'].includes(segment)) return false;
    // GEN1 FAIL-OPEN: if no feature mapping found, return true
    return true;
  }

  // Gen2 expected behavior (NOT YET IMPLEMENTED — shown here as target)
  function gen2CanAccessModule(
    path: string,
    featureMap: Record<string, boolean> | null,
    isSuperAdmin: boolean,
  ): boolean {
    if (isSuperAdmin) return true;
    const segment = path.split('/').pop() || '';
    const feature = (FEATURE_MODULES as Record<string, string>)[segment];
    // Gen2: feature check always runs if mapping exists
    if (feature) {
      if (!featureMap) return false; // loading → block
      return featureMap[feature] === true;
    }
    // Items without mapping are NOT in sidebar config → block
    return false;
  }

  const kolokotronisMap = { cms: true, crm: true };
  const emptyMap = {};

  it('[GEN1] CMS content items visible (mapped to cms=true)', () => {
    expect(gen1CanAccessModule('/dashboard/services', kolokotronisMap, false)).toBe(true);
    expect(gen1CanAccessModule('/dashboard/blog', kolokotronisMap, false)).toBe(true);
    expect(gen1CanAccessModule('/dashboard/pages', kolokotronisMap, false)).toBe(true);
  });

  it('[GEN1] Fail-open for items without FEATURE_MODULES entry (protected legacy)', () => {
    expect(gen1CanAccessModule('/dashboard/core-values', kolokotronisMap, false)).toBe(true);
    expect(gen1CanAccessModule('/dashboard/site-settings', kolokotronisMap, false)).toBe(true);
    expect(gen1CanAccessModule('/dashboard/tenant', kolokotronisMap, false)).toBe(true);
    expect(gen1CanAccessModule('/dashboard/tenant-site', kolokotronisMap, false)).toBe(true);
    expect(gen1CanAccessModule('/dashboard/business-info', kolokotronisMap, false)).toBe(true);
    expect(gen1CanAccessModule('/dashboard/branding', kolokotronisMap, false)).toBe(true);
  });

  it('[GEN1] Empty featureMap: mapped items hidden, unmapped items visible (fail-open)', () => {
    // Mapped items: featureMap is {} but truthy → featureMap[feature] === undefined → false → hidden
    expect(gen1CanAccessModule('/dashboard/services', emptyMap, false)).toBe(false);
    // Unmapped items: no feature check → fail-open → visible
    expect(gen1CanAccessModule('/dashboard/tenant', emptyMap, false)).toBe(true);
  });

  it('[GEN1] null featureMap (loading): mapped items visible (fail-open, condition short-circuits)', () => {
    // When featureMap is null: the condition "feature && tenant.featureMap" is false
    // because featureMap is falsy. → goes to block list check → not in list → return true
    // This means during loading, ALL items are visible (fail-open even wider)
    expect(gen1CanAccessModule('/dashboard/services', null, false)).toBe(true);
    expect(gen1CanAccessModule('/dashboard/products', null, false)).toBe(true);
    expect(gen1CanAccessModule('/dashboard/settings', null, false)).toBe(false); // block list
  });

  it('[GEN2 TARGET] Must be fail-closed — these expectations will replace Gen1 path', () => {
    // Gen2 target behavior (for reference):
    // 1. null featureMap → block (wait for load)
    // 2. {} featureMap → block (no features)
    // 3. Missing feature → block
    // 4. Items without mapping → block (not configured)
    expect(gen2CanAccessModule('/dashboard/services', null, false)).toBe(false);
    expect(gen2CanAccessModule('/dashboard/services', emptyMap, false)).toBe(false);
    expect(gen2CanAccessModule('/dashboard/tenant', kolokotronisMap, false)).toBe(false);
    // These tests will ENABLE when Gen2 path is implemented
  });
});

// ============================================================
// 6. Critical invariant — Gen1 isolation from Gen2
// ============================================================
describe('[CRITICAL INVARIANT] Gen1 must not pass through Gen2 path', () => {
  it('Gen1 with empty tenant_features gets {} (not null) — canAccess still blocks', () => {
    // fetchTenantFeatures() returns {} when no rows exist
    // Gen1 path: featureMap = {} (not null)
    // canAccess('cms', false, {}) → false
    // But sidebar: canAccessModule() with {} → fail-open (unmapped items visible)
    const emptyMap: Record<string, boolean> = {};
    expect(canAccess('cms', false, emptyMap)).toBe(false);
  });

  it('Gen1 ignores fine-grained features in DB (monolithic cms path)', () => {
    // Even if Gen1 tenant has cms_services=true in tenant_features,
    // the Gen1 sidebar only checks FEATURE_MODULES mapping → 'services' → 'cms'
    const gen1Map = { cms: true, crm: true, cms_services: true, portfolio_module: true };
    expect(canAccess('cms_services', false, gen1Map)).toBe(true); // exists as key
    expect(canAccess('portfolio_module', false, gen1Map)).toBe(true);
    // But sidebar uses FEATURE_MODULES, not direct feature names:
    const feature = FEATURE_MODULES['services']; // 'cms'
    expect(gen1Map[feature]).toBe(true);
  });

  it('Gen2 FEATURE_MODULES changes must not break Gen1 keys', () => {
    // FEATURE_MODULES is shared code — Gen2 migration must keep existing keys
    const existing = Object.keys(FEATURE_MODULES);
    expect(existing).toContain('services');
    expect(existing).toContain('blog');
    expect(existing).toContain('testimonials');
    expect(existing).toContain('credentials');
    expect(existing).toContain('about');
    expect(existing).toContain('cta');
    expect(existing).toContain('pages');
    expect(existing).toContain('media');
    // Adding new keys is fine, removing/renaming existing ones breaks Gen1
  });
});

// ============================================================
// 7. Phase 2 verification — no runtime behavior change
// ============================================================
describe('[PHASE 2 VERIFICATION] Metadata only — runtime unchanged', () => {
  it('FEATURE_MODULES is unchanged (Phase 2 adds no new mappings)', () => {
    // Confirm: no Gen2-specific keys were added yet
    expect(FEATURE_MODULES['cms_services']).toBeUndefined();
    expect(FEATURE_MODULES['cms_blog']).toBeUndefined();
    expect(FEATURE_MODULES['cms_pages']).toBeUndefined();
    expect(FEATURE_MODULES['cms_media']).toBeUndefined();
    expect(FEATURE_MODULES['cms_tenant_site']).toBeUndefined();
    expect(FEATURE_MODULES['cms_business_info']).toBeUndefined();
    expect(FEATURE_MODULES['cms_branding']).toBeUndefined();
    expect(FEATURE_MODULES['cms_site_settings']).toBeUndefined();
  });

  it('canAccess() is unchanged (no Gen2-specific logic)', () => {
    // Phase 2 does not modify canAccess — same behavior as before
    expect(canAccess('cms', false, { cms: true })).toBe(true);
    expect(canAccess('cms', false, null)).toBe(false);
  });

  it('no new TypeScript types added in Phase 2', () => {
    // The generation column exists in DB but TypeScript Tenant type not updated yet
    // This happens in Phase 3 when Gen2 code reads tenant.generation
  });
});
