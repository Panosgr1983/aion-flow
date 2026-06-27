# AION CMS — Version History & Conventions

## Version Convention

```
v<major>.<minor>.<patch>

major: Breaking changes (απαιτεί migration, rollback plan)
minor: Νέες λειτουργίες (backward compatible)
patch: Bug fixes (no schema changes, no new features)
```

## Current Version

**v0.2.0** (Media Manager) — In development

## Version History

| Version | Ημερομηνία | Σημαντικές αλλαγές |
|---------|-----------|-------------------|
| v0.1.0 | 2026-06-27 | Foundation release: CMS, CRM, Pipeline, Email, Multi-Tenant, JWT Hook |
| v0.2.0 | 2026-06-27 | Media Manager: uploadCmsAsset(), metadata, telemetry, Gallery, Docs overhaul |

## Release Branches

```
main (v0.1.0 — live)
  └── develop
        └── release/v0.2 (Media Manager — active development)
```

## Changelog Location

Δες [CHANGELOG.md](./CHANGELOG.md) για αναλυτικές αλλαγές ανά έκδοση.
