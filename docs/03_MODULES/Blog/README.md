---
id: module.blog
title: Blog Module
domain: modules
type: module
status: current
maturity: standard
source_of_truth: true
owner: AION Engineering
tags:
  - blog
  - cms
used_by:
  - kolokotronis
mmi:
  l1: 4
  l2: 4
  l3: 4
  l4: 0
  verified: false
last_reviewed: 2026-07-12
review_after: 2026-10-12
---

# Blog Module — AION Flow

**Module Name:** blog
**Feature Flag:** cms (part of CMS Core)
**Status:** Stable (v1.0)

---

## Overview

Το Blog Module είναι μέρος του CMS Core. Παρέχει διαχείριση άρθρων, κατηγοριών και content με TipTap rich editor.

## Database Table: `blog_posts`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `title` | TEXT | |
| `slug` | TEXT | URL-friendly |
| `excerpt` | TEXT | Short description |
| `content` | JSONB | TipTap editor JSON |
| `category` | TEXT | e.g. 'ΟΜΙΛΙΕΣ', 'ΣΕΜΙΝΑΡΙΑ', 'ΟΜΑΔΕΣ' |
| `image_url` | TEXT | Hero image |
| `is_published` | BOOLEAN | |
| `published_at` | TIMESTAMPTZ | |
| `meta_title` | TEXT | SEO |
| `meta_description` | TEXT | SEO |
| `og_image` | TEXT | SEO |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

## CMS Panel

`/dashboard/blog` — BlogPosts.tsx

| Feature | Detail |
|---------|--------|
| List view | All posts with status, category, date |
| Create | Title, slug, excerpt, content (TipTap), category, image |
| Edit | Same as create |
| Delete | With confirmation |
| Categories | ΟΜΙΛΙΕΣ, ΣΕΜΙΝΑΡΙΑ, ΟΜΑΔΕΣ |

## Reuse

Used by: Kolokotronis (blog section on homepage + /blog page)

## Tenant Isolation

✅ Uses `withTenant()` in `blogPostsHelper.getAll()` (fixed 2026-07-12)
