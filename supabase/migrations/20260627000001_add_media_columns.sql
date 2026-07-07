/*
  # AION v0.2 — Media Table Refactor
    - Προσθήκη tenant_id, category, source, metadata columns
    - Ενημέρωση RLS policies για tenant isolation
    - Indexes για απόδοση
*/

-- ============================================================
-- NEW COLUMNS
-- ============================================================
ALTER TABLE media
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'editor',
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS path text DEFAULT '',
  ADD COLUMN IF NOT EXISTS storage_bucket text DEFAULT '';

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_media_tenant ON media(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_source ON media(source);
CREATE INDEX IF NOT EXISTS idx_media_tenant_category ON media(tenant_id, category);

-- ============================================================
-- TENANT-AWARE RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view media" ON media;
DROP POLICY IF EXISTS "Authenticated users can insert media" ON media;
DROP POLICY IF EXISTS "Authenticated users can update media" ON media;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON media;

-- SELECT: own tenant or super admin or no tenant (legacy)
CREATE POLICY "media_select_tenant"
  ON media FOR SELECT
  TO authenticated
  USING (
    tenant_id IS NULL
    OR current_tenant_id() IS NULL
    OR tenant_id = current_tenant_id()
    OR public.is_super_admin()
  );

-- INSERT: own tenant or super admin
CREATE POLICY "media_insert_tenant"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IS NULL
    OR tenant_id = current_tenant_id()
    OR public.is_super_admin()
  );

-- UPDATE: own tenant or super admin
CREATE POLICY "media_update_tenant"
  ON media FOR UPDATE
  TO authenticated
  USING (
    tenant_id IS NULL
    OR tenant_id = current_tenant_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    tenant_id IS NULL
    OR tenant_id = current_tenant_id()
    OR public.is_super_admin()
  );

-- DELETE: own tenant or super admin
CREATE POLICY "media_delete_tenant"
  ON media FOR DELETE
  TO authenticated
  USING (
    tenant_id IS NULL
    OR tenant_id = current_tenant_id()
    OR public.is_super_admin()
  );
