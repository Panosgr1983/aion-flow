# Module Registry — AION Flow

## Vision

Το Module Registry είναι ο μηχανισμός εγγραφής και ανακάλυψης modules στο AION Flow.

Κάθε module (Portfolio, Medical, Restaurant, Business, κλπ.) δηλώνει τα πάντα μέσω ενός manifest, χωρίς χειροκίνητες αλλαγές σε Dashboard, Sidebar, Permissions ή Feature Map.

## Interface

```typescript
interface ModuleManifest {
  name: string;              // μοναδικό αναγνωριστικό: 'portfolio', 'medical'
  version: string;           // semver: '0.1.0'
  label: string;             // εμφανιζόμενο όνομα: 'Χαρτοφυλάκιο'
  description: string;       // σύντομη περιγραφή
  featureFlag: string;       // όνομα feature flag: 'portfolio_module'
  icon: string;              // lucide icon name: 'Briefcase'

  routes: {
    path: string;            // '/dashboard/portfolio/bio'
    element: React.ComponentType;
    label?: string;           // 'Βιογραφικό'
    sidebar?: boolean;       // εμφάνιση στο sidebar;
    permission?: string;     // 'portfolio.view'
  }[];

  sidebar: {
    label: string;           // 'Χαρτοφυλάκιο'
    icon: string;            // 'Briefcase'
    permission?: string;
    items: {
      path: string;
      label: string;
      icon: string;
      permission?: string;
    }[];
  };

  permissions: string[];     // ['portfolio.view', 'portfolio.edit']
  dbTables: string[];        // ['portfolio_profiles', 'portfolio_entries']
  migrations: string[];      // ['20260708000002_portfolio_module.sql']
  dependencies: string[];    // ['core', 'media-engine']
}
```

## Registry

```typescript
class ModuleRegistry {
  private static modules = new Map<string, ModuleManifest>();

  static register(manifest: ModuleManifest): void {
    if (this.modules.has(manifest.name)) {
      throw new Error(`Module '${manifest.name}' already registered`);
    }
    this.modules.set(manifest.name, manifest);
  }

  static get(name: string): ModuleManifest | undefined {
    return this.modules.get(name);
  }

  static getAll(): ModuleManifest[] {
    return Array.from(this.modules.values());
  }

  static getEnabled(tenantFeatureMap: Record<string, boolean>, isSuperAdmin: boolean): ModuleManifest[] {
    return this.getAll().filter(m =>
      isSuperAdmin || tenantFeatureMap[m.featureFlag] === true
    );
  }
}
```

## Usage

```typescript
// Σε κάθε module:
registerModule({
  name: 'portfolio',
  version: '0.1.0',
  label: 'Χαρτοφυλάκιο',
  featureFlag: 'portfolio_module',
  routes: [...],
  sidebar: { ... },
  permissions: [...],
  dbTables: [...],
  migrations: [...],
  dependencies: ['core'],
});
```

## Dashboard Integration

Το `Dashboard.tsx` δεν χρειάζεται πλέον imports για κάθε panel. Αντίθετα:

```typescript
const modules = ModuleRegistry.getEnabled(tenant.featureMap, tenant.isSuperAdmin);
// modules.flatMap(m => m.routes) → όλες οι routes
// modules.map(m => m.sidebar) → όλα τα sidebar groups
```

## Benefits

- ✅ Zero manual wiring for new modules
- ✅ Feature flag gating αυτόματη
- ✅ Sidebar groups αυτόματα
- ✅ Permissions αυτόματα
- ✅ Documentation μπορεί να παραχθεί από manifest
- ✅ Dynamic loading μελλοντικά (lazy imports)
