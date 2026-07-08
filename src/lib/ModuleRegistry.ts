/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Module Registry
   
  Κεντρικός μηχανισμός εγγραφής και ανακάλυψης modules.
   
  Κάθε module δηλώνει μέσω registerModule():
    - routes
    - sidebar items
    - permissions
    - feature flag
    - DB tables
    - dependencies
   
  Το Dashboard.tsx χρησιμοποιεί το registry για να δημιουργήσει
  routes και sidebar αυτόματα.
  ═══════════════════════════════════════════════════════════════
*/

import { ComponentType } from 'react';

export interface ModuleRoute {
  path: string;
  element: ComponentType;
  label?: string;
  sidebar?: boolean;
  permission?: string;
}

export interface SidebarGroup {
  label: string;
  icon: string;
  permission?: string;
  items: {
    path: string;
    label: string;
    icon: string;
    permission?: string;
  }[];
}

export interface ModuleManifest {
  name: string;
  version: string;
  label: string;
  description: string;
  featureFlag: string;
  routes: ModuleRoute[];
  sidebar: SidebarGroup;
  permissions: string[];
  dbTables: string[];
  migrations: string[];
  dependencies: string[];
}

class ModuleRegistry {
  private static modules = new Map<string, ModuleManifest>();

  static register(manifest: ModuleManifest): void {
    const key = manifest.name;
    if (this.modules.has(key)) {
      console.warn(`[ModuleRegistry] Module '${key}' already registered — skipping`);
      return;
    }
    this.modules.set(key, manifest);
    console.log(`[ModuleRegistry] Registered: ${key} v${manifest.version}`);
  }

  static get(name: string): ModuleManifest | undefined {
    return this.modules.get(name);
  }

  static getAll(): ModuleManifest[] {
    return Array.from(this.modules.values());
  }

  static getNames(): string[] {
    return Array.from(this.modules.keys());
  }

  static getEnabled(
    featureMap: Record<string, boolean> | null,
    isSuperAdmin: boolean,
  ): ModuleManifest[] {
    return this.getAll().filter((m) => {
      if (isSuperAdmin) return true;
      if (!featureMap) return false;
      return featureMap[m.featureFlag] === true;
    });
  }

  static getRoutes(
    featureMap: Record<string, boolean> | null,
    isSuperAdmin: boolean,
  ): ModuleRoute[] {
    return this.getEnabled(featureMap, isSuperAdmin).flatMap((m) => m.routes);
  }

  static getSidebarGroups(
    featureMap: Record<string, boolean> | null,
    isSuperAdmin: boolean,
  ): SidebarGroup[] {
    return this.getEnabled(featureMap, isSuperAdmin).map((m) => m.sidebar);
  }

  static clear(): void {
    this.modules.clear();
  }
}

export default ModuleRegistry;
