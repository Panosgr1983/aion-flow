---
id: method.core.crud-pattern
title: Multi-Entry CRUD Panel Pattern
domain: methods
type: method
status: Standard
maturity: standard
source_of_truth: true
owner: AION Engineering
tags:
  - crud
  - pattern
  - react
related:
  - method.core.tenant-resolution
used_by:
  - portfolio (Filmography, Television, Theatre, Press, Showreels)
  - retreat (Experiences, Workshops, Events, FAQ)
last_reviewed: 2026-07-12
review_after: 2026-10-12
---

# Method: Multi-Entry CRUD Panel Pattern

## Problem
Every content type needs list + create + edit + delete. Building each from scratch is repetitive and error-prone.

## Context
Applied in 9+ panels across Portfolio and Retreat modules. All follow the exact same structure.

## Implementation

```
Component Structure:
├── State: items[], editing, loading, saving, error, deleting, form
├── Load: useEffect → supabase query → setItems
├── List view (editing === null)
│   ├── Empty state with CTA
│   └── Mapped items with status badges, edit/delete buttons
├── Edit view (editing === 'new' | id)
│   ├── Form fields (text, select, number, media)
│   ├── Save → INSERT/UPDATE + content_history
│   └── Cancel → reset form
└── Delete → confirm dialog → DELETE + content_history + reload
```

## Key Features

| Feature | Implementation |
|---------|---------------|
| Status badges | green=published, yellow=review, gray=draft |
| Empty state | "Δεν υπάρχουν..." + "Προσθέστε την πρώτη" CTA |
| History logging | content_history on create/update/delete |
| Tenant isolation | All queries use withTenant() + effectiveTenantId |
| MediaPicker | Image selection per entry |
| sort_order | Manual numeric field |

## Reusable
Yes — standard for any multi-entry CRUD.

## Used By
FilmographyCRUD, TelevisionCRUD, TheatreCRUD, PressCRUD, ShowreelCRUD, ExperiencesCRUD, WorkshopsCRUD, EventsCRUD, FAQCRUD
