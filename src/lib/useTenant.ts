/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Tenant Context Hook
  
  Διαβάζει το tenant context από τα JWT claims 
  (injected από custom_access_token_hook στο Supabase Auth).
  
  Τα claims περιλαμβάνουν:
    - tenant_id     → Σε ποιο tenant ανήκει ο χρήστης
    - role          → admin / editor / sales / viewer
    - is_super_admin → Bypass όλων των ελέγχων
  
  Χρησιμοποιείται από:
    - AdminSidebar  → Feature-based nav hiding
    - Dashboard     → Suspension banner
    - Route guards  → Feature protection
  ═══════════════════════════════════════════════════════════════
*/

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/** Δομή tenant context που επιστρέφει το hook */
interface TenantState {
  isSuperAdmin: boolean;              // Αν ο χρήστης bypasses όλους τους ελέγχους
  tenantId: string | null;            // UUID του tenant (null για super admins)
  featureMap: Record<string, boolean> | null;  // Ενεργά features (π.χ. {cms: true, crm: false})
  tenantStatus: string | null;        // active / suspended / cancelled
  loading: boolean;
}

/**
 * Διαβάζει tenant context από JWT claims.
 * 
 * Τα claims μπαίνουν στο JWT από το Supabase Access Token Hook
 * (custom_access_token_hook, migration 11).
 * 
 * Για demo mode χωρίς JWT, επιστρέφει default (isSuperAdmin=false).
 */
export function useTenant(): TenantState {
  const { user, isDemoMode } = useAuth();
  const [state, setState] = useState<TenantState>({
    isSuperAdmin: false,
    tenantId: null,
    featureMap: null,
    tenantStatus: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState(s => ({ ...s, loading: false }));
      return;
    }
    setState(s => ({ ...s, loading: true }));

    // Διάβασμα claims από το JWT (custom_access_token_hook τα injects)
    const { data } = user as any;
    const jwtRole = data?.role as string | undefined;
    const jwtTenantId = data?.tenant_id as string | undefined;
    const jwtSuperAdmin = data?.is_super_admin as boolean | undefined;

    const isSuperAdmin = jwtSuperAdmin === true;
    const tenantId = jwtTenantId || null;

    // Για super admins, όλα τα features είναι ενεργά
    const featureMap: Record<string, boolean> = isSuperAdmin
      ? { cms: true, crm: true, inbox: true, pipeline: true, email_workspace: true, eshop: true, bookings: true }
      : null;

    setState({
      isSuperAdmin,
      tenantId,
      featureMap,
      tenantStatus: 'active',
      loading: false,
    });
  }, [user, isDemoMode]);

  return state;
}
