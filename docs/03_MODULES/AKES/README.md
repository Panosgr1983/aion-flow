---
id: module.akes
title: AKES Module
domain: modules
type: module
status: current
maturity: standard
source_of_truth: true
owner: AION Engineering
tags:
  - akes
  - knowledge
  - governance
used_by:
  - aion-flow
relationships:
  uses:
    - platform
  related_methods:
    - module-maturity
    - tenant-isolation
  reusable_for:
    - Platform teams
    - Engineering organizations
mmi:
  l1: 4
  l2: 4
  l3: 4
  l4: 2
  verified: true
last_reviewed: 2026-07-13
review_after: 2026-10-13
---

# AKES Module — Dashboard

**Module Name:** akes
**Version:** 1.5.0
**Feature Flag:** `cms` (visible to Super Admin via `platform.akes.view`)
**Status:** PRODUCTION (v1.5 — Relationship Engine)

---

## Overview

Το AKES Dashboard είναι το GUI του AION Knowledge & Engineering System. Παρέχει το Module Maturity Index, Relationship Explorer, tenant readiness, blockers, documentation search και Technical Report.

## Route

`/dashboard/akes` — Super Admin only (`platform.akes.view`)

## Panels

| Panel | Content | Data Source |
|-------|---------|-------------|
| **Platform Stats** | 7 cards: Platform, Modules, Methods, Relationships, Tenants, Blockers, Stale | `documentation.db.json` _meta |
| **Relationship Explorer** | 3-tab graph: By Module, By Tenant, Reuse Suggestions | `documentation.db.json` _meta.relationships (auto-generated from frontmatter) |
| **Module Maturity Index** | 8 modules with L1-L4, status, verification, tenant count; click for detail | Auto-generated from `mmi` frontmatter via `docs:index` |
| **Tenant Readiness** | Per-tenant module stack + average MMI score | Auto-generated from relationships + MMI |
| **Active Blockers** | 5 blockers with severity + reference | Hardcoded (upstream tech debt tracker) |
| **Documentation Search** | Full-text search across all indexed docs (162 entries) | `documentation.db.json` entries (bundled at build time) |
| **Technical Report** | 10-point transparency: SoT, MMI calc, Relationship Engine, security, version | Self-documented in component |

## Architecture

```
AKESDashboard.tsx
  ├── import docIndex from 'src/assets/documentation.db.json' (build-time)
  ├── _meta
  │   ├── mmi_modules (auto-calculated from frontmatter mmi metadata)
  │   ├── relationships (auto-extracted from frontmatter relationships + used_by)
  │   ├── platform_mmi (average of all module scores)
  │   └── version info (generated_at, git_commit, index_version)
  ├── Relationship Explorer (3-tab: Module / Tenant / Reuse)
  ├── MMI Table (sorted, clickable, with tenant count)
  ├── Tenant Readiness (auto-generated from relationship graph)
  ├── BLOCKERS (hardcoded — TODO: migrate to DB)
  ├── Documentation Search (full-text across all entries)
  └── Technical Report (self-documenting)
```

## Data Sources

| Source | Type | Update Method |
|--------|------|---------------|
| Markdown docs (162 .md files) | **Source of Truth** | Manual edits, committed |
| `documentation.db.json` | **Generated read-only index** | `npm run docs:index` → commit → deploy |
| MMI scores | Auto-generated from `mmi` frontmatter in module docs | Re-index after module update |
| Relationships | Auto-generated from `relationships` + `used_by` frontmatter | Re-index after frontmatter update |
| Tenant scores | Auto-calculated from relationship graph + MMI | Re-index after any change |
| Blockers | Hardcoded (temp — migrating to DB) | Manual update |

### Pipeline

```
Markdown docs with YAML frontmatter (SoT)
  ↓ npm run docs:index
documentation.db.json (generated index + relationship graph)
  ↓ Vite build-time import (bundled into JS)
AKES Dashboard (runtime — NO public static asset)
```

### Security

The index JSON is NOT a public static asset. It is imported as a JavaScript module at build time and bundled by Vite. There is no direct URL to access it.

**History:** The file was originally at root path `/documentation.db.json` and was publicly accessible (HTTP 200). On 2026-07-13 it was moved to `src/assets/documentation.db.json` and is now imported via ES module import. The old path now returns the SPA HTML page (Vercel catch-all rewrite), not the JSON data.

## MMI Calculation

```
MMI = (L1 + L2 + L3 + L4) / 16 × 100

Each layer max: 4 criteria
≥80% → PRODUCTION  |  ≥60% → STABLE  |  ≥40% → DEVELOPMENT  |  ≥20% → EARLY  |  <20% → PLANNED
```

Scores are auto-calculated from the `mmi` field in module doc frontmatter by `docs:index`. No manual duplication.

## Relationship Engine

Το Relationship Engine εξάγει αυτόματα σχέσεις από τα YAML frontmatter των markdown docs:

| Relationship | Field | Example |
|-------------|-------|---------|
| Module dependencies | `relationships.uses` | `portfolio → [media, categories, ordering]` |
| Tenants | `used_by` | `retreat → [ktima-kareli]` |
| Methods | `relationships.related_methods` | `bookings → [tenant-resolution, bookings-pattern]` |
| Playbooks | `relationships.related_playbooks` | `bookings → [NEW_TENANT]` |
| Industry suggestions | `relationships.reusable_for` | `portfolio → [Hotels, Resorts, Airbnb]` |

Generated by `docs:index` — no database, no second source of truth.

## Security

| Aspect | Detail |
|--------|--------|
| Route protection | Super Admin only (`platform.akes.view`) |
| Tenant admin | BLOCKED — cannot access |
| Direct URL | Redirects to login → 403 for non-SA |
| Source data | READ-ONLY — dashboard never modifies indexed JSON |
| Runtime data | Imported at build time, bundled with Vite |

## Dependencies

- `documentation.db.json` (generated by `docs/scripts/index.mjs`)
- ModuleRegistry (self-registration via manifest)
- lucide-react icons

## Files

| File | Purpose |
|------|---------|
| `src/modules/akes/manifest.ts` | Module self-registration |
| `src/modules/akes/pages/AKESDashboard.tsx` | Dashboard component (~400 lines) |

---

**See also:**
- `docs/04_METHODS/Core/RELATIONSHIP_ENGINE.md` — Relationship Engine methodology
- `docs/04_METHODS/Core/MODULE_MATURITY.md` — full MMI methodology
