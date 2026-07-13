---
id: module.media
title: Media Module
domain: modules
type: module
status: current
maturity: standard
source_of_truth: true
owner: AION Engineering
tags:
  - media
  - upload
  - storage
used_by:
  - kolokotronis
  - ktima-kareli
relationships:
  related_methods:
    - media-upload
    - tenant-resolution
  reusable_for:
    - All tenants
    - Any website with images
mmi:
  l1: 4
  l2: 4
  l3: 4
  l4: 1
  verified: false
last_reviewed: 2026-07-12
review_after: 2026-10-12
---

# Media Module — AION Flow

**Module Name:** media
**Feature Flag:** `cms` (part of CMS Core)
**Status:** Stable (v1.0)

---

## Overview

Το Media Module παρέχει upload, αποθήκευση, διαχείριση και διανομή όλων των media assets στο AION Flow. Είναι ανεξάρτητο από modules — χρησιμοποιείται από Portfolio, Retreat, CMS Core.

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    MEDIA SERVICE                              │
│                                                               │
│  Level 1: storage.ts (raw upload/download/delete)              │
│  Level 2: media.ts (uploadCmsAsset, CRUD, telemetry)          │
│  Level 3: CMS Editors (MediaPicker, MediaLibrary)             │
└────────────────────────────────────────────────────────────┘
```

## Routes & Panels

| Route | Panel | Purpose |
|-------|-------|---------|
| `/dashboard/media` | MediaLibrary.tsx | Full media gallery with filters |
| `/dashboard/media` (modal) | MediaPicker.tsx | Inline selection for editors |

## Database Table: `media`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `name` | TEXT | Display name |
| `original_name` | TEXT | Original filename |
| `url` | TEXT | Public URL (Supabase Storage or external) |
| `public_id` | TEXT | |
| `path` | TEXT | Storage path |
| `storage_bucket` | TEXT | Default: `site-images` |
| `mime_type` | TEXT | e.g. `image/jpeg`, `image/png` |
| `size` | BIGINT | File size in bytes |
| `width` | INTEGER | Image width (px) |
| `height` | INTEGER | Image height (px) |
| `folder` | TEXT | `general`, `blog`, `services`, `gallery`, `hero`, `logo`, `experiences` |
| `alt_text` | TEXT | Accessibility / SEO |
| `caption` | TEXT | Display caption |
| `media_type` | TEXT | `poster`, `portrait`, `gallery`, `document`, `video`, `other` |
| `tags` | TEXT[] | |
| `category` | TEXT | |
| `source` | TEXT | `editor`, `inline-content` |
| `metadata` | JSONB | |
| `photographer` | TEXT | Credit |
| `copyright` | TEXT | Legal |
| `source_url` | TEXT | Original source |
| `created_by` | UUID | FK → auth.users |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

## Storage Buckets

| Bucket | Purpose | Max File Size | File Types |
|--------|---------|---------------|------------|
| `site-images` | Main image bucket | 10MB | JPEG, PNG, GIF, WebP, SVG |
| `blog-images` | Blog images (legacy) | 5MB | JPEG, PNG |
| `contact-attachments` | CRM attachments | 10MB | PDF, DOC, Images, ZIP |

### Storage Path Convention

```
{tenant-id}/{category}/{filename}
```

Example: `a6a0e182-.../experiences/exp-yoga-nature.jpg`

Μην χρησιμοποιείτε hardcoded tenant UUID ή bucket name.

## Upload Flow

```
1. User selects file via MediaPicker or drag & drop
2. uploadCmsAsset(file, options)
   ├── 2a. uploadToStorage() → Supabase Storage (bucket: site-images)
   ├── 2b. INSERT into media table (with tenant_id)
   ├── 2c. trackEvent('media.upload')
   └── 2d. Return Media object with public URL
3. Editor uses URL for CMS fields (image_url, featured_media_id, etc.)
```

## Delete Flow

```
1. User confirms delete
2. Delete from media table (db)
3. Delete from Storage (optional — depends on config)
4. trackEvent('media.delete')
```

## Metadata Fields (per asset)

| Field | Purpose | Required |
|-------|---------|----------|
| `alt_text` | Accessibility / SEO | Recommended |
| `caption` | Display caption | Optional |
| `photographer` | Credit | Recommended |
| `copyright` | Legal | Recommended |
| `media_type` | Classification | Recommended |
| `source_url` | Original source | If external |

## Permissions

| Action | Required Permission |
|--------|-------------------|
| Upload | `cms.edit` |
| Edit metadata | `cms.edit` |
| Delete | `cms.edit` |
| View in MediaPicker | `cms.view` |

## Telemetry Events

| Event | Trigger |
|-------|---------|
| `media.upload` | After successful upload |
| `media.delete` | After successful delete |
| `media.rename` | After metadata update |

## Dependent Modules

| Module | Uses Media For |
|--------|---------------|
| Portfolio | Gallery images, posters |
| Retreat | Experience/workshop images, gallery |
| CMS Core (Blog) | Blog post images |
| CMS Core (Services) | Service icons/images |
| CMS Core (Branding) | Logo, favicon |
| CMS Core (Site Settings) | Hero images, OG images |
| CMS Core (About) | Portraits, book covers |

## Tenants Using It

- Kolokotronis (via CMS panels)
- Ktima Kareli (18 images uploaded)
- (All future tenants)

## Reuse Status

**Reusable:** ✅ Yes — platform-wide, all modules depend on it.
**Tenant Isolation:** ✅ SAFE — `withTenant()` on all queries.
**Known Issues:** See `KNOWN_ISSUES.md`
