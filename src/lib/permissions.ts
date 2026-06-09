import { UserRole } from '../types/supabase';

export type Permission = 'cms.edit' | 'cms.view' | 'crm.inbox' | 'crm.pipeline' | 'crm.tasks' | 'history.view' | 'history.restore' | 'settings.all' | 'users.manage';

const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  admin: ['cms.edit', 'cms.view', 'crm.inbox', 'crm.pipeline', 'crm.tasks', 'history.view', 'history.restore', 'settings.all', 'users.manage'],
  editor: ['cms.edit', 'cms.view', 'history.view', 'settings.all'],
  sales: ['crm.inbox', 'crm.pipeline', 'crm.tasks', 'history.view'],
  viewer: ['cms.view', 'history.view'],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSION_MATRIX[role]?.includes(permission) ?? false;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Διαχειριστής',
    editor: 'Συντάκτης',
    sales: 'Πωλήσεις',
    viewer: 'Θεατής',
  };
  return labels[role];
}
