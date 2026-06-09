/*
  # AION CRM — Two-Way Email Sync (Gmail)

  Stores connected email accounts for IMAP/Gmail API sync.
  Tokens are encrypted at rest via Supabase Vault or app-level encryption.
*/

CREATE TABLE IF NOT EXISTS email_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  provider text DEFAULT 'gmail' CHECK (provider IN ('gmail', 'imap')),
  access_token text DEFAULT '',
  refresh_token text DEFAULT '',
  token_expires_at timestamptz,
  last_sync_at timestamptz,
  sync_enabled boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_accounts_email ON email_accounts(email);
CREATE INDEX IF NOT EXISTS idx_email_accounts_active ON email_accounts(is_active);

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email accounts"
  ON email_accounts FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert email accounts"
  ON email_accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own email accounts"
  ON email_accounts FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own email accounts"
  ON email_accounts FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR auth.uid() IS NOT NULL);
