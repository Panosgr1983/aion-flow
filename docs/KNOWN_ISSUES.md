# AION CMS — Known Issues

Καταγραφή γνωστών προβλημάτων, workarounds και προγραμματισμένων fixes.

---

## Issue #001: Media Gallery Missing Uploaded Images

**Status:** Open
**Priority:** High
**Affected Version:** v0.1.0
**Planned Fix:** v0.2

### Problem
Images uploaded through CMS editors (services, blog, products, about, pages, site settings) do not appear in the Media Library gallery. They exist only as orphan URLs in their respective content tables.

### Root Cause
CMS editors use `uploadImage()` from `storage.ts` which uploads to Supabase Storage but does not create a `media` table record. Only `mediaHelper.upload()` (used by Media Library's own upload) creates `media` records.

### Planned Solution
Asset Management System (release/v0.2):
1. Create `media.ts` with `uploadCmsAsset()` that combines storage upload + media record creation
2. Migrate all CMS editors to use `uploadCmsAsset()`
3. Add `category`, `source`, `metadata` columns to `media` table

### Workaround
Upload images through the Media Library panel first, then use the Media Picker to select them in CMS editors.

---

## Issue #002: JWT Hook Requires Logout/Login After Changes

**Status:** Open
**Priority:** Medium
**Affected Version:** v0.1.0
**Planned Fix:** v0.2

### Problem
When the JWT hook function is updated (e.g., role claim rename), existing sessions still carry the old JWT. Users must log out and log back in to get a refreshed token.

### Root Cause
JWT tokens are cached client-side and are not invalidated on hook changes. Supabase does not revoke active sessions automatically.

### Workaround
Manual logout → login. In extreme cases, an admin can revoke all user sessions via Supabase Dashboard.

---

## Issue #003: No Warning on Asset Deletion

**Status:** Open
**Priority:** Medium
**Affected Version:** v0.1.0
**Planned Fix:** v0.2

### Problem
Deleting an image from the Media Library does not check if it is referenced elsewhere (services, blog, pages, etc.). The storage file is removed, but URLs in content tables remain as broken links.

### Planned Solution
Safe Delete (v0.2.9+):
1. Query all content tables for URL references before delete
2. Show usage report (n references in m pages)
3. Offer options: Cancel / Replace Everywhere / Delete Anyway

---

## Issue #004: RichEditor Inline Images Not in Gallery

**Status:** Accepted
**Priority:** Low
**Affected Version:** v0.1.0
**Planned Fix:** v0.2 (as `source: inline-content`)

### Problem
Images inserted inline in TipTap editor (blog content) are not tracked in the Media Library.

### Decision
Inline content images are a different concern from managed assets. They will be tracked with `source: inline-content` and filtered out by default in the Gallery, but visible with a toggle.

---

## Issue #005: No Tenant Isolation on Media Table

**Status:** Open
**Priority:** Medium
**Affected Version:** v0.1.0
**Planned Fix:** v0.2

### Problem
The `media` table has no `tenant_id` column. All media is shared across all tenants. RLS policies grant access to all authenticated users.

### Planned Solution
Add `tenant_id` column to `media` table and update RLS policies for tenant isolation.
