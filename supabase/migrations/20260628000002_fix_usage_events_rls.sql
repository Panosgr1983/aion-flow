/*
  # Fix Usage Events RLS — allow tenant inserts

  Το usage_events table είχε RLS policies μόνο για:
    - super_admin: FOR ALL (INSERT/SELECT/UPDATE/DELETE)
    - tenant: FOR SELECT (μόνο ανάγνωση)

  Οι tenant χρήστες δεν μπορούσαν να κάνουν INSERT,
  οπότε τα trackEvent() αποτύγχαναν σιωπηλά.

  Προσθέτουμε: tenant_insert_own_events
    - Επιτρέπει INSERT σε authenticated users
    - Μόνο αν tenant_id = current_tenant_id() (από JWT)
*/

CREATE POLICY "tenant_insert_own_events"
  ON usage_events FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = current_tenant_id());
