-- ============================================================
-- AION CMS Versioning Engine v1.0
-- 2026-06-09
-- ============================================================

-- Per-change version tracking
CREATE TABLE IF NOT EXISTS content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  table_name TEXT NOT NULL,
  record_id UUID,
  entity_name TEXT,
  operation TEXT NOT NULL CHECK (operation IN ('create','update','delete','restore','backup')),
  changed_fields JSONB,
  snapshot_before JSONB,
  snapshot_after JSONB,
  restored_from_history_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  summary TEXT,
  user_id TEXT,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_tenant ON content_history(tenant_id, table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_created ON content_history(created_at DESC);

-- Full-site backup snapshots
CREATE TABLE IF NOT EXISTS content_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT,
  snapshot JSONB,
  snapshot_version INTEGER DEFAULT 1,
  size_bytes BIGINT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backups_tenant ON content_backups(tenant_id, created_at DESC);

-- RLS: only authenticated users (signed-in CMS admins)
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_backups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'content_history' AND policyname = 'authenticated_all'
  ) THEN
    CREATE POLICY authenticated_all ON content_history
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'content_backups' AND policyname = 'authenticated_all'
  ) THEN
    CREATE POLICY authenticated_all ON content_backups
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
