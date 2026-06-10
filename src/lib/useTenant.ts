import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../contexts/AuthContext';
import { TenantFeature, TenantFeatureEntry } from '../types/supabase';

interface TenantState {
  isSuperAdmin: boolean;
  tenantId: string | null;
  featureMap: Record<string, boolean> | null;
  tenantStatus: string | null;
  loading: boolean;
}

export function useTenant(): TenantState {
  const { user } = useAuth();
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
    (async () => {
      try {
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_super_admin, tenant_id')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile) {
          setState({ isSuperAdmin: false, tenantId: null, featureMap: null, tenantStatus: null, loading: false });
          return;
        }

        const isSuperAdmin = profile.is_super_admin === true;
        let tenantId: string | null = profile.tenant_id;

        // If super admin with no tenant, or tenant specified, load features
        let featureMap: Record<string, boolean> | null = null;
        let tenantStatus: string | null = null;

        if (isSuperAdmin) {
          // Super admins have all features
          featureMap = { cms: true, crm: true, inbox: true, pipeline: true, email_workspace: true, eshop: true, bookings: true };
        } else if (tenantId) {
          // Load features for this tenant
          const { data: features } = await supabase
            .from('tenant_features')
            .select('feature, enabled')
            .eq('tenant_id', tenantId);

          if (features) {
            featureMap = {};
            (features as TenantFeatureEntry[]).forEach(f => { featureMap[f.feature] = f.enabled; });
          }

          // Load tenant status
          const { data: tenant } = await supabase
            .from('tenants')
            .select('status')
            .eq('id', tenantId)
            .maybeSingle();
          tenantStatus = tenant?.status || null;
        }

        setState({ isSuperAdmin, tenantId, featureMap, tenantStatus, loading: false });
      } catch {
        setState({ isSuperAdmin: false, tenantId: null, featureMap: null, tenantStatus: null, loading: false });
      }
    })();
  }, [user]);

  return state;
}
