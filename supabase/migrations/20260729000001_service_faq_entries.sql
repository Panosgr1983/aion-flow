-- AKR-KOL-PB-001: Service FAQ Entries
-- Tenant-aware FAQ per service with ordering, RLS, and audit triggers

-- ============================================================
-- PART 1: Create service_faq_entries table
-- ============================================================
CREATE TABLE IF NOT EXISTS service_faq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT service_faq_non_empty_question CHECK (length(trim(question)) > 0),
  CONSTRAINT service_faq_non_empty_answer CHECK (length(trim(answer)) > 0)
);

-- ============================================================
-- PART 2: Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_service_faq_lookup
  ON service_faq_entries (
    tenant_id,
    service_id,
    is_active,
    sort_order
  );

-- ============================================================
-- PART 3: Enable RLS
-- ============================================================
ALTER TABLE service_faq_entries ENABLE ROW LEVEL SECURITY;

-- Authenticated CMS users can insert
CREATE POLICY "auth_insert_service_faq_entries" ON service_faq_entries
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated CMS users can select
CREATE POLICY "auth_select_service_faq_entries" ON service_faq_entries
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated CMS users can update
CREATE POLICY "auth_update_service_faq_entries" ON service_faq_entries
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Authenticated CMS users can delete
CREATE POLICY "auth_delete_service_faq_entries" ON service_faq_entries
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Public site (anon key) can view only active entries
CREATE POLICY "public_select_service_faq_entries" ON service_faq_entries
  FOR SELECT
  USING (is_active = true);

-- ============================================================
-- PART 4: Trigger to auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_service_faq_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_service_faq_entries_updated_at ON service_faq_entries;
CREATE TRIGGER trigger_service_faq_entries_updated_at
  BEFORE UPDATE ON service_faq_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_service_faq_entries_updated_at();

-- ============================================================
-- PART 5: Row-level tenant consistency check
-- Prevents FAQ entry with tenant_id different from service's tenant
-- ============================================================
CREATE OR REPLACE FUNCTION check_service_faq_tenant_consistency()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id != (SELECT tenant_id FROM services WHERE id = NEW.service_id) THEN
    RAISE EXCEPTION 'FAQ entry tenant_id must match the service tenant_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_service_faq_tenant_check ON service_faq_entries;
CREATE TRIGGER trigger_service_faq_tenant_check
  BEFORE INSERT OR UPDATE ON service_faq_entries
  FOR EACH ROW
  EXECUTE FUNCTION check_service_faq_tenant_consistency();

-- ============================================================
-- PART 6: Rollback
-- ============================================================
-- To rollback:
-- DROP TRIGGER IF EXISTS trigger_service_faq_tenant_check ON service_faq_entries;
-- DROP FUNCTION IF EXISTS check_service_faq_tenant_consistency();
-- DROP TRIGGER IF EXISTS trigger_service_faq_entries_updated_at ON service_faq_entries;
-- DROP FUNCTION IF EXISTS update_service_faq_entries_updated_at();
-- DROP TABLE IF EXISTS service_faq_entries CASCADE;
