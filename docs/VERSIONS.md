# AION CMS — Version History & Conventions

## Version Convention

```
v<major>.<minor>.<patch>

major: Breaking changes (απαιτεί migration, rollback plan)
minor: Νέες λειτουργίες (backward compatible)
patch: Bug fixes (no schema changes, no new features)
```

## Current Version

**v0.3.0** (Single Source of Truth) — In development

## Version History

| Version | Ημερομηνία | Σημαντικές αλλαγές |
|---------|-----------|-------------------|
| v0.1.0 | 2026-06-27 | Foundation release: CMS, CRM, Pipeline, Email, Multi-Tenant, JWT Hook |
| v0.2.0 | 2026-06-27 | Media Manager: uploadCmsAsset(), metadata, telemetry, Gallery, Docs overhaul |
| v0.3.0 | 2026-06-28 | **Single Source of Truth**: telemetry auto-tenant detection, Platform vs Workspace separation, capability guard (`can()`), system health cockpit, platform events, no more mock analytics |

## Milestone

**v0.3 — First Production Tenant**
Στόχος: 3-5 πραγματικοί πελάτες σε καθημερινή χρήση. Όλη η ανάπτυξη από εδώ και πέρα καθοδηγείται από customer feedback, όχι από υποθέσεις.

## Release Branches

```
main (v0.1.0 — live)
  └── develop
        └── release/v0.3 (Single Source of Truth — active development)
```

## Changelog Location

Δες [CHANGELOG.md](./CHANGELOG.md) για αναλυτικές αλλαγές ανά έκδοση.
