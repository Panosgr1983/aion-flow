/*
  # AION Platform — Usage Telemetry (MT-2)
*/

CREATE TABLE IF NOT EXISTS usage_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       uuid        REFERENCES profiles(id),
  session_id    uuid,
  event_name    text        NOT NULL,
  event_version integer     NOT NULL DEFAULT 1,
  entity_type   text,
  entity_id     uuid,
  metadata      jsonb       NOT NULL DEFAULT '{}',
  source        text        NOT NULL DEFAULT 'dashboard'
                CHECK (source IN ('dashboard','public_site','api','worker','system')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ue_tenant_created ON usage_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ue_tenant_event  ON usage_events(tenant_id, event_name);
CREATE INDEX IF NOT EXISTS idx_ue_source_created ON usage_events(source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ue_session ON usage_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ue_created ON usage_events(created_at DESC);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_all_events"
  ON usage_events FOR ALL
  USING (is_super_admin());

CREATE POLICY "tenant_read_own_events"
  ON usage_events FOR SELECT
  USING (tenant_id = current_tenant_id());

-- ============================================================
-- Views for MT-3 Dashboard
-- ============================================================
CREATE OR REPLACE VIEW v_tenant_active_days AS
SELECT
  tenant_id,
  DATE_TRUNC('month', created_at) AS month,
  COUNT(DISTINCT DATE(created_at)) AS active_days,
  COUNT(*) AS total_events,
  MAX(created_at) AS last_activity
FROM usage_events
WHERE source NOT IN ('worker', 'system')
GROUP BY tenant_id, DATE_TRUNC('month', created_at);

CREATE OR REPLACE VIEW v_tenant_top_events AS
SELECT
  tenant_id,
  event_name,
  COUNT(*) AS event_count,
  MAX(created_at) AS last_seen
FROM usage_events
WHERE created_at > now() - INTERVAL '30 days'
  AND source NOT IN ('worker', 'system')
GROUP BY tenant_id, event_name
ORDER BY tenant_id, event_count DESC;
