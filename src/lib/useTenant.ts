import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TenantFeatureEntry } from '../types/supabase';

interface TenantState {
  isSuperAdmin: boolean;
  tenantId: string | null;
  featureMap: Record<string, boolean> | null;
  tenantStatus: string | null;
  loading: boolean;
}

/**
 * Reads tenant context from JWT claims (injected by custom_access_token_hook).
 * Falls back to DB query if JWT claims aren't available (e.g., demo mode).
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

    // Try to get claims from JWT (available when custom_access_token_hook is active)
    const { data } = user as any;
    const jwtRole = data?.role as string | undefined;
    const jwtTenantId = data?.tenant_id as string | undefined;
    const jwtSuperAdmin = data?.is_super_admin as boolean | undefined;

    // Build result
    const isSuperAdmin = jwtSuperAdmin === true;
    const tenantId = jwtTenantId || null;

    // For super admins, all features are available
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
