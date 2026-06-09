/*
  # AION Platform — Add Sales role to profiles
*/

-- First drop the existing constraint, then recreate with 'sales' added
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'editor', 'sales', 'viewer'));
