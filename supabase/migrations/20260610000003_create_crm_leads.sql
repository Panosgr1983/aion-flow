/*
  # AION CRM — Leads Pipeline

  Adds lead tracking fields to contact_conversations.
*/

ALTER TABLE contact_conversations
  ADD COLUMN IF NOT EXISTS lead_stage text DEFAULT 'new'
    CHECK (lead_stage IN ('new', 'contacted', 'proposal', 'won', 'lost')),
  ADD COLUMN IF NOT EXISTS lead_value numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS won_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_conv_lead_stage ON contact_conversations(lead_stage);
