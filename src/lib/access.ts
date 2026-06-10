import { TenantFeature } from '../types/supabase';

type FeatureMap = Record<string, boolean>;

/**
 * Checks if a feature is enabled for the current user/tenant.
 * isSuperAdmin bypasses all checks.
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
 * Checks if tenant is in a usable state.
 */
export function isTenantActive(status?: string): boolean {
  return status === 'active' || status === 'trial';
}

/**
 * Feature permission constants for route/component gating.
 */
export const FEATURE_MODULES: Record<string, TenantFeature> = {
  services: 'cms',
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
};
