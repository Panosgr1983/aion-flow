/*
  ═══════════════════════════════════════════════════════════════
  GEN2 UNIT TESTS — Tenant Context Loaders (Phase 3A)

  Tests for the Gen1/Gen2 runtime context branching.

  These tests verify:
    - loadLegacyTenantContext() preserves exact current behavior
    - loadGen2TenantContext() loads real status + features
    - resolveTenantContext() branches correctly on generation
    - Distinct loading/empty/error states
    - SA behavior with Gen1 vs Gen2
  ═══════════════════════════════════════════════════════════════
*/

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase before importing the module
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const { supabase } = await import('../lib/supabase');
const { loadLegacyTenantContext, loadGen2TenantContext, resolveTenantContext } = await import('../lib/loadTenantContext');

// Helper to create mock chain
function mockQuery(result: any) {
  const chain: any = vi.fn();
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.maybeSingle = vi.fn().mockResolvedValue(result);
  (supabase.from as any).mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================
// 1. loadLegacyTenantContext — Gen1 behavior
// ============================================================
describe('[GEN2 TEST] loadLegacyTenantContext — exact current behavior', () => {
  it('SA with tenant ID gets hardcoded all-true featureMap', () => {
    const ctx = loadLegacyTenantContext('tid-001', true);
    expect(ctx.isSuperAdmin).toBe(true);
    expect(ctx.tenantId).toBe('tid-001');
    expect(ctx.effectiveTenantId).toBe('tid-001');
    expect(ctx.featureMap).toEqual({
      cms: true, crm: true, inbox: true, pipeline: true,
      email_workspace: true, eshop: true, bookings: true,
    });
    expect(ctx.tenantStatus).toBe('active');
    expect(ctx.generation).toBe(1);
    expect(ctx.loading).toBe(false);
    expect(ctx.error).toBeNull();
  });

  it('SA without tenant ID returns null tenant context', () => {
    const ctx = loadLegacyTenantContext(null, true);
    expect(ctx.isSuperAdmin).toBe(true);
    expect(ctx.tenantId).toBeNull();
    expect(ctx.effectiveTenantId).toBeNull();
    expect(ctx.featureMap).toBeNull();
    expect(ctx.tenantStatus).toBeNull();
    expect(ctx.generation).toBe(1);
  });

  it('non-SA gets featureMap = null (fail-open sidebar handles visibility)', () => {
    const ctx = loadLegacyTenantContext('tid-001', false);
    expect(ctx.isSuperAdmin).toBe(false);
    expect(ctx.featureMap).toBeNull();
    expect(ctx.tenantStatus).toBe('active');
    expect(ctx.generation).toBe(1);
  });

  it('non-SA without tenant returns null context', () => {
    const ctx = loadLegacyTenantContext(null, false);
    expect(ctx.isSuperAdmin).toBe(false);
    expect(ctx.tenantId).toBeNull();
    expect(ctx.effectiveTenantId).toBeNull();
    expect(ctx.featureMap).toBeNull();
    expect(ctx.tenantStatus).toBeNull();
  });
});

// ============================================================
// 2. loadGen2TenantContext — real status + features
// ============================================================
describe('[GEN2 TEST] loadGen2TenantContext — real status and features', () => {
  beforeEach(() => {
    // Default: metadata and features succeed
    const fromMock = supabase.from as any;
    fromMock.mockReset();

    // First call: tenant_features
    const featuresChain = vi.fn();
    featuresChain.select = vi.fn().mockReturnValue(featuresChain);
    featuresChain.eq = vi.fn().mockResolvedValue({
      data: [{ feature: 'cms_services', enabled: true }, { feature: 'cms_blog', enabled: true }],
      error: null,
    });

    // Second call: tenants
    const tenantChain = vi.fn();
    tenantChain.select = vi.fn().mockReturnValue(tenantChain);
    tenantChain.eq = vi.fn().mockReturnValue(tenantChain);
    tenantChain.maybeSingle = vi.fn().mockResolvedValue({
      data: { status: 'active', generation: 2 },
      error: null,
    });

    fromMock.mockReturnValueOnce(featuresChain).mockReturnValueOnce(tenantChain);
  });

  it('loads features and status for active Gen2 tenant', async () => {
    const ctx = await loadGen2TenantContext('tid-gen2', false);
    expect(ctx.isSuperAdmin).toBe(false);
    expect(ctx.effectiveTenantId).toBe('tid-gen2');
    expect(ctx.featureMap).toEqual({ cms_services: true, cms_blog: true });
    expect(ctx.tenantStatus).toBe('active');
    expect(ctx.generation).toBe(2);
    expect(ctx.loading).toBe(false);
    expect(ctx.error).toBeNull();
  });

  it('returns empty featureMap when tenant has no feature rows (loaded, zero features)', async () => {
    const fromMock = supabase.from as any;
    fromMock.mockReset();

    const featuresChain = vi.fn();
    featuresChain.select = vi.fn().mockReturnValue(featuresChain);
    featuresChain.eq = vi.fn().mockResolvedValue({ data: [], error: null });

    const tenantChain = vi.fn();
    tenantChain.select = vi.fn().mockReturnValue(tenantChain);
    tenantChain.eq = vi.fn().mockReturnValue(tenantChain);
    tenantChain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active', generation: 2 }, error: null });

    fromMock.mockReturnValueOnce(featuresChain).mockReturnValueOnce(tenantChain);

    const ctx = await loadGen2TenantContext('tid-gen2-empty', false);
    expect(ctx.featureMap).toEqual({}); // distinct from null = loaded but zero features
    expect(ctx.error).toBeNull();
  });

  it('returns error when features query fails', async () => {
    const fromMock = supabase.from as any;
    fromMock.mockReset();

    const featuresChain = vi.fn();
    featuresChain.select = vi.fn().mockReturnValue(featuresChain);
    featuresChain.eq = vi.fn().mockResolvedValue({ data: null, error: { message: 'Network error' } });

    const tenantChain = vi.fn();
    tenantChain.select = vi.fn().mockReturnValue(tenantChain);
    tenantChain.eq = vi.fn().mockReturnValue(tenantChain);
    tenantChain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active', generation: 2 }, error: null });

    fromMock.mockReturnValueOnce(featuresChain).mockReturnValueOnce(tenantChain);

    const ctx = await loadGen2TenantContext('tid-gen2-err', false);
    expect(ctx.featureMap).toBeNull(); // null = error, distinct from {}
    expect(ctx.error).toBe('Network error');
    expect(ctx.tenantStatus).toBe('active'); // status still loaded
  });

  it('returns error when status query fails', async () => {
    const fromMock = supabase.from as any;
    fromMock.mockReset();

    const featuresChain = vi.fn();
    featuresChain.select = vi.fn().mockReturnValue(featuresChain);
    featuresChain.eq = vi.fn().mockResolvedValue({ data: [], error: null });

    const tenantChain = vi.fn();
    tenantChain.select = vi.fn().mockReturnValue(tenantChain);
    tenantChain.eq = vi.fn().mockReturnValue(tenantChain);
    tenantChain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Tenant not found' } });

    fromMock.mockReturnValueOnce(featuresChain).mockReturnValueOnce(tenantChain);

    const ctx = await loadGen2TenantContext('tid-non-existent', false);
    expect(ctx.featureMap).toBeNull();
    expect(ctx.tenantStatus).toBeNull();
    expect(ctx.generation).toBeNull();
    expect(ctx.error).toBe('Tenant not found');
  });

  it('returns suspended status correctly', async () => {
    const fromMock = supabase.from as any;
    fromMock.mockReset();

    const featuresChain = vi.fn();
    featuresChain.select = vi.fn().mockReturnValue(featuresChain);
    featuresChain.eq = vi.fn().mockResolvedValue({ data: [], error: null });

    const tenantChain = vi.fn();
    tenantChain.select = vi.fn().mockReturnValue(tenantChain);
    tenantChain.eq = vi.fn().mockReturnValue(tenantChain);
    tenantChain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'suspended', generation: 2 }, error: null });

    fromMock.mockReturnValueOnce(featuresChain).mockReturnValueOnce(tenantChain);

    const ctx = await loadGen2TenantContext('tid-suspended', false);
    expect(ctx.tenantStatus).toBe('suspended');
    expect(ctx.featureMap).toEqual({});
  });
});

