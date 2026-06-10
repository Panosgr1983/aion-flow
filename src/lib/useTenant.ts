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
import { useTenantContext } from './TenantContext';

/** Δομή tenant context που επιστρέφει το hook */
interface TenantState {
  isSuperAdmin: boolean;              // Αν ο χρήστης bypasses όλους τους ελέγχους
  tenantId: string | null;            // UUID του tenant (null για super admins)
  featureMap: Record<string, boolean> | null;  // Ενεργά features (π.χ. {cms: true, crm: false})
  tenantStatus: string | null;        // active / suspended / cancelled
  loading: boolean;
}

/**
 * Διαβάζει tenant context από JWT claims + TenantContext.
 * 
 * Για super admin: το tenantId προέρχεται από το selectedTenantId
 * του TenantContext (Project Switcher). Αν δεν έχει επιλέξει,
 * χρησιμοποιεί το JWT tenant_id (null = όλοι οι tenants).
 * 
 * Για κανονικούς χρήστες: χρησιμοποιεί το tenant_id από το JWT.
 */
export function useTenant(): TenantState {
  const { user, isDemoMode } = useAuth();
  const { selectedTenantId } = useTenantContext();
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

    const { data } = user as any;
    const jwtSuperAdmin = data?.is_super_admin as boolean | undefined;
    const jwtTenantId = data?.tenant_id as string | undefined;

    const isSuperAdmin = jwtSuperAdmin === true;

    // Για super admin: χρησιμοποιώ το selectedTenantId αν υπάρχει
    // Αλλιώς JWT tenant_id (null = όλοι)
    const tenantId = isSuperAdmin ? (selectedTenantId || jwtTenantId || null) : (jwtTenantId || null);

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
  }, [user, isDemoMode, selectedTenantId]);

  return state;
}
