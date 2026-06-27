/*
  # Auto-create profiles on user signup + seed admin profiles

  1. Creates a trigger that auto-inserts a profile row when a new user signs up
  2. Seeds profiles for existing auth users (idempotent - ON CONFLICT DO NOTHING)
  3. Sets is_super_admin = true for known admin emails
*/

-- ============================================================
-- Trigger: auto-create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant execute to supabase_auth_admin (needed for trigger to work)
GRANT EXECUTE ON FUNCTION public.handle_new_user TO supabase_auth_admin;

-- ============================================================
-- Seed profiles for EXISTING auth users (idempotent)
-- Run this once to backfill existing users
-- ============================================================
INSERT INTO public.profiles (id, email, full_name, role, is_super_admin)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'full_name', ''),
  'admin',
  CASE WHEN au.email IN ('choliasmenos.panos@gmail.com', 'info@aionweb.gr') THEN true ELSE false END
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Ensure known admin emails have is_super_admin = true
-- (in case they already have a profile but is_super_admin is false)
-- ============================================================
UPDATE public.profiles
SET is_super_admin = true
WHERE email IN ('choliasmenos.panos@gmail.com', 'info@aionweb.gr')
  AND (is_super_admin IS NULL OR is_super_admin = false);
