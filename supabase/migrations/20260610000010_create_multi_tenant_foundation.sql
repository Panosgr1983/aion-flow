/*
  # AION Multi-Tenant Foundation
  - Tenant billing metadata
  - Tenant feature flags
  - Tenant settings
  - Super admin flag on profiles
*/

-- ============================================================
-- TENANTS: add billing + status columns
-- ============================================================
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'
    CHECK (status IN ('trial', 'active', 'suspended', 'cancelled')),
  ADD COLUMN IF NOT EXISTS plan_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS plan_price numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS renewal_date timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- ============================================================
-- TENANT FEATURES
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature text NOT NULL,
  enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, feature)
);

CREATE INDEX IF NOT EXISTS idx_tf_tenant ON tenant_features(tenant_id);

ALTER TABLE tenant_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage features"
  ON tenant_features FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- TENANT SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage tenant settings"
  ON tenant_settings FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- PROFILES: add is_super_admin
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;
