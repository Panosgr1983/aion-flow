# Week 1: Biography CRUD — Completion Report

**Date:** 2026-07-08
**Module:** Portfolio
**Panel:** Biography / Profile
**Type:** Single-row upsert

---

## Scope

Πλήρες CRUD panel για το βιογραφικό/προφίλ καλλιτέχνη.

## Deliverables

- `src/modules/portfolio/pages/BiographyCRUD.tsx` — 378 lines
- `manifest.ts` — route registration
- Database migration: `professional_type` column

## Components Created/Used

| Component | Usage |
|-----------|-------|
| RichEditor (TipTap) | Full bio content |
| MediaPicker | Profile portrait selection |
| Text inputs | short_bio, birth_year, birth_place |
| Comma-separated input | pseudonyms |
| Select | professional_type (9 options) |
| Select | status (draft/review/published) |
| Toggle | verified |
| Buttons | Save, Archive, Reset |

## Database Changes

| Change | Type | Status |
|--------|------|--------|
| biographies.professional_type | ADD COLUMN | ✅ Applied |

## Permissions

- `portfolio.edit` — create, update, archive
- `portfolio.view` — read

## History Integration

- `content_history` insert on CREATE
- `content_history` insert on UPDATE
- Archive is soft delete (status='archived'), no DELETE event

## Media Integration

- MediaPicker for `featured_media_id`
- Media URL resolved from `media` table by url match

## QA Results

- [x] CREATE saves correctly, single row per tenant
- [x] READ loads existing bio on mount
- [x] UPDATE persists after save
- [x] ARCHIVE sets status='archived', no hard delete
- [x] Validation: 4-digit birth year enforced
- [x] MediaPicker opens, selects, saves
- [x] RichEditor loads, content saves as JSON
- [x] Empty state: fresh form when no bio exists
- [x] Error state: red banner with message
- [x] Loading state: "Φόρτωση..."
- [x] Has-changes tracking: save disabled when unchanged
- [x] Save feedback: "Αποθηκεύτηκε ✓" for 2 seconds
- [x] Tenant isolation: payload includes effectiveTenantId
- [x] Build: zero errors

## Documentation Updated

- CHANGELOG.md — v0.5.0-dev
- FEATURES.md — Biography viewer → editor (Stable)
- ROADMAP.md — Panel 1 ✓
- INTEGRATION_PLAN.md — CRUD Plan section

## Known Limitations

- `professional_type` is a simple text column, not a normalized table
- No SEO fields editor (seo_title, seo_description exist in DB but not in form)
- No image preview in MediaPicker for current portrait
- Portrait URL uses direct Supabase URL, not optimized

## Lessons Learned

1. **RichEditor content format**: The TipTap editor produces JSON. This needs to be stored as-is in the DB and converted to HTML on the frontend. The existing BiographyPanel didn't handle this correctly.
2. **MediaPicker integration**: The existing MediaPicker returns a URL, not a media_id. Need to do a reverse lookup in the `media` table to get the id. Consider extending MediaPicker to return both.
3. **Upsert pattern**: For single-row-per-tenant entities, the upsert pattern (try load → if exists UPDATE else INSERT) is clean and simple.
4. **History logging**: The `content_history` insert should be done after the main operation succeeds. The pattern used (fetch user, insert after) works but could be abstracted into a helper.

## Reusable Patterns

- Biography CRUD form pattern (RichEditor + MediaPicker + status + verified)
- Upsert save logic (single row per tenant)
- Archive as soft delete pattern

## Next Steps

- Week 2: Filmography CRUD (completed)
- Week 3: Television CRUD + Theatre CRUD
