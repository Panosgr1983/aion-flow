# AION CMS — Version History & Conventions

## Version Convention

```
v<major>.<minor>.<patch>

major: Breaking changes (απαιτεί migration, rollback plan)
minor: Νέες λειτουργίες (backward compatible)
patch: Bug fixes (no schema changes, no new features)
```

## Current Version

**v0.3.2** (Tenant System) — Σε εξέλιξη

## Version History

| Version | Ημερομηνία | Σημαντικές αλλαγές |
|---------|-----------|-------------------|
| v0.1.0 | 2026-06-27 | Foundation release: CMS, CRM, Pipeline, Email, Multi-Tenant, JWT Hook |
| v0.2.0 | 2026-06-27 | Media Manager: uploadCmsAsset(), metadata, telemetry, Gallery, Docs overhaul |
| v0.3.0 | 2026-06-28 | **Single Source of Truth**: telemetry auto-tenant detection, Platform vs Workspace separation, capability guard (`can()`), system health cockpit, platform events, no more mock analytics |
| v0.3.1 | 2026-06-29 | site_logo_footer, site_favicon, dirtyKeys tracking, parallel save |
| v0.3.2 | 2026-07-06 | **Tenant System**: `effectiveTenantId`, auto-assign SA, localStorage sync, cleared tenant selection on login, docs MASTER overhaul |

## Milestone

**v0.3 — First Production Tenants**
Στόχος: 3-5 πραγματικοί πελάτες σε καθημερινή χρήση. Όλη η ανάπτυξη καθοδηγείται από customer feedback.

## Release Branches

```
main (v0.3.2 — live)
  └── develop (active)
        └── feature/*  → νέες λειτουργίες
        └── fix/*      → διορθώσεις
```

## Changelog Location

Δες [CHANGELOG.md](./CHANGELOG.md) για αναλυτικές αλλαγές ανά έκδοση.
