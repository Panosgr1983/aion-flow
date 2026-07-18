-- ============================================================
-- Seed: Tenant Features for existing tenants
-- Run after: 20260610000010_create_multi_tenant_foundation.sql
-- ============================================================

-- Kolokotronis (KOL-001)
INSERT INTO tenant_features (tenant_id, feature, enabled)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'cms', true),
  ('00000000-0000-0000-0000-000000000001', 'crm', true)
ON CONFLICT (tenant_id, feature) DO NOTHING;

-- Ktima Kareli (KAR-001)
INSERT INTO tenant_features (tenant_id, feature, enabled)
VALUES
  ('a6a0e182-2e86-4b3a-9601-b055e56a605e', 'cms', true),
  ('a6a0e182-2e86-4b3a-9601-b055e56a605e', 'portfolio_module', true),
  ('a6a0e182-2e86-4b3a-9601-b055e56a605e', 'retreat_module', true),
  ('a6a0e182-2e86-4b3a-9601-b055e56a605e', 'locale_module', true),
  ('a6a0e182-2e86-4b3a-9601-b055e56a605e', 'retreat_booking', true)
ON CONFLICT (tenant_id, feature) DO NOTHING;

-- Melisa (MEL-001) — trial, base CMS only
INSERT INTO tenant_features (tenant_id, feature, enabled)
VALUES
  ('00000000-0000-0000-0000-000000000098', 'cms', true)
ON CONFLICT (tenant_id, feature) DO NOTHING;

-- Angelus (ANG-001) — trial, base CMS only
INSERT INTO tenant_features (tenant_id, feature, enabled)
VALUES
  ('00000000-0000-0000-0000-000000000097', 'cms', true)
ON CONFLICT (tenant_id, feature) DO NOTHING;

-- Dionysis Xanthos (XAN-001) — CMS Pro, artist module
INSERT INTO tenant_features (tenant_id, feature, enabled)
VALUES
  ('7ef615ef-82d1-4215-8545-0792569f183a', 'cms', true),
  ('7ef615ef-82d1-4215-8545-0792569f183a', 'artist_module', true)
ON CONFLICT (tenant_id, feature) DO NOTHING;

-- AION Internal (AIO-001) — full platform access
INSERT INTO tenant_features (tenant_id, feature, enabled)
VALUES
  ('00000000-0000-0000-0000-000000000099', 'cms', true),
  ('00000000-0000-0000-0000-000000000099', 'crm', true),
  ('00000000-0000-0000-0000-000000000099', 'inbox', true),
  ('00000000-0000-0000-0000-000000000099', 'pipeline', true),
  ('00000000-0000-0000-0000-000000000099', 'email_workspace', true),
  ('00000000-0000-0000-0000-000000000099', 'eshop', true),
  ('00000000-0000-0000-0000-000000000099', 'bookings', true),
  ('00000000-0000-0000-0000-000000000099', 'portfolio_module', true),
  ('00000000-0000-0000-0000-000000000099', 'artist_module', true),
  ('00000000-0000-0000-0000-000000000099', 'retreat_module', true),
  ('00000000-0000-0000-0000-000000000099', 'locale_module', true),
  ('00000000-0000-0000-0000-000000000099', 'retreat_booking', true)
ON CONFLICT (tenant_id, feature) DO NOTHING;
