/*
  # AION Platform — JWT Claims Hook & RLS Helpers
*/

-- ============================================================
-- JWT helper functions (used by RLS policies)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT COALESCE((auth.jwt() ->> 'is_super_admin')::boolean, false)
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::uuid
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT auth.jwt() ->> 'role'
$$;

-- ============================================================
-- Access Token Hook: injects tenant_id, role, is_super_admin into JWT
-- Register at: Supabase Dashboard → Auth → Hooks → Access Token Hook
-- ============================================================
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  p record;
BEGIN
  -- Get profile data for this user
  SELECT tenant_id, role, is_super_admin
  INTO p
  FROM profiles
  WHERE id = (event ->> 'user_id')::uuid;

  -- Start with existing claims
  claims := event->'claims';

  -- Inject tenant context
  IF p.tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(p.tenant_id::text));
  ELSE
    claims := jsonb_set(claims, '{tenant_id}', 'null'::jsonb);
  END IF;

  claims := jsonb_set(claims, '{role}', to_jsonb(COALESCE(p.role, 'viewer')));
  claims := jsonb_set(claims, '{is_super_admin}', to_jsonb(COALESCE(p.is_super_admin, false)));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant execute to the appropriate role
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- ============================================================
-- RLS: Add tenant isolation to existing tables
-- Note: Run for each table that needs tenant isolation
-- ============================================================

-- Usage: For any table with a tenant_id column, add these policies:
-- ALTER TABLE some_table ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "super_admin_all" ON some_table FOR ALL
--   USING (is_super_admin());
-- 
-- CREATE POLICY "tenant_isolation" ON some_table FOR ALL
--   USING (tenant_id = current_tenant_id());
