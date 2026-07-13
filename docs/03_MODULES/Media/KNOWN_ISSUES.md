# Media Module — Known Issues

---

## Active Issues

### M-KI-001: Orphaned storage files on failed DB insert

**Severity:** Low  
**Description:** Αν το `uploadToStorage()` πετύχει αλλά η εισαγωγή στον `media` πίνακα αποτύχει, το αρχείο παραμένει στο Storage χωρίς DB record (orphaned file).  
**Fix:** Rollback mechanism (Method M6) — not yet implemented in all paths.  
**Workaround:** Manual cleanup via Supabase dashboard.  

### M-KI-002: No duplicate filename detection

**Severity:** Low  
**Description:** Το σύστημα δεν ελέγχει αν υπάρχει ήδη αρχείο με το ίδιο όνομα στον ίδιο φάκελο. Το Supabase Storage `x-upsert` μπορεί να το διαχειριστεί, αλλά μπορεί να οδηγήσει σε ακούσιες αντικαταστάσεις.  
**Fix:** Add duplicate check before upload.  

### M-KI-003: media table not tenant-filtered in dataHelpers.ts

**Severity:** Medium  
**Description:** Το `mediaHelper` στο `dataHelpers.ts` (lines 237-281) ΔΕΝ χρησιμοποιεί `withTenant()`. Οι μόνες tenant-filtered media queries είναι στο `media.ts` (Line 2 — `getAllMedia`, `getMediaByCategory`, `getMediaBySource`).  
**Impact:** Το MediaLibrary panel μέσω dataHelpers μπορεί να εμφανίζει media από άλλους tenants.  
**Fix:** Add `withTenant()` to `mediaHelper.getAll()` in `dataHelpers.ts`.

---

## Technical Debt

### M-TD-001: Legacy `uploadImage()` function

Το `uploadImage()` στο `storage.ts` είναι παλιά μέθοδος (πριν το multi-tenant). Έχει αντικατασταθεί από `uploadCmsAsset()` στο `media.ts` αλλά χρησιμοποιείται ακόμα από το RichEditor (για inline blog images).  
**Effort to fix:** Low.

### M-TD-002: Unsafe `getMediaById()` and `updateMedia()` without tenant filter

Οι συναρτήσεις `getMediaById()` και `updateMedia()` στο `media.ts` (Lines 154, 171) χρησιμοποιούν `.eq('id', id)` χωρίς tenant filter. Αν κάποιος γνωρίζει το UUID ενός media record από άλλο tenant, μπορεί να το διαβάσει ή να το τροποποιήσει.  
**Risk:** Low (UUIDs are unguessable, but still a gap).  
**Fix:** Add `.eq('tenant_id', ...)` filter.  

---

## Provider / Storage Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Max file size (site-images) | 10MB | Larger files must be split or compressed |
| Max file size (blog-images) | 5MB | |
| Supported image formats | JPEG, PNG, GIF, WebP, SVG | No TIFF, BMP, HEIC |
| Storage bucket total | Managed by Supabase plan | Free tier: 1GB |

---

## Unsolved / Future

- **Image optimization pipeline** (auto-resize, WebP conversion) — not implemented
- **Bulk upload** — not implemented
- **Usage detection** (warn before delete if in use) — not implemented
- **Drag & drop upload** — planned