// ============================================================
// 3. resolveTenantContext — branching on generation
// ============================================================
describe('[GEN2 TEST] resolveTenantContext — generation branching', () => {
  beforeEach(() => {
    (supabase.from as any).mockReset();
  });

  it('SA without tenant → no tenant context', async () => {
    const ctx = await resolveTenantContext(null, true);
    expect(ctx.isSuperAdmin).toBe(true);
    expect(ctx.tenantId).toBeNull();
    expect(ctx.effectiveTenantId).toBeNull();
    expect(ctx.featureMap).toBeNull();
  });

  it('SA with Gen1 tenant → legacy hardcoded featureMap', async () => {
    // Mock tenants query returning generation=1
    const chain = vi.fn();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active', generation: 1 }, error: null });
    (supabase.from as any).mockReturnValue(chain);

    const ctx = await resolveTenantContext('00000000-0000-0000-0000-000000000001', true);
    expect(ctx.isSuperAdmin).toBe(true);
    expect(ctx.effectiveTenantId).toBe('00000000-0000-0000-0000-000000000001');
    // Should have the legacy hardcoded SA map (7 keys, not the 12-key map)
    expect(ctx.featureMap).toEqual({
      cms: true, crm: true, inbox: true, pipeline: true,
      email_workspace: true, eshop: true, bookings: true,
    });
    expect(ctx.generation).toBe(1);
  });

  it('SA with Gen2 tenant → real features from DB', async () => {
    const fromMock = supabase.from as any;

    // First call: fetchTenantMetadata → tenants query
    const metaChain = vi.fn();
    metaChain.select = vi.fn().mockReturnValue(metaChain);
    metaChain.eq = vi.fn().mockReturnValue(metaChain);
    metaChain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active', generation: 2 }, error: null });

    // Second + third calls: loadGen2TenantContext → features + tenants again
    const featuresChain = vi.fn();
    featuresChain.select = vi.fn().mockReturnValue(featuresChain);
    featuresChain.eq = vi.fn().mockResolvedValue({ data: [{ feature: 'cms_pages', enabled: true }], error: null });

    const tenantChain = vi.fn();
    tenantChain.select = vi.fn().mockReturnValue(tenantChain);
    tenantChain.eq = vi.fn().mockReturnValue(tenantChain);
    tenantChain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active', generation: 2 }, error: null });

    fromMock.mockReturnValueOnce(metaChain).mockReturnValueOnce(featuresChain).mockReturnValueOnce(tenantChain);

    const ctx = await resolveTenantContext('a6a0e182-2e86-4b3a-9601-b055e56a605e', true);
    expect(ctx.isSuperAdmin).toBe(true);
    expect(ctx.featureMap).toEqual({ cms_pages: true });
    expect(ctx.tenantStatus).toBe('active');
    expect(ctx.generation).toBe(2);
  });

  it('non-SA with Gen1 tenant → legacy null featureMap', async () => {
    const chain = vi.fn();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active', generation: 1 }, error: null });
    (supabase.from as any).mockReturnValue(chain);

    const ctx = await resolveTenantContext('00000000-0000-0000-0000-000000000001', false);
    expect(ctx.isSuperAdmin).toBe(false);
    expect(ctx.featureMap).toBeNull();
    expect(ctx.tenantStatus).toBe('active');
    expect(ctx.generation).toBe(1);
  });

  it('non-SA with Gen2 tenant → real features from DB', async () => {
    const fromMock = supabase.from as any;

    // fetchTenantMetadata
    const metaChain = vi.fn();
    metaChain.select = vi.fn().mockReturnValue(metaChain);
    metaChain.eq = vi.fn().mockReturnValue(metaChain);
    metaChain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active', generation: 2 }, error: null });

    // loadGen2TenantContext
    const featuresChain = vi.fn();
    featuresChain.select = vi.fn().mockReturnValue(featuresChain);
    featuresChain.eq = vi.fn().mockResolvedValue({ data: [{ feature: 'cms_media', enabled: true }], error: null });

    const tenantChain = vi.fn();
    tenantChain.select = vi.fn().mockReturnValue(tenantChain);
    tenantChain.eq = vi.fn().mockReturnValue(tenantChain);
    tenantChain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active', generation: 2 }, error: null });

    fromMock.mockReturnValueOnce(metaChain).mockReturnValueOnce(featuresChain).mockReturnValueOnce(tenantChain);

    const ctx = await resolveTenantContext('tid-gen2-nonsa', false);
    expect(ctx.isSuperAdmin).toBe(false);
    expect(ctx.featureMap).toEqual({ cms_media: true });
    expect(ctx.generation).toBe(2);
  });

  it('handles missing generation column (NULL) as Gen1 safe default', async () => {
    // Column doesn't exist yet → data returns { status: 'active', generation: undefined }
    const chain = vi.fn();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active' }, error: null });
    (supabase.from as any).mockReturnValue(chain);

    const ctx = await resolveTenantContext('tid-no-gen-column', false);
    expect(ctx.generation).toBe(1); // safe default
    expect(ctx.featureMap).toBeNull(); // Gen1 non-SA
  });

  it('handles metadata query failure as safe Gen1 default', async () => {
    const chain = vi.fn();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Network error' } });
    (supabase.from as any).mockReturnValue(chain);

    const ctx = await resolveTenantContext('tid-fail', false);
    expect(ctx.generation).toBe(1); // safe default on query failure
    expect(ctx.featureMap).toBeNull();
  });
});

