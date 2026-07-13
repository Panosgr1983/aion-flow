/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Tenant Context Hook (Phase 3A)

  Διαβάζει το tenant context με branching βάσει generation:
    - Gen1 (Legacy): loadLegacyTenantContext — frozen current behavior
    - Gen2 (Next Gen): loadGen2TenantContext — real status + features

  Πηγές:
    1. JWT claims (fast path — custom_access_token_hook)
    2. Profiles table (fallback — direct DB query)
    3. Auto-upsert profile (τελευταία προσπάθεια)

  CRITICAL INVARIANT:
    Ο Κολοκοτρώνης (Gen1) πρέπει να έχει ακριβώς το ίδιο
    observable behavior μετά από κάθε αλλαγή shared code.
  ═══════════════════════════════════════════════════════════════
*/

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenantContext } from './TenantContext';
import { supabase } from './supabase';
import { resolveTenantContext, TenantContext } from './loadTenantContext';
import { switchToProject } from './multiProjectClient';

/** Δομή tenant context που επιστρέφει το hook */
export type TenantState = TenantContext;

/**
 * Διαβάζει tenant context από JWT claims + TenantContext.
 * Fallback: αν τα JWT claims δεν είναι διαθέσιμα, κάνει απευθείας
 * ερώτημα στο profiles table.
 * Αν δεν υπάρχει profile, το δημιουργεί (upsert).
 */
async function fetchProfile(userId: string): Promise<{ is_super_admin: boolean; tenant_id: string | null; role: string | null }> {
  // Προσπάθεια 1: απλό select
  const { data } = await supabase
    .from('profiles')
    .select('is_super_admin, tenant_id, role')
    .eq('id', userId)
    .maybeSingle();

  if (data) {
    return { is_super_admin: !!data.is_super_admin, tenant_id: data.tenant_id, role: data.role };
  }

  // Προσπάθεια 2: upsert profile (δεν υπάρχει ακόμα)
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (authUser?.email) {
    await supabase
      .from('profiles')
      .upsert({ id: userId, email: authUser.email, role: 'admin' }, { onConflict: 'id' })
      .maybeSingle();
  }

  // Προσπάθεια 3: select μετά το upsert
  const { data: retry } = await supabase
    .from('profiles')
    .select('is_super_admin, tenant_id, role')
    .eq('id', userId)
    .maybeSingle();

  return { is_super_admin: !!retry?.is_super_admin, tenant_id: retry?.tenant_id ?? null, role: retry?.role ?? null };
}

export function useTenant(): TenantState {
  const { user, isDemoMode } = useAuth();
  const { selectedTenantId, setSelectedTenantId } = useTenantContext();
  const [state, setState] = useState<TenantState>({
    isSuperAdmin: false,
    tenantId: null,
    effectiveTenantId: null,
    featureMap: null,
    tenantStatus: null,
    generation: null,
    loading: true,
    error: null,
  });

  const KNOWN_SUPER_ADMIN_EMAILS = ['info@aionweb.gr', 'choliasmenos.panos@gmail.com'];

  useEffect(() => {
    if (!user) {
      setState(s => ({ ...s, loading: false }));
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));

    const u = user as any;
    const userEmail = u.email as string | undefined;

    // Try 1: JWT claims (from custom_access_token_hook)
    const jwtSuperAdmin = u.is_super_admin === true || u.app_metadata?.is_super_admin === true;
    const jwtTenantId: string | undefined = u.tenant_id || u.app_metadata?.tenant_id || undefined;
    const knownSuperAdmin = !!userEmail && KNOWN_SUPER_ADMIN_EMAILS.includes(userEmail);

    if (jwtSuperAdmin || knownSuperAdmin) {
      // Sync TenantContext state with localStorage (stale after SIGNED_IN clears it)
      const lsTenantId = (() => { try { return localStorage.getItem('aion_selected_tenant'); } catch { return null; } })();
      if (selectedTenantId !== lsTenantId) {
        setSelectedTenantId(lsTenantId);
        return;
      }
      // Auto-assign super admin in DB for known emails (persists for next login)
      if (knownSuperAdmin && !jwtSuperAdmin) {
        supabase.from('profiles').update({ is_super_admin: true }).eq('id', user.id);
      }
      // SA path: resolve via generation-based branching
      resolveTenantContext(selectedTenantId || null, true).then((ctx) =>
        switchToProject(ctx.effectiveTenantId).catch(() => {}).then(() => setState(ctx))
      );
      return;
    }

    // Try 2: Fallback — fetch/upsert profile from DB
    fetchProfile(user.id).then(({ is_super_admin, tenant_id }) => {
      const isSuperAdmin = is_super_admin || jwtSuperAdmin;
      const effectiveTenantId = isSuperAdmin
        ? selectedTenantId
        : (tenant_id || jwtTenantId || null);

      resolveTenantContext(effectiveTenantId, isSuperAdmin).then((ctx) =>
        switchToProject(ctx.effectiveTenantId).catch(() => {}).then(() => setState(ctx))
      );
    });
  }, [user, isDemoMode, selectedTenantId]);

  return state;
}
