---
id: module.retreat
title: Retreat Module
domain: modules
type: module
status: current
maturity: standard
source_of_truth: true
owner: AION Engineering
tags:
  - retreat
  - wellness
  - crud
used_by:
  - ktima-kareli
relationships:
  uses:
    - media
    - bookings
    - locale
  related_methods:
    - tenant-resolution
    - bookings-pattern
  related_playbooks:
    - NEW_TENANT
  reusable_for:
    - Hotels
    - Resorts
    - Spas
    - Retreat centers
    - Wellness tourism
mmi:
  l1: 4
  l2: 4
  l3: 4
  l4: 0
  verified: false
last_reviewed: 2026-07-12
review_after: 2026-10-12
---

# Retreat Module — MASTER Reference

**Module Name:** retreat
**Version:** 0.1.0 (planned)
**Feature Flag:** retreat_module
**Status:** Active (v0.6)

---

## Architecture Overview

```
ModuleRegistry
  └── Retreat Module (self-registered via manifest)
        ├── ExperiencesCRUD (multi-entry CRUD)
        ├── WorkshopsCRUD (multi-entry CRUD, same pattern)
        ├── EventsCRUD (bilingual GR/EN)
        ├── FAQCRUD (simple Q&A)
        └── BookingsManager (submission list + status)

Platform Integration:
  ├── Feature Flag: retreat_module
  ├── Permissions: retreat.view, retreat.edit, retreat.bookings
  ├── History: content_history table
  ├── Media: MediaPicker + media table
  └── UI: RichEditor (TipTap)
```

## Completed Panels

| Panel | Type | Status |
|-------|------|--------|
| Experiences CRUD | Multi-entry CRUD | 🔜 Planned |
| Workshops CRUD | Multi-entry CRUD | 🔜 Planned |
| Events CRUD | Bilingual CRUD | 🔜 Planned |
| FAQ CRUD | Simple Q&A CRUD | 🔜 Planned |
| Bookings Manager | Submission list + status | 🔜 Planned |
| Gallery (reused) | Grid + lightbox CRUD | ✅ From Portfolio |

## Database Tables

| Table | Type | Status |
|-------|------|--------|
| experiences | Multi-row | 🔜 Planned |
| workshops | Multi-row | 🔜 Planned |
| retreat_events | Multi-row bilingual | 🔜 Planned |
| faq_entries | Multi-row | 🔜 Planned |
| booking_submissions | Multi-row | 🔜 Planned |

## Key Decisions (ADRs)

| ADR | Title | Applied |
|-----|-------|---------|
| ADR-015 | Retreat Vertical Module | v0.6 planned |

## Patterns Used

| Pattern | Location |
|---------|----------|
| Module Registry | `src/lib/ModuleRegistry.ts` |
| Media Pipeline | `docs/patterns/media-pipeline.md` |
| Booking Pipeline | `docs/patterns/booking-pipeline.md` |
| Retreat Module | `docs/patterns/retreat-module.md` |
| External Project Setup | `docs/patterns/external-project-setup.md` |
| Feature Flags | `docs/patterns/feature-flags.md` |
| Tenant Isolation | `docs/patterns/tenant-isolation.md` |
