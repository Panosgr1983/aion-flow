/*
  # AION CRM — Follow-Up Tasks
*/

CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES contact_conversations(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean DEFAULT false,
  due_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_conversation ON follow_up_tasks(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON follow_up_tasks(due_at) WHERE completed = false;

ALTER TABLE follow_up_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks"
  ON follow_up_tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tasks"
  ON follow_up_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tasks"
  ON follow_up_tasks FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete tasks"
  ON follow_up_tasks FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
