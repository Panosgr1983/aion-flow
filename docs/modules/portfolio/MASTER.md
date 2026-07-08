# Portfolio Module — MASTER Reference

**Module Name:** portfolio
**Version:** 0.1.0
**Feature Flag:** portfolio_module
**Professional Types:** actor, musician, painter, writer, photographer, director, dancer, designer, other
**Status:** Active development (v0.5 CRUD phase)

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md) | Full integration plan & CRUD specs |
| [ARCHITECTURE.md](#) | Module architecture |
| [DATABASE.md](#) | Database schema |
| [CMS.md](#) | Editor panels |
| [MEDIA.md](#) | Media specification |
| [QA.md](#) | QA checklist |
| [WORKFLOW.md](#) | Editorial workflow |
| [REPORTS/](./reports/) | Per-panel completion reports |
| [CHANGELOG.md](#) | Version history |
| [ROADMAP.md](#) | Development roadmap |
| [LESSONS_LEARNED.md](#) | Retrospective |

---

## Architecture Overview

```
ModuleRegistry
  └── Portfolio Module (self-registered)
        ├── Pages (BiographyCRUD, FilmographyCRUD, ...)
        ├── Components (shared by panels)
        ├── Types (Biographies, FilmographyEntry, ...)
        └── DB Queries (read-only helpers)

Platform Integration:
  ├── Feature Flag: portfolio_module
  ├── Permissions: portfolio.view, portfolio.edit
  ├── History: content_history table
  ├── Media: MediaPicker + media table
  └── UI: RichEditor (TipTap)
```

## Completed Panels

| Panel | Type | Week | Status |
|-------|------|------|--------|
| Biography CRUD | Single-row upsert | Week 1 | ✅ Live |
| Filmography CRUD | Multi-entry CRUD | Week 2 | ✅ Live |
| Television CRUD | Multi-entry CRUD | Week 3 | 🔜 |
| Theatre CRUD | Multi-entry CRUD | Week 3 | 🔜 |

## Database Tables

| Table | Type | Status |
|-------|------|--------|
| biographies | Single-row per tenant | ✅ Live |
| filmography_entries | Multi-row | ✅ Live |
| television_entries | Multi-row | 🔜 Needs media migration |
| theatre_entries | Multi-row | 🔜 Needs media migration |
| career_timelines | Multi-row | 🔜 |
| gallery_items | Multi-row | 🔜 |
| press_items | Multi-row | 🔜 |
| showreels | Multi-row | 🔜 |

## Key Decisions (ADRs)

| ADR | Title | Applied |
|-----|-------|---------|
| ADR-010 | Artist Module Integration Strategy | v0.1 |
| ADR-012 | Documentation-First Architecture Rule | v0.15 |
| ADR-013 | Module Registry System | v0.15 |

## Patterns Used

| Pattern | Location |
|---------|----------|
| Module Registry | `src/lib/ModuleRegistry.ts` |
| Portfolio Schema | `docs/patterns/portfolio-pattern.md` |
| Media Pipeline | `docs/patterns/media-pipeline.md` |
| Gallery | `docs/patterns/gallery-pattern.md` |
| Timeline | `docs/patterns/timeline-pattern.md` |
| Feature Flags | `docs/patterns/feature-flags.md` |
| Tenant Isolation | `docs/patterns/tenant-isolation.md` |

## Dependencies

| Dependency | Purpose | Type |
|------------|---------|------|
| @tiptap/react | RichEditor | Platform shared |
| @tiptap/starter-kit | RichEditor | Platform shared |
| @tiptap/extension-image | RichEditor | Platform shared |
| @tiptap/extension-link | RichEditor | Platform shared |
| lucide-react | Icons | Platform shared |
| @supabase/supabase-js | Database | Platform shared |
