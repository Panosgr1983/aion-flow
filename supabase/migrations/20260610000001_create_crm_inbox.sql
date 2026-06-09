/*
  # AION CRM Inbox — Conversations & Messages

  ## Tables
  1. `contact_conversations` — Thread grouping per email
  2. `contact_messages` — Individual messages (incoming + outgoing)

  ## Relationship
  - contact_conversations 1:N contact_messages (via conversation_id)

  ## Design
  - contact_submissions remains untouched (parallel run)
  - After stabilization, old table can be dropped
*/

-- ============================================================
-- CONTACT CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text DEFAULT '',
  phone text DEFAULT '',
  status text DEFAULT 'active'
    CHECK (status IN ('active', 'closed', 'archived', 'spam')),
  last_message_at timestamptz DEFAULT now(),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conv_email ON contact_conversations(email);
CREATE INDEX IF NOT EXISTS idx_conv_status ON contact_conversations(status);
CREATE INDEX IF NOT EXISTS idx_conv_last_message ON contact_conversations(last_message_at DESC);

ALTER TABLE contact_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view conversations"
  ON contact_conversations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert conversations"
  ON contact_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update conversations"
  ON contact_conversations FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete conversations"
  ON contact_conversations FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES contact_conversations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL,
  direction text DEFAULT 'incoming'
    CHECK (direction IN ('incoming', 'outgoing')),
  status text DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'replied', 'archived')),
  parent_id uuid REFERENCES contact_messages(id) ON DELETE SET NULL,
  attachments jsonb DEFAULT '[]',
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_msg_conversation ON contact_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_msg_direction ON contact_messages(direction);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view messages"
  ON contact_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert messages"
  ON contact_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update messages"
  ON contact_messages FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete messages"
  ON contact_messages FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- BACKFILL: Migrate existing contact_submissions into the new schema
-- ============================================================
DO $$
DECLARE
  conv_record RECORD;
  new_conv_id uuid;
BEGIN
  -- Create conversations from unique emails in contact_submissions
  FOR conv_record IN
    SELECT DISTINCT ON (LOWER(TRIM(email)))
      LOWER(TRIM(email)) AS email,
      name,
      phone,
      created_at
    FROM contact_submissions
    WHERE LOWER(TRIM(email)) != ''
    ORDER BY LOWER(TRIM(email)), created_at ASC
  LOOP
    new_conv_id := gen_random_uuid();

    INSERT INTO contact_conversations (id, email, name, phone, last_message_at, created_at)
    VALUES (
      new_conv_id,
      conv_record.email,
      conv_record.name,
      conv_record.phone,
      conv_record.created_at,
      conv_record.created_at
    );

    -- Move submissions to contact_messages
    INSERT INTO contact_messages (
      conversation_id, name, email, phone, subject, message,
      direction, status, attachments, last_message_at, created_at
    )
    SELECT
      new_conv_id,
      cs.name, cs.email, cs.phone, '', cs.message,
      'incoming',
      CASE WHEN cs.read THEN 'read' ELSE 'new' END,
      '[]'::jsonb,
      cs.created_at,
      cs.created_at
    FROM contact_submissions cs
    WHERE LOWER(TRIM(cs.email)) = conv_record.email
    ORDER BY cs.created_at ASC;
  END LOOP;

  -- Update last_message_at to the most recent message time
  UPDATE contact_conversations cc
  SET last_message_at = (
    SELECT MAX(cm.created_at)
    FROM contact_messages cm
    WHERE cm.conversation_id = cc.id
  );
END $$;
