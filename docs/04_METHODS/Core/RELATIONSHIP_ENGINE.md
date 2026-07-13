---
id: method.relationship-engine
title: Relationship Engine
domain: methods
type: method
status: current
maturity: standard
source_of_truth: true
owner: AION Engineering
tags:
  - relationships
  - graph
  - metadata
  - index
last_reviewed: 2026-07-13
review_after: 2026-10-13
---

# Relationship Engine — AKES v1.5

**Part of AKES v1.5**
**Status:** Standard — applies to ALL module docs with frontmatter

---

## Principle

**Metadata-first, no database.** Relationships are declared in YAML frontmatter of Markdown docs. The `docs:index` script extracts them at index time and generates a relationship graph. The Dashboard reads the graph — zero new tables, zero second sources of truth.

## Schema

Add to any module doc frontmatter:

```yaml
used_by:
  - tenant-id            # Tenants using this module
relationships:
  uses:
    - module-id          # Modules this depends on
  related_methods:
    - method-id          # Methods referenced
  related_playbooks:
    - playbook-id        # Playbooks followed
  reusable_for:
    - Industry           # Suggested verticals
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `used_by` | `string[]` | No | Tenant IDs that use this module (top-level) |
| `relationships.uses` | `string[]` | No | Module IDs this module depends on (lowercase, hyphenated) |
| `relationships.related_methods` | `string[]` | No | Method doc IDs this module references |
| `relationships.related_playbooks` | `string[]` | No | Playbook doc IDs this module follows |
| `relationships.reusable_for` | `string[]` | No | Industries/verticals where this module is proven |

## Generated Graph

The indexer produces:

```json
{
  "_meta": {
    "relationships": {
      "by_module": {
        "portfolio": {
          "uses": ["media", "categories", "ordering"],
          "used_by": ["blog", "retreat"]
        },
        "media": {
          "used_by": ["blog", "portfolio", "retreat", "bookings"]
        }
      },
      "by_tenant": {
        "ktima-kareli": ["bookings", "locale", "media", "portfolio", "retreat"],
        "kolokotronis": ["blog", "crm", "media", "portfolio"]
      },
      "by_method": {
        "tenant-resolution": ["blog", "bookings", "crm", "locale", ...],
        "bookings-pattern": ["bookings", "retreat"]
      },
      "by_playbook": {
        "NEW_TENANT": ["bookings", "retreat"]
      },
      "reusable_for": {
        "Hotels": ["blog", "bookings", "portfolio", "retreat"],
        "Consultants": ["blog", "crm", "portfolio"]
      }
    }
  }
}
```

### Inferred Edges

- **Reverse references:** If module A declares `uses: [media]`, the indexer automatically adds A to `media.used_by`. No manual declaration needed.
- **Tenant readiness:** Per-tenant score = average MMI of all modules the tenant uses.
- **Reuse confidence:** Based on tenant count + MMI maturity. More tenants + higher MMI = higher confidence.

## Adding Relationships

1. Open the module's `README.md` or `MASTER.md`
2. Add `used_by` and/or `relationships` to frontmatter
3. Run `npm run docs:index`
4. Commit the updated index

### Validation

- Module IDs referenced in `uses` should match existing `id` fields in other module frontmatter
- Tenant IDs in `used_by` should match tenant doc IDs in `02_TENANTS/`
- Method IDs in `related_methods` should match method doc IDs in `04_METHODS/`
- Playbook IDs in `related_playbooks` should match playbook IDs in `06_PLAYBOOKS/`

## Current State (2026-07-13)

| Entity | Count |
|--------|-------|
| Modules with relationships | 8 (all module docs) |
| Tenants mapped | 3 (kolokotronis, ktima-kareli, aion-flow) |
| Methods referenced | 6 |
| Playbooks referenced | 1 (NEW_TENANT) |
| Industries mapped | 16 |
| Graph entities | 12 module-like entities |
| Database tables | 0 |

## Future

- **v2:** Move to database-backed graph when we have 15-20 tenants
- **v2.5:** Knowledge Graph visualization (entity nodes with connection lines)
- **v3:** AI-powered pattern matching from relationship data

## See Also

- `docs/03_MODULES/AKES/README.md` — AKES Dashboard
- `docs/scripts/index.mjs` — Indexer implementation
- `src/modules/akes/pages/AKESDashboard.tsx` — Relationship Explorer UI