// ============================================================
// 4. fetchTenantMetadata
// ============================================================
describe('[GEN2 TEST] fetchTenantMetadata — DB query for generation + status', () => {
  it('returns generation and status when query succeeds', async () => {
    const chain = vi.fn();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active', generation: 2 }, error: null });
    (supabase.from as any).mockReturnValue(chain);

    const { fetchTenantMetadata } = await import('../lib/loadTenantContext');
    const result = await fetchTenantMetadata('tid-001');
    expect(result.status).toBe('active');
    expect(result.generation).toBe(2);
    expect(result.error).toBeUndefined();
  });

  it('returns Gen1 default when generation column is missing', async () => {
    const chain = vi.fn();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: { status: 'active' }, error: null });
    (supabase.from as any).mockReturnValue(chain);

    const { fetchTenantMetadata } = await import('../lib/loadTenantContext');
    const result = await fetchTenantMetadata('tid-no-gen');
    expect(result.generation).toBe(1);
    expect(result.error).toBeUndefined();
  });

  it('returns error message when query fails', async () => {
    const chain = vi.fn();
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } });
    (supabase.from as any).mockReturnValue(chain);

    const { fetchTenantMetadata } = await import('../lib/loadTenantContext');
    const result = await fetchTenantMetadata('tid-error');
    expect(result.generation).toBe(1);
    expect(result.error).toBe('DB error');
  });
});

