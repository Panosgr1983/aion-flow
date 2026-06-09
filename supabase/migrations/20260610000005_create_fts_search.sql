/*
  # AION CRM — Full Text Search for Inbox
*/

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('greek', coalesce(message, '') || ' ' || coalesce(subject, '') || ' ' || coalesce(name, '') || ' ' || coalesce(email, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_messages_search ON contact_messages USING GIN(search_vector);

CREATE OR REPLACE FUNCTION search_contact_messages(query text)
RETURNS SETOF contact_messages AS $$
  SELECT * FROM contact_messages
  WHERE search_vector @@ plainto_tsquery('greek', query)
  ORDER BY ts_rank(search_vector, plainto_tsquery('greek', query)) DESC;
$$ LANGUAGE sql STABLE;
