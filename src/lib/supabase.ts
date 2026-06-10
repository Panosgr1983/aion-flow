/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Supabase Client
  
  Δημιουργεί και εξάγει το Supabase client instance.
  
  Χρησιμοποιεί:
    - VITE_SUPABASE_URL:  Το URL του Supabase project
    - VITE_SUPABASE_ANON_KEY: Το anon/public key
  
  Το isSupabaseAvailable() ελέγχει αν τα env vars είναι παρόντα
  (για demo mode όπου μπορεί να λείπουν).
  ═══════════════════════════════════════════════════════════════
*/

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Το κεντρικό Supabase client instance (χρησιμοποιεί anon key) */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Ελέγχει αν το Supabase είναι διαθέσιμο.
 * Επιστρέφει false όταν λείπουν τα env vars (π.χ. local development).
 * 
 * Χρησιμοποιείται από dataHelpers για εναλλαγή live/demo mode.
 */
export function isSupabaseAvailable(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}
