# AION CMS — Technical Debt Register

Καταγραφή σημείων που δουλεύουν αλλά δεν είναι ιδανικά.
Στόχος: να μη διορθώνονται βιαστικά, αλλά να μην ξεχνιούνται.

---

## TECHD-001: `storage.ts` God Function

**Current:** `uploadImage()` handles Storage + should handle Media records
**Target:** `uploadImage()` returns `{ url, path, filename }` only
**Why:** Single Responsibility Principle → `storage.ts` should not know about `media` table
**Planned Fix:** v0.2 — Create `media.ts` with `uploadCmsAsset()` wrap per

## TECHD-002: `uploadImage()` Returns String Instead of Object

**Current:** Returns `string` (URL)
**Target:** Returns `UploadResult { url, path, filename }`
**Why:** Callers need path info for future features (replace, delete, versioning)
**Planned Fix:** v0.2 — Breaking change, all callers updated anyway

## TECHD-003: No `tenant_id` on `media` Table

**Current:** Media table is tenant-agnostic, no isolation
**Target:** Add `tenant_id`, update RLS policies
**Why:** Required for multi-tenant isolation of assets
**Planned Fix:** v0.2 — New migration

## TECHD-004: Settings Table Duplication

**Current:** Two tables exist: `settings` (from initial schema) and `site_settings` (from content schema)
**Target:** Deprecate `settings`, use only `site_settings`
**Why:** Confusion, potential data inconsistency
**Planned Fix:** v0.3 — Consolidation migration

## TECHD-005: No PNG→JPEG in `mediaHelper.upload()`

**Current:** `mediaHelper.upload()` does not convert PNG→JPEG
**Target:** Either add conversion or standardize through `uploadCmsAsset()`
**Why:** Consistency — `uploadImage()` converts but `mediaHelper.upload()` doesn't
**Planned Fix:** v0.2 — Handled in `uploadCmsAsset()`

## TECHD-006: RLS Policies Not Granular Per Role

**Current:** Most tables have "authenticated can do X" policies
**Target:** Role-based policies (admin vs editor vs viewer)
**Why:** Security — viewer should not be able to delete
**Planned Fix:** v0.3

## TECHD-007: No Index on `content_history` Table

**Current:** No indexes on `entity_id` or `created_at`
**Target:** Add indexes for query performance
**Why:** Audit dashboard queries slow with many records
**Planned Fix:** v0.3

## TECHD-008: Error Messages Hardcoded in Components

**Current:** `alert('Αποτυχία μεταφόρτωσης')` in Services, Blog, etc.
**Target:** Centralized error handling layer
**Why:** Inconsistent UX, hard to internationalize
**Planned Fix:** v0.3

## TECHD-009: No Type-Safe Environment Variables

**Current:** `VITE_SUPABASE_URL` used directly, no validation
**Target:** Typed config object with runtime validation
**Why:** Fail fast on misconfiguration
**Planned Fix:** v0.3

## TECHD-010: `uploadImage()` PNG→JPEG in Client

**Current:** Conversion happens client-side via Canvas API
**Target:** Move to server-side (Edge Function or Image CDN)
**Why:** Slow on mobile, large files, blocks UI
**Planned Fix:** v0.3 — Edge Function for image optimization
