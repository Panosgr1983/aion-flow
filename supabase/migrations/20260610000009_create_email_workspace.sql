/*
  # AION Email Workspace Foundation
  - email_drafts table (with schedule support)
  - soft delete for conversations
  - starred messages
  - email signature setting
*/

-- ============================================================
-- EMAIL DRAFTS
-- ============================================================
CREATE TABLE IF NOT EXISTS email_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES contact_conversations(id) ON DELETE SET NULL,
  from_email text DEFAULT '',
  reply_to text DEFAULT '',
  "to" text DEFAULT '',
  cc text DEFAULT '',
  bcc text DEFAULT '',
  subject text DEFAULT '',
  body text DEFAULT '',
  attachments jsonb DEFAULT '[]',
  status text DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drafts_status ON email_drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_scheduled ON email_drafts(scheduled_at) WHERE status = 'scheduled';

ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage drafts"
  ON email_drafts FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- SOFT DELETE for conversations
-- ============================================================
ALTER TABLE contact_conversations
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_conv_deleted ON contact_conversations(deleted_at);

-- ============================================================
-- STARRED messages
-- ============================================================
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS is_starred boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_msg_starred ON contact_messages(is_starred) WHERE is_starred = true;

-- ============================================================
-- EMAIL SIGNATURE setting
-- ============================================================
INSERT INTO site_settings (tenant_id, key, value, category, description)
VALUES ('00000000-0000-0000-0000-000000000001', 'email_signature', '"-- \nΝικόλας Κολοκοτρώνης\nΨυχοθεραπευτής"', 'contact', 'Email signature auto-appended')
ON CONFLICT (tenant_id, key) DO NOTHING;
