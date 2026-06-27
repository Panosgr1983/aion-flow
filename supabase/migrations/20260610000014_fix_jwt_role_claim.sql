/*
  # Fix JWT role claim — rename `role` to `user_role`

  Το custom_access_token_hook έγραφε `role: "admin"` πάνω από το
  standard Supabase `role: "authenticated"`. Αυτό έσπαγε όλα τα
  REST API queries γιατί η PostgreSQL προσπαθούσε:
    SET ROLE admin
  (και το "admin" δεν είναι valid database role).

  Fix: χρησιμοποιούμε `user_role` αντί για `role` στο custom claim.
*/

-- ============================================================
-- Update JWT helper function
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT auth.jwt() ->> 'user_role'
$$;

-- ============================================================
-- Update Access Token Hook
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

  -- Inject tenant context (use user_role to avoid overriding standard role claim)
  IF p.tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(p.tenant_id::text));
  ELSE
    claims := jsonb_set(claims, '{tenant_id}', 'null'::jsonb);
  END IF;

  claims := jsonb_set(claims, '{user_role}', to_jsonb(COALESCE(p.role, 'viewer')));
  claims := jsonb_set(claims, '{is_super_admin}', to_jsonb(COALESCE(p.is_super_admin, false)));

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
