/*
  ═══════════════════════════════════════════════════════════════
  AION CMS — Restrict smtp_pass visibility in site_settings
  ═══════════════════════════════════════════════════════════════

  Problem:  The existing RLS policy allows ANY authenticated user
            to read ALL site_settings, including smtp_pass.

  Fix:      Drop the blanket SELECT policy and replace with two:
            1. Editor+ roles can read all settings (including smtp_pass)
            2. Other authenticated users can read all settings EXCEPT
               keys starting with 'smtp_'

  DOWN:    Revert to the original policy.
  ═══════════════════════════════════════════════════════════════
*/

-- UP
DROP POLICY IF EXISTS "Authenticated users can view site_settings" ON site_settings;

-- Policy 1: Editor+ roles see everything (including smtp_pass)
CREATE POLICY "Editors can view all site_settings"
  ON site_settings FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'user_role' IN ('admin', 'editor')
  );

-- Policy 2: Other roles see everything except SMTP credentials
CREATE POLICY "Viewers can view non-sensitive site_settings"
  ON site_settings FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'user_role' NOT IN ('admin', 'editor')
    AND key NOT LIKE 'smtp_%'
  );

-- DOWN: 
-- DROP POLICY IF EXISTS "Editors can view all site_settings" ON site_settings;
-- DROP POLICY IF EXISTS "Viewers can view non-sensitive site_settings" ON site_settings;
-- CREATE POLICY "Authenticated users can view site_settings"
--   ON site_settings FOR SELECT TO authenticated USING (true);
