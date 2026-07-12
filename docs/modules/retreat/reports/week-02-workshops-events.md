# Week 2: Workshops + Events CRUD — Completion Report

**Date:** 2026-07-08
**Module:** Retreat
**Panel:** Workshops CRUD + Events CRUD (bilingual)

---

## Scope

1. Workshops CRUD (same pattern as Experiences)
2. Events CRUD with bilingual GR/EN support

## Deliverables

- `src/modules/retreat/pages/WorkshopsCRUD.tsx`
- `src/modules/retreat/pages/EventsCRUD.tsx`

## Features

### Workshops CRUD
- Title, description, duration, group_size, includes (tags), image (MediaPicker), sort_order, status
- Same pattern as Experiences

### Events CRUD (Bilingual)
- GR/EN language tabs in edit form
- Fields: title, title_en, date, organizer, capacity, price, description, description_en, includes[], includes_en[], image, sort_order, status
- Language toggle persists within editing session
- Includes lists independent per language

## QA Results

- [x] Workshops CRUD: create/edit/delete
- [x] Events CRUD: create/edit/delete
- [x] GR/EN tabs switch correctly
- [x] Bilingual fields save independently
- [x] Price/capacity work as numbers
- [x] Date picker works
- [x] History logging on CUD
- [x] Build: zero errors (2,385 modules)

## Next Steps

- Week 3: FAQ CRUD + Bookings Manager
