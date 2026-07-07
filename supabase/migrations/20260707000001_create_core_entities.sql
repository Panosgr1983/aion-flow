-- Create core_entities table for structured organizational data
CREATE TABLE IF NOT EXISTS core_entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'business_information', 'branding', 'seo', 'navigation', 'social', 'legal', 'analytics'
  )),
  data JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, entity_type)
);

-- History/versioning table for rollback support
CREATE TABLE IF NOT EXISTS core_entity_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID REFERENCES core_entities(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  data JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE core_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_entity_versions ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "tenant_isolation_core_entities_select"
  ON core_entities FOR SELECT
  USING (tenant_id = (SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'selected_tenant_id'),
    (current_setting('request.jwt.claims', true)::json->>'tenant_id'),
    '00000000-0000-0000-0000-000000000001'
  )::uuid));

CREATE POLICY "tenant_isolation_core_entities_insert"
  ON core_entities FOR INSERT
  WITH CHECK (tenant_id = (SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'selected_tenant_id'),
    (current_setting('request.jwt.claims', true)::json->>'tenant_id'),
    '00000000-0000-0000-0000-000000000001'
  )::uuid));

CREATE POLICY "tenant_isolation_core_entities_update"
  ON core_entities FOR UPDATE
  USING (tenant_id = (SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'selected_tenant_id'),
    (current_setting('request.jwt.claims', true)::json->>'tenant_id'),
    '00000000-0000-0000-0000-000000000001'
  )::uuid));

CREATE POLICY "tenant_isolation_core_entities_delete"
  ON core_entities FOR DELETE
  USING (tenant_id = (SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'selected_tenant_id'),
    (current_setting('request.jwt.claims', true)::json->>'tenant_id'),
    '00000000-0000-0000-0000-000000000001'
  )::uuid));

-- Version history policies (read-only for non-admins)
CREATE POLICY "tenant_isolation_versions_select"
  ON core_entity_versions FOR SELECT
  USING (tenant_id = (SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'selected_tenant_id'),
    (current_setting('request.jwt.claims', true)::json->>'tenant_id'),
    '00000000-0000-0000-0000-000000000001'
  )::uuid));

CREATE POLICY "tenant_isolation_versions_insert"
  ON core_entity_versions FOR INSERT
  WITH CHECK (tenant_id = (SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'selected_tenant_id'),
    (current_setting('request.jwt.claims', true)::json->>'tenant_id'),
    '00000000-0000-0000-0000-000000000001'
  )::uuid));
