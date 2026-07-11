# Retreat Module — AION Flow

**Module Name:** retreat
**Version:** 0.1.0 (planned)
**Feature Flag:** retreat_module
**Professional Types:** retreat center, wellness resort, yoga retreat, eco lodge, guesthouse, camp, spa resort
**Status:** Planned (v0.6)

---

## Overview

Το Retreat Module είναι το δεύτερο vertical module του AION Flow. Παρέχει πλήρη διαχείριση για wellness retreats, καταφύγια και τουριστικά καταλύματα.

## What It Solves

- Διαχείριση experiences / δραστηριοτήτων
- Διαχείριση workshops / εργαστηρίων
- Διαχείριση εκδηλώσεων (bilingual GR/EN)
- Διαχείριση FAQ
- Pipeline κρατήσεων (form → DB → notification → manage)
- Gallery φωτογραφιών (reused from Portfolio Module)

## What It Does NOT Solve (v0.6)

- Online payments (future)
- Availability calendar (future)
- Automated confirmation emails (future)
- Room/accommodation CRUD (future)
- Multi-language experiences (v0.7)

## Relationships

| Depends On | Purpose |
|-----------|---------|
| Platform Core | ModuleRegistry, Tenant Isolation, Feature Flags |
| Media Engine | MediaPicker, Media Library |
| Portfolio Module | GalleryCRUD (reused) |
| Locale Module | Translations (v0.7) |

## Quick Links

| Document | Purpose |
|----------|---------|
| [MASTER.md](./MASTER.md) | Central reference |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Module architecture |
| [DATABASE.md](./DATABASE.md) | Database schema |
| [CMS.md](./CMS.md) | CMS panels |
| [MEDIA.md](./MEDIA.md) | Media specification |
| [QA.md](./QA.md) | QA checklist |
| [WORKFLOW.md](./WORKFLOW.md) | Editorial workflow |
| [LABELS.md](./LABELS.md) | Label mapping |
| [REPORTS/](./reports/) | Weekly reports |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [ROADMAP.md](./ROADMAP.md) | Roadmap |
| [LESSONS_LEARNED.md](./LESSONS_LEARNED.md) | Retrospective |
