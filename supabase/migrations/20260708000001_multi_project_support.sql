-- Add per-tenant Supabase project fields for multi-project support.
-- Each tenant can have its own Supabase project (data plane),
-- while AION Flow (control plane) keeps metadata in the shared project.

/*
  Multi-Project Support v0.1 — External Project Visibility

  Προσθέτει τη δυνατότητα tenants να έχουν δικό τους ανεξάρτητο Supabase project.
  Το AION Flow λειτουργεί ως control plane: βλέπει metadata, κάνει connection check,
  αλλά ΔΕΝ επεμβαίνει στο CMS editing (read-only για external projects).

  TODO:
    - Encrypted credentials / vault (όχι plaintext)
    - v0.2 — External CMS Read (project-aware adapters)
    - v0.3 — External CMS Write
------------------------------*/

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS supabase_project_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS supabase_anon_key text DEFAULT '',
  ADD COLUMN IF NOT EXISTS supabase_service_key text DEFAULT '',
  ADD COLUMN IF NOT EXISTS external_project_enabled boolean DEFAULT false;

/*
  ⚠️ Security note on supabase_service_key:
  Αποθηκεύεται στην shared DB για server-side χρήση (edge functions, automated operations).
  ΔΕΝ επιλέγεται/εκτίθεται ποτέ από frontend queries. Αν χρειαστεί service_role access
  σε external project, γίνεται πάντα μέσω API route ή Supabase Edge Function.
  Προς το παρόν, όλες οι client-side λειτουργίες χρησιμοποιούν μόνο anon_key.
*/

-- Index for fast lookup when switching project clients
CREATE INDEX IF NOT EXISTS idx_tenants_supabase_project ON tenants(supabase_project_url) WHERE supabase_project_url != '';

-- Enable external project for dionysis-xanthos tenant
UPDATE tenants SET external_project_enabled = true WHERE slug = 'dionysis-xanthos';
