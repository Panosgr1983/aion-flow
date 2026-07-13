---
id: module.portfolio
title: Portfolio Module
domain: modules
type: module
status: current
maturity: standard
source_of_truth: true
owner: AION Engineering
tags:
  - portfolio
  - crud
  - gallery
used_by:
  - kolokotronis
  - ktima-kareli
mmi:
  l1: 4
  l2: 4
  l3: 4
  l4: 0
  verified: true
last_reviewed: 2026-07-12
review_after: 2026-10-12
---

# Portfolio Module — MASTER Reference

**Module Name:** portfolio
**Version:** 0.1.0
**Feature Flag:** portfolio_module
**Professional Types:** actor, musician, painter, writer, photographer, director, dancer, designer, other
**Status:** Frozen (v1.0)

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
| Television CRUD | Multi-entry CRUD | Week 3 | ✅ Live |
| Theatre CRUD | Multi-entry CRUD | Week 3 | ✅ Live |
| Timeline CRUD | Category-based CRUD | Week 4 | ✅ Live |
| Gallery CRUD | Grid + lightbox CRUD | Week 5 | ✅ Live |
| Press CRUD | Full-text CRUD | Week 6 | ✅ Live |
| Showreels CRUD | Video CRUD | Week 6 | ✅ Live |

## Database Tables

| Table | Type | Status |
|-------|------|--------|
| biographies | Single-row per tenant | ✅ Live |
| filmography_entries | Multi-row | ✅ Live |
| television_entries | Multi-row | ✅ Live |
| theatre_entries | Multi-row | ✅ Live |
| career_timelines | Multi-row | ✅ Live |
| gallery_items | Multi-row | ✅ Live |
| press_items | Multi-row | ✅ Live |
| showreels | Multi-row | ✅ Live |

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
