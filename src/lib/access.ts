/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Access Control Layer
  
  Ελέγχει αν ένας χρήστης έχει πρόσβαση σε ένα feature,
  συνδυάζοντας:
    1. Tenant status (active/suspended/cancelled)
    2. is_super_admin (bypass)
    3. featureMap (tenant_features)
  
  Κάθε route/module αντιστοιχίζεται σε ένα TenantFeature
  μέσω του FEATURE_MODULES map.
  ═══════════════════════════════════════════════════════════════
*/

import { TenantFeature } from '../types/supabase';

type FeatureMap = Record<string, boolean>;

/**
 * Ελέγχει αν ένα feature είναι ενεργό για τον τρέχοντα χρήστη/tenant.
 * 
 * Σειρά ελέγχου:
 * 1. Αν ο tenant είναι suspended/cancelled → block
 * 2. Αν ο χρήστης είναι super_admin → bypass (true)
 * 3. Αν δεν υπάρχει featureMap → false
 * 4. Έλεγχος featureMap[feature]
 */
export function canAccess(
  feature: TenantFeature,
  isSuperAdmin: boolean,
  featureMap: FeatureMap | null,
  tenantStatus?: string,
): boolean {
  if (tenantStatus === 'suspended' || tenantStatus === 'cancelled') return false;
  if (isSuperAdmin) return true;
  if (!featureMap) return false;
  return featureMap[feature] === true;
}

/**
 * Ελέγχει αν ο tenant είναι σε λειτουργική κατάσταση.
 * Επιτρέπονται: active, trial
 */
export function isTenantActive(status?: string): boolean {
  return status === 'active' || status === 'trial';
}

/**
 * Αντιστοίχηση URL path → TenantFeature.
 * Χρησιμοποιείται από το Sidebar για απόκρυψη modules
 * και από Route Guards για ανακατεύθυνση.
 * 
 * Π.χ. το path "services" αντιστοιχεί στο feature "cms".
 * Αν "cms" είναι false για τον tenant, το module κρύβεται.
 */
export const FEATURE_MODULES: Record<string, TenantFeature> = {  services: 'cms',
  blog: 'cms',
  testimonials: 'cms',
  credentials: 'cms',
  coreValues: 'cms',
  about: 'cms',
  cta: 'cms',
  pages: 'cms',
  media: 'cms',
  siteSettings: 'cms',
  inbox: 'inbox',
  pipeline: 'pipeline',
  emailWorkspace: 'email_workspace',
  products: 'eshop',
  orders: 'eshop',
  customers: 'eshop',
  categories: 'eshop',
  // Portfolio Module (via Module Registry)
  'portfolio': 'portfolio_module',
};
