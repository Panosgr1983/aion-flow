/*
  # Fix Usage Dashboard Views (MT-3)

  Δημιουργεί τα views που χρησιμοποιεί το Usage Dashboard:
    - v_churn_risk
    - v_tenant_active_days
    - v_tenant_top_events

  Σημείωση: Χρησιμοποιούμε DROP + CREATE αντί για CREATE OR REPLACE
  γιατί αλλάζουν column types/names.
*/

DROP VIEW IF EXISTS v_churn_risk CASCADE;
DROP VIEW IF EXISTS v_tenant_active_days CASCADE;
DROP VIEW IF EXISTS v_tenant_top_events CASCADE;

-- ============================================================
-- v_churn_risk: ανάλυση ρίσκου ανά tenant (30-day window)
-- ============================================================
CREATE VIEW v_churn_risk AS
WITH last_events AS (
  SELECT
    tenant_id,
    MAX(created_at) AS last_activity,
    COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '30 days') AS total_events_30d,
    COUNT(DISTINCT DATE(created_at)) FILTER (WHERE created_at > now() - INTERVAL '30 days') AS active_days_30d
  FROM usage_events
  WHERE source NOT IN ('worker', 'system')
  GROUP BY tenant_id
)
SELECT
  t.id AS tenant_id,
  t.name AS tenant_name,
  t.slug,
  t.status,
  t.industry,
  le.last_activity,
  EXTRACT(DAY FROM now() - le.last_activity)::int AS days_since_last_activity,
  COALESCE(le.active_days_30d, 0)::int AS active_days_30d,
  COALESCE(le.total_events_30d, 0)::int AS total_events_30d,
  CASE
    WHEN le.last_activity IS NULL THEN 'inactive'
    WHEN EXTRACT(DAY FROM now() - le.last_activity) >= 30 THEN 'inactive'
    WHEN EXTRACT(DAY FROM now() - le.last_activity) >= 14 THEN 'critical'
    WHEN EXTRACT(DAY FROM now() - le.last_activity) >= 7  THEN 'warning'
    WHEN le.active_days_30d >= 15                          THEN 'healthy'
    WHEN le.active_days_30d >= 5                           THEN 'attention'
    ELSE 'warning'
  END AS churn_risk,
  CASE
    WHEN le.last_activity IS NULL THEN 'Νέος — χωρίς δραστηριότητα'
    WHEN EXTRACT(DAY FROM now() - le.last_activity) >= 30 THEN 'Ανενεργός >30 ημέρες'
    WHEN EXTRACT(DAY FROM now() - le.last_activity) >= 14 THEN 'Σε κρίσιμο κίνδυνο'
    WHEN EXTRACT(DAY FROM now() - le.last_activity) >= 7  THEN 'Σε κίνδυνο'
    WHEN le.active_days_30d >= 15                          THEN 'Ενεργός χρήστης'
    WHEN le.active_days_30d >= 5                           THEN 'Μέτρια δραστηριότητα'
    ELSE 'Χαμηλή δραστηριότητα'
  END AS engagement_level
FROM tenants t
LEFT JOIN last_events le ON le.tenant_id = t.id;

-- ============================================================
-- v_tenant_active_days: με tenant name
-- ============================================================
CREATE VIEW v_tenant_active_days AS
SELECT
  ue.tenant_id,
  t.name AS tenant_name,
  DATE_TRUNC('month', ue.created_at) AS month,
  COUNT(DISTINCT DATE(ue.created_at))::int AS active_days,
  COUNT(*)::int AS total_events,
  MAX(ue.created_at) AS last_activity
FROM usage_events ue
JOIN tenants t ON t.id = ue.tenant_id
WHERE ue.source NOT IN ('worker', 'system')
GROUP BY ue.tenant_id, t.name, DATE_TRUNC('month', ue.created_at);

-- ============================================================
-- v_tenant_top_events: με tenant name
-- ============================================================
CREATE VIEW v_tenant_top_events AS
SELECT
  ue.tenant_id,
  t.name AS tenant_name,
  ue.event_name,
  COUNT(*)::int AS event_count,
  MAX(ue.created_at) AS last_seen
FROM usage_events ue
JOIN tenants t ON t.id = ue.tenant_id
WHERE ue.created_at > now() - INTERVAL '30 days'
  AND ue.source NOT IN ('worker', 'system')
GROUP BY ue.tenant_id, t.name, ue.event_name
ORDER BY ue.tenant_id, event_count DESC;
