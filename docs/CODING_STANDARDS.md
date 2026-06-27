# AION CMS — Coding Standards

## Γενικές Αρχές

1. **Greek comments** σε όλα τα key files (το project έχει Έλληνες developers)
2. **TypeScript strict mode** — `any` μόνο με documented exception
3. **No circular dependencies** — `storage.ts` ≠ `media.ts`
4. **Feature flags** για μεγάλες αλλαγές
5. **Πρώτα migration, μετά code**

## Component Standards

### Structure
```tsx
// 1. Imports (grouped: React, libraries, local)
import { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { mediaHelper } from '../../lib/dataHelpers';
import { Media } from '../../types/supabase';

// 2. Interface (props type)
interface Props {
  onSelect?: (media: Media) => void;
}

// 3. Component
export default function ComponentName({ onSelect }: Props) {
  // state declarations
  // effects
  // handlers
  // render
}
```

### Naming
- **Components:** PascalCase (`MediaLibrary`, `SiteSettingsPanel`)
- **Functions:** camelCase (`uploadImage`, `handleDelete`)
- **Types/Interfaces:** PascalCase (`Media`, `UploadResult`)
- **Files:** PascalCase for components, camelCase for utilities

### Error Handling
- `ErrorBoundary` σε κάθε section
- `try/catch` σε async operations
- User-facing errors: Greek
- Console errors: English

## Database Standards

### Naming
- **Tables:** snake_case, plural (`blog_posts`, `site_settings`)
- **Columns:** snake_case (`tenant_id`, `created_at`)
- **Functions:** snake_case (`get_current_user_tenant`)
- **Views:** `v_` prefix (`v_churn_risk`)

### Migrations
- Filename: `YYYYMMDDHHMMSS_description.sql`
- Up: DDL + DML
- Down: `-- DOWN: ` σχόλια (για reverse migration)

## Git Standards

### Branches
```
main           → production (μόνο bug fixes)
develop        → integration
release/v*.*   → releases
feature/*      → features
fix/*          → bug fixes
```

### Commits
- `feat:` — νέο feature
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — code refactoring
- `migration:` — database migration
- `chore:` — tooling, config
- `BREAKING:` — breaking change

### PR Process
1. Feature branch → Develop
2. Develop → Release branch
3. Release → Main (μετά από QA)
