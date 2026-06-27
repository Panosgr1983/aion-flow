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

## Performance Standards

### Images
| Rule | Requirement |
|------|------------|
| Format | WebP (always, no exceptions) |
| Lazy loading | `loading="lazy"` σε όλα τα below-fold images |
| Responsive | `srcset` + `sizes` για διαφορετικά breakpoints |
| CLS prevention | Always set `width` + `height` attributes |
| Hero preload | `fetchpriority="high"` στην hero image |
| Max file sizes | Hero ≤200KB, Gallery ≤80KB, Logo ≤30KB |

### Lighthouse Targets
| Metric | Target | Priority |
|--------|--------|----------|
| Performance | ≥90 | Medium |
| Accessibility | ≥95 | High |
| SEO | ≥95 | High |
| Best Practices | ≥90 | Medium |
| TTFB | <800ms | High |
| LCP | <2.5s | High |
| CLS | <0.1 | High |

## Accessibility Standards

### Keyboard
- All interactive elements must be reachable via Tab
- All modals must trap focus
- Escape key must close overlays
- Custom components must have correct `role` attributes

### ARIA
- Use semantic HTML first (button, nav, main, aside)
- ARIA labels only when semantic HTML is not enough
- Dynamic content must announce changes

### Contrast
- Text on background: minimum 4.5:1 (normal), 3:1 (large)
- Focus indicators: minimum 3:1 against adjacent colors
- Never convey information by color alone

## Animation Standards

### Rules
| Rule | Requirement |
|------|------------|
| Library | Framer Motion (consistent across all components) |
| Reduced motion | Respect `prefers-reduced-motion` — disable or simplify |
| Duration | Animations ≤300ms (micro-interactions), ≤500ms (page transitions) |
| Accessibility | No auto-playing animations without user control |