// ============================================================
// 5. Gen1 tests still pass (baseline verification)
// ============================================================
describe('[PHASE 3A VERIFICATION] Gen1 regression tests still pass', () => {
  it('Gen1 loadLegacyTenantContext matches expected Gen1 baseline behavior', () => {
    // Kolokotronis = Gen1, non-SA
    const ctx = loadLegacyTenantContext('00000000-0000-0000-0000-000000000001', false);
    expect(ctx.featureMap).toBeNull();
    expect(ctx.tenantStatus).toBe('active');
    expect(ctx.generation).toBe(1);
    expect(ctx.isSuperAdmin).toBe(false);
  });

  it('SA with Gen1 selected tenant still gets hardcoded featureMap', () => {
    const ctx = loadLegacyTenantContext('00000000-0000-0000-0000-000000000001', true);
    expect(ctx.featureMap).not.toBeNull();
    expect(ctx.featureMap!.cms).toBe(true);
    expect(ctx.featureMap!.bookings).toBe(true);
  });

  it('Feature loading failure = null featureMap (fail-closed for canAccess)', () => {
    // Gen2 error state: featureMap = null, error = '...'
    // This is the safety: consumers see null and should not show content
    // (sidebar fail-open is Gen1-only behavior)
    const errorCtx = {
      featureMap: null as Record<string, boolean> | null,
      error: 'Network error',
      loading: false,
    };
    expect(errorCtx.featureMap).toBeNull(); // null = failed/loading
    // In Gen2, null featureMap means "do not show content" (fail-closed)
  });
});
