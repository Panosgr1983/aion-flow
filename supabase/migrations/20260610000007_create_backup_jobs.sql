/*
  # AION Platform — Backup Jobs

  Tracks backup execution history and status.
  Actual snapshot data is stored in content_backups.
*/

CREATE TABLE IF NOT EXISTS backup_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('manual', 'daily', 'weekly')),
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'failed')),
  backup_id uuid REFERENCES content_backups(id) ON DELETE SET NULL,
  size_bytes bigint DEFAULT 0,
  error_message text DEFAULT '',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backup_jobs_type ON backup_jobs(type);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_status ON backup_jobs(status);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_created ON backup_jobs(created_at DESC);

ALTER TABLE backup_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view backup_jobs"
  ON backup_jobs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert backup_jobs"
  ON backup_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update backup_jobs"
  ON backup_jobs FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
