/*
  # Contact Submissions Table

  Stores contact form submissions from the frontend.

  ## RLS
  - anon: INSERT only (anyone can submit)
  - authenticated: SELECT and UPDATE (CMS admin can view/manage)
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view submissions"
  ON contact_submissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can update submissions"
  ON contact_submissions FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete submissions"
  ON contact_submissions FOR DELETE TO authenticated
  USING (true);
