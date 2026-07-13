# Migration Manifest — AKES v1

**Rule:** Copy first, verify, THEN delete originals (after approval).

---

## Phase 1: Platform Docs (01_PLATFORM/)

| Original | Target | Status | Links Updated | Notes |
|----------|--------|--------|---------------|-------|
| `docs/ARCHITECTURE.md` | `01_PLATFORM/ARCHITECTURE.md` | 🔜 | ❌ | Need to update cross-refs |
| `docs/CONSTITUTION.md` | `01_PLATFORM/CONSTITUTION.md` | 🔜 | ❌ | |
| `docs/FEATURES.md` | `01_PLATFORM/FEATURES.md` | 🔜 | ❌ | |
| `docs/ROADMAP.md` | `01_PLATFORM/ROADMAP.md` | 🔜 | ❌ | |
| `docs/MODULES.md` | `01_PLATFORM/MODULES.md` | 🔜 | ❌ | |
| `docs/PERMISSIONS.md` | `01_PLATFORM/PERMISSIONS.md` | 🔜 | ❌ | |
| `docs/PLATFORM_STATUS.md` | `01_PLATFORM/STATUS.md` | 🔜 | ❌ | Renamed to STATUS.md |
| `docs/CHANGELOG.md` | `01_PLATFORM/CHANGELOG.md` | 🔜 | ❌ | |
| `docs/DATABASE.md` | `01_PLATFORM/DATABASE.md` | 🔜 | ❌ | |
| `docs/DEPLOYMENT.md` | `01_PLATFORM/DEPLOYMENT.md` | 🔜 | ❌ | |
| `docs/TELEMETRY.md` | `01_PLATFORM/TELEMETRY.md` | 🔜 | ❌ | |
| `docs/DECISIONS.md` | `01_PLATFORM/DECISIONS.md` | 🔜 | ❌ | |
| `docs/TECH_DEBT.md` | `01_PLATFORM/TECH_DEBT.md` | 🔜 | ❌ | |
| `docs/KNOWN_ISSUES.md` | `01_PLATFORM/KNOWN_ISSUES.md` | 🔜 | ❌ | |

## Phase 2: Tenant Docs (02_TENANTS/)

| Original | Target | Status |
|----------|--------|--------|
| `docs/CONTENT_MAPPING_KOLOKOTRONIS.md` | `02_TENANTS/kolokotronis/CONTENT_MAPPING.md` | 🔜 |
| `docs/TENANT_VISIBILITY.md` | `02_TENANTS/VISIBILITY_MATRIX.md` | 🔜 |
| `docs/modules/retreat/CONTENT_MAPPING.md` | `02_TENANTS/ktima-kareli/CONTENT_MAPPING.md` | 🔜 |
| `docs/CREDENTIALS.md` | → `08_REFERENCE/CREDENTIALS_REGISTRY.md` | ✅ Done |

## Phase 3: Module Docs (03_MODULES/)

| Original | Target | Status |
|----------|--------|--------|
| `docs/modules/portfolio/*` | `03_MODULES/Portfolio/` | 🔜 |
| `docs/modules/retreat/*` | `03_MODULES/Retreat/` | 🔜 |
| `docs/modules/locale/*` | Already under `03_MODULES/Locale/` | ✅ |

## Phase 4: Patterns → Methods + Reuse (04_METHODS/ + 07_REUSE/)

| Original | Target | Status |
|----------|--------|--------|
| `docs/patterns/module-registry.md` | `04_METHODS/Core/module-registry.md` | 🔜 |
| `docs/patterns/feature-flags.md` | `04_METHODS/Platform/feature-flags.md` | 🔜 |
| `docs/patterns/tenant-isolation.md` | `04_METHODS/Platform/tenant-isolation.md` | 🔜 |
| `docs/patterns/media-pipeline.md` | `04_METHODS/Supabase/media-pipeline.md` | 🔜 |
| `docs/patterns/research-workflow.md` | `04_METHODS/Core/research-workflow.md` | 🔜 |
| `docs/patterns/documentation-process.md` | `04_METHODS/Core/documentation-process.md` | 🔜 |
| `docs/patterns/editorial-review.md` | `04_METHODS/Core/editorial-review.md` | 🔜 |
| `docs/patterns/client-approval.md` | `04_METHODS/Core/client-approval.md` | 🔜 |
| `docs/patterns/gallery-pattern.md` | `07_REUSE/PATTERNS.md` (gallery) | 🔜 |
| `docs/patterns/timeline-pattern.md` | `07_REUSE/PATTERNS.md` (timeline) | 🔜 |
| `docs/patterns/portfolio-pattern.md` | `07_REUSE/PATTERNS.md` (portfolio) | 🔜 |
| `docs/patterns/retreat-module.md` | `07_REUSE/BLUEPRINTS.md` (retreat) | 🔜 |
| `docs/patterns/external-project-setup.md` | `04_METHODS/Deployment/external-project.md` | 🔜 |
| `docs/patterns/booking-pipeline.md` | `03_MODULES/Bookings/` | 🔜 |
| `docs/patterns/locale-module.md` | `03_MODULES/Locale/METHODS.md` | 🔜 |
| `docs/patterns/multi-project-pattern.md` | `04_METHODS/Deployment/multi-project.md` | 🔜 |
