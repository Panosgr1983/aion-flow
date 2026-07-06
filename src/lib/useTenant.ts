/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Tenant Context Hook

  Διαβάζει το tenant context:
    1. Από JWT claims (fast path — custom_access_token_hook)
    2. Από profiles table (fallback — direct DB query)
    3. Auto-upsert profile αν δεν υπάρχει (τελευταία προσπάθεια)

  Τα JWT claims περιλαμβάνουν:
    - tenant_id     → Σε ποιο tenant ανήκει ο χρήστης
    - role          → admin / editor / sales / viewer
    - is_super_admin → Bypass όλων των ελέγχων

  Χρησιμοποιείται από:
    - AdminSidebar  → Feature-based nav hiding
    - Dashboard     → Suspension banner + TenantSelector
    - Route guards  → Feature protection
  ═══════════════════════════════════════════════════════════════
*/

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenantContext } from './TenantContext';
import { supabase } from './supabase';

/** Δομή tenant context που επιστρέφει το hook */
interface TenantState {
  isSuperAdmin: boolean;
  /** Για SA: selectedTenantId || null. Για μη-SA: tenant_id από JWT/profile */
  tenantId: string | null;
  /**
   * Το tenant ID που πρέπει να χρησιμοποιούν ΟΛΑ τα components
   * για φιλτράρισμα περιεχομένου, uploads, queries κλπ.
   *
   *   SA  → selectedTenantId (από TenantContext / Project Switcher)
   *   μη-SA → tenantId (από JWT claims ή profiles table)
   */
  effectiveTenantId: string | null;
  featureMap: Record<string, boolean> | null;
  tenantStatus: string | null;
  loading: boolean;
}

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
    loading: true,
  });

  const KNOWN_SUPER_ADMIN_EMAILS = ['info@aionweb.gr', 'choliasmenos.panos@gmail.com'];

  useEffect(() => {
    if (!user) {
      setState(s => ({ ...s, loading: false }));
      return;
    }
    setState(s => ({ ...s, loading: true }));

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
      setState({
        isSuperAdmin: true,
        tenantId: selectedTenantId || null,
        effectiveTenantId: selectedTenantId || null,
        featureMap: { cms: true, crm: true, inbox: true, pipeline: true, email_workspace: true, eshop: true, bookings: true },
        tenantStatus: 'active',
        loading: false,
      });
      return;
    }

    // Try 2: Fallback — fetch/upsert profile from DB
    fetchProfile(user.id).then(({ is_super_admin, tenant_id }) => {
      const isSuperAdmin = is_super_admin || jwtSuperAdmin;
      const tenantId = isSuperAdmin
        ? (selectedTenantId || null)  // SA: never auto-attach to personal tenant
        : (tenant_id || jwtTenantId || null);
      const effectiveTenantId = isSuperAdmin
        ? selectedTenantId
        : (tenant_id || jwtTenantId || null);

      setState({
        isSuperAdmin,
        tenantId,
        effectiveTenantId,
        featureMap: isSuperAdmin
          ? { cms: true, crm: true, inbox: true, pipeline: true, email_workspace: true, eshop: true, bookings: true }
          : null,
        tenantStatus: 'active',
        loading: false,
      });
    });
  }, [user, isDemoMode, selectedTenantId]);

  return state;
}
