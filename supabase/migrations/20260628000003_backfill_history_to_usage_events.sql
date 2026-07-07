/*
  # Backfill content_history → usage_events

  Αντιγράφει όλες τις υπάρχουσες εγγραφές content_history
  στο usage_events, ώστε να φανούν στο Usage Dashboard.
  Χρησιμοποιεί content_history_id στο metadata για dedup.
*/

INSERT INTO usage_events (
  tenant_id,
  user_id,
  event_name,
  event_version,
  entity_type,
  entity_id,
  metadata,
  source,
  created_at
)
SELECT
  ch.tenant_id,
  CASE WHEN ch.user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       THEN ch.user_id::uuid ELSE NULL
  END,
  'cms.history_entry',
  1,
  ch.table_name,
  ch.record_id,
  jsonb_build_object(
    'operation', ch.operation,
    'table_name', ch.table_name,
    'summary', ch.summary,
    'changed_fields', ch.changed_fields,
    'content_history_id', ch.id
  ),
  'system',
  ch.created_at
FROM content_history ch
WHERE NOT EXISTS (
  SELECT 1 FROM usage_events ue
  WHERE ue.metadata->>'content_history_id' = ch.id::text
);
