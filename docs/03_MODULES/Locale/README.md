---
id: module.locale
title: Locale Module
domain: modules
type: module
status: current
maturity: experimental
source_of_truth: true
owner: AION Engineering
tags:
  - localization
  - translation
used_by:
  - ktima-kareli
mmi:
  l1: 0
  l2: 0
  l3: 1
  l4: 0
  verified: false
last_reviewed: 2026-07-12
review_after: 2026-10-12
---

# Locale Module — AION Flow

**Module Name:** locale
**Version:** 0.1.0 (planned)
**Feature Flag:** locale_module
**Status:** Planned (v0.7)

---

## Overview

Το Locale Module παρέχει platform-wide multi-language support. Κάθε tenant με `locale_module=true` μπορεί να έχει περιεχόμενο σε GR και EN.

## What It Solves

- Διαχείριση μεταφράσεων (key → value_el/value_en)
- Translations Editor panel στο CMS
- Public site locale toggle (GR/EN persisted)
- locale column σε content tables

## Pilot State (Ktima Kareli)

| Component | Status | Notes |
|-----------|--------|-------|
| Events (EN) | ✅ COMPLETE | GR/EN tabs in CMS, locale-aware public rendering |
| Experiences (EN) | 🟡 PARTIAL | DB ready (`title_en`, `description_en`, `includes_en`). CMS editor needs EN tabs. |
| Workshops (EN) | 🟡 PARTIAL | DB ready. CMS editor needs EN tabs. |
| detail_description | 🟡 PARTIAL | DB ready (`detail_description`, `detail_description_en`). Public page not updated. |
| UI interface (101 keys) | 🟡 PARTIAL | Hardcoded fallback active. Translations Editor panel not built (v0.7). |

### Activation Conditions for Full Locale Module v0.7

- [ ] EN tabs in ExperiencesCRUD
- [ ] EN tabs in WorkshopsCRUD
- [ ] Public site locale rendering verified (GR → EN fallback)
- [ ] Fallback behavior for missing EN values defined
- [ ] detail_description integrated in public detail pages
- [ ] Interface translations panel built (~101 keys)

**See:** `docs/02_TENANTS/ktima-kareli/CONTENT_MAPPING.md` — Section 14: Locale Readiness Matrix

## What It Does NOT Solve (v0.7)

- 3+ γλώσσες (μόνο GR/EN)
- Machine translation
- CMS UI translation (only content)
- Real-time collaboration

## Quick Links

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Module architecture |
| [DATABASE.md](./DATABASE.md) | Database schema |
| [CMS.md](./CMS.md) | Translations editor panel |
| [WORKFLOW.md](./WORKFLOW.md) | Bilingual content workflow |
