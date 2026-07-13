/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Tenant Context Loader (Phase 3A)

  Δύο ξεχωριστές ροές authorization με βάση το tenant.generation:

    Gen1 (Legacy):
      → loadLegacyTenantContext()
      → Διατηρεί ακριβώς το σημερινό proven behavior:
          - SA: hardcoded all-true featureMap (όλα enabled)
          - non-SA: featureMap = null (sidebar fail-open)
          - tenantStatus = 'active' (hardcoded)
          - Καμία αλλαγή στον Κολοκοτρώνη

    Gen2 (Next Gen):
      → loadGen2TenantContext()
      → Πραγματικό tenant status από DB
      → Πραγματικά features από tenant_features
      → Διακριτά loading/empty/error states
      - featureMap = null → loading/error
      - featureMap = {} → loaded, zero features
      - SA χωρίς selected tenant → no context

  CRITICAL INVARIANT (AKES Rule v2):
    Gen2 architecture must never alter the observable behavior
    of Gen1 protected tenants.
  ═══════════════════════════════════════════════════════════════
*/

import { supabase } from './supabase';

// ============================================================
// Types
// ============================================================

export interface TenantContext {
  isSuperAdmin: boolean;
  tenantId: string | null;
  effectiveTenantId: string | null;
  featureMap: Record<string, boolean> | null;
  tenantStatus: string | null;
  generation: number | null;
  loading: boolean;
  error: string | null;
}

// The hardcoded SA featureMap (Gen1 legacy — preserved exactly as today)
const LEGACY_SA_FEATURE_MAP: Record<string, boolean> = {
  cms: true,
  crm: true,
  inbox: true,
  pipeline: true,
  email_workspace: true,
  eshop: true,
  bookings: true,
};

// ============================================================
// Helpers
// ============================================================

/**
 * Διαβάζει generation και status ενός tenant από τη βάση.
 * Αν η στήλη generation δεν υπάρχει ακόμη → safe default 1 (Gen1).
 * Αν το query αποτύχει → επιστρέφει error.
 */
export async function fetchTenantMetadata(
  tenantId: string,
): Promise<{ status: string; generation: number; error?: string }> {
  const { data, error } = await supabase
    .from('tenants')
    .select('status, generation')
    .eq('id', tenantId)
    .maybeSingle();

  if (error) {
    return { status: 'active', generation: 1, error: error.message };
  }
  return {
    status: data?.status || 'active',
    generation: data?.generation ?? 1,
  };
}

// ============================================================
// Gen1 (Legacy) — exact current behavior, frozen
// ============================================================

export function loadLegacyTenantContext(
  effectiveTenantId: string | null,
  isSuperAdmin: boolean,
): TenantContext {
  const base: TenantContext = {
    isSuperAdmin,
    tenantId: effectiveTenantId,
    effectiveTenantId,
    featureMap: null,
    tenantStatus: null,
    generation: 1,
    loading: false,
    error: null,
  };

  if (!effectiveTenantId) {
    return { ...base, tenantId: null, effectiveTenantId: null };
  }

  if (isSuperAdmin) {
    return {
      ...base,
      featureMap: { ...LEGACY_SA_FEATURE_MAP },
      tenantStatus: 'active',
    };
  }

  // Non-SA legacy: featureMap = null → sidebar fail-open handles visibility
  return {
    ...base,
    featureMap: null,
    tenantStatus: 'active',
  };
}

// ============================================================
// Gen2 (Next Gen) — real status, real features, distinct states
// ============================================================

export async function loadGen2TenantContext(
  effectiveTenantId: string,
  isSuperAdmin: boolean,
): Promise<TenantContext> {
  try {
    const [featuresResult, metadataResult] = await Promise.all([
      supabase
        .from('tenant_features')
        .select('feature, enabled')
        .eq('tenant_id', effectiveTenantId),
      supabase
        .from('tenants')
        .select('status, generation')
        .eq('id', effectiveTenantId)
        .maybeSingle(),
    ]);

    // Metadata (status, generation) failure → error state
    if (metadataResult.error) {
      return {
        isSuperAdmin,
        tenantId: effectiveTenantId,
        effectiveTenantId,
        featureMap: null,
        tenantStatus: null,
        generation: null,
        loading: false,
        error: metadataResult.error.message,
      };
    }

    const tenantStatus = metadataResult.data?.status || 'active';
    const generation = metadataResult.data?.generation ?? 2;

    // Features query failure → error state
    if (featuresResult.error) {
      return {
        isSuperAdmin,
        tenantId: effectiveTenantId,
        effectiveTenantId,
        featureMap: null,
        tenantStatus,
        generation,
        loading: false,
        error: featuresResult.error.message,
      };
    }

    // Build featureMap from rows
    const featureMap: Record<string, boolean> = {};
    if (featuresResult.data) {
      for (const row of featuresResult.data) {
        featureMap[row.feature] = row.enabled === true;
      }
    }
    // featureMap = {} if no rows → distinct from null (loaded but no features)

    return {
      isSuperAdmin,
      tenantId: effectiveTenantId,
      effectiveTenantId,
      featureMap,
      tenantStatus,
      generation,
      loading: false,
      error: null,
    };
  } catch (err) {
    return {
      isSuperAdmin,
      tenantId: effectiveTenantId,
      effectiveTenantId,
      featureMap: null,
      tenantStatus: null,
      generation: null,
      loading: false,
      error: err instanceof Error ? err.message : 'Failed to load tenant context',
    };
  }
}

// ============================================================
// Branching — επιλέγει loader με βάση το generation
// ============================================================

export async function resolveTenantContext(
  effectiveTenantId: string | null,
  isSuperAdmin: boolean,
): Promise<TenantContext> {
  // SA without selected tenant → no tenant context (tenant selector view)
  if (!effectiveTenantId) {
    return loadLegacyTenantContext(null, isSuperAdmin);
  }

  // Read generation from DB
  const metadata = await fetchTenantMetadata(effectiveTenantId);

  // Column doesn't exist / query failed → safe Gen1 (legacy)
  if (metadata.error || metadata.generation === 1) {
    return loadLegacyTenantContext(effectiveTenantId, isSuperAdmin);
  }

  // Generation >= 2 → Gen2 path
  return loadGen2TenantContext(effectiveTenantId, isSuperAdmin);
}
