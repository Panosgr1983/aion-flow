/*
  # AION CRM Inbox — Phase B: Storage bucket & sync trigger

  1. Storage bucket `contact-attachments`
  2. Trigger to sync contact_submissions → contact_messages
*/

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'contact-attachments',
  'contact-attachments',
  true,
  false,
  10485760, -- 10MB
  ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to contact-attachments
CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contact-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view attachments"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'contact-attachments');

-- ============================================================
-- TRIGGER: Sync contact_submissions → contact_messages
-- ============================================================
CREATE OR REPLACE FUNCTION sync_contact_submission()
RETURNS trigger AS $$
DECLARE
  v_conv_id uuid;
  v_email text := LOWER(TRIM(NEW.email));
BEGIN
  -- Find existing active conversation for this email
  SELECT id INTO v_conv_id
  FROM contact_conversations
  WHERE LOWER(TRIM(email)) = v_email
    AND status = 'active'
  LIMIT 1;

  -- If no active conversation exists, create one
  IF v_conv_id IS NULL THEN
    v_conv_id := gen_random_uuid();
    INSERT INTO contact_conversations (id, email, name, phone, last_message_at, created_at)
    VALUES (v_conv_id, v_email, NEW.name, NEW.phone, NEW.created_at, NEW.created_at);
  END IF;

  -- Insert into contact_messages
  INSERT INTO contact_messages (
    conversation_id, name, email, phone, subject, message,
    direction, status, attachments, last_message_at, created_at
  ) VALUES (
    v_conv_id, NEW.name, NEW.email, NEW.phone, '', NEW.message,
    'incoming', CASE WHEN NEW.read THEN 'read' ELSE 'new' END,
    '[]'::jsonb, NEW.created_at, NEW.created_at
  );

  -- Update conversation last_message_at
  UPDATE contact_conversations
  SET last_message_at = NEW.created_at, name = NEW.name, phone = NEW.phone
  WHERE id = v_conv_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_contact_submission ON contact_submissions;
CREATE TRIGGER trigger_sync_contact_submission
  AFTER INSERT ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION sync_contact_submission();
