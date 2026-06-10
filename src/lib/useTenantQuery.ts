/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Tenant-Aware Query Helper
  
  Χρησιμοποιείται από dataHelpers για να φιλτράρει queries
  με βάση το selectedTenantId του TenantContext.
  
  Για super admin:
    - Αν έχει επιλεγεί tenant → προσθέτει .eq('tenant_id', id)
    - Αν δεν έχει επιλεγεί → χωρίς φίλτρο (βλέπει όλους)
  
  Για κανονικό χρήστη:
    - Πάντα φιλτράρει με το JWT tenant_id
  
  Όλα τα tenant-aware queries περνάνε από εδώ,
  ώστε ο κώδικας να ζει σε ένα σημείο.
  ═══════════════════════════════════════════════════════════════
*/

import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { getCurrentTenantContext } from './TenantContext';

/**
 * Προσθέτει tenant_id filter σε ένα Supabase query builder.
 * 
 * Χρήση:
 *   const q = supabase.from('services').select('*')
 *   const { data } = await withTenant(q)
 */
export function withTenant<T extends PostgrestFilterBuilder<any, any, any, any, any>>(
  query: T,
  tenantColumn: string = 'tenant_id',
): T {
  const tenantId = getCurrentTenantContext();
  if (tenantId) {
    return (query as any).eq(tenantColumn, tenantId) as T;
  }
  return query;
}
