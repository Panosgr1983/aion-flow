/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Σύστημα Δικαιωμάτων (Permissions)
  
  Κάθε χρήστης έχει ένα ρόλο (admin/editor/sales/viewer).
  Κάθε ρόλος έχει ένα σύνολο permissions.
  
  Επιπλέον επίπεδο ελέγχου: tenant_features (βλ. access.ts)
  και is_super_admin (bypass όλων των ελέγχων).
  ═══════════════════════════════════════════════════════════════
*/

import { UserRole } from '../types/supabase';

/** Διαθέσιμα δικαιώματα στην πλατφόρμα */
export type Permission =
  | 'cms.edit'       // Επεξεργασία CMS περιεχομένου
  | 'cms.view'       // Προβολή CMS
  | 'crm.inbox'      // Πρόσβαση στο Inbox
  | 'crm.pipeline'   // Πρόσβαση στο Pipeline
  | 'crm.tasks'      // Διαχείριση Tasks
  | 'history.view'   // Προβολή ιστορικού αλλαγών
  | 'history.restore'// Επαναφορά από ιστορικό
  | 'settings.all'   // Πρόσβαση σε ρυθμίσεις
  | 'users.manage';  // Διαχείριση χρηστών

/** Πίνακας δικαιωμάτων ανά ρόλο */
const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  admin:  ['cms.edit', 'cms.view', 'crm.inbox', 'crm.pipeline', 'crm.tasks', 'history.view', 'history.restore', 'settings.all', 'users.manage'],
  editor: ['cms.edit', 'cms.view', 'history.view', 'settings.all'],
  sales:  ['crm.inbox', 'crm.pipeline', 'crm.tasks', 'history.view'],
  viewer: ['cms.view', 'history.view'],
};

/** Έλεγχος αν ένας ρόλος έχει συγκεκριμένο δικαίωμα */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSION_MATRIX[role]?.includes(permission) ?? false;
}

/** Εμφανίζει την ελληνική ονομασία ενός ρόλου */
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin:  'Διαχειριστής',
    editor: 'Συντάκτης',
    sales:  'Πωλήσεις',
    viewer: 'Θεατής',
  };
  return labels[role];
}
