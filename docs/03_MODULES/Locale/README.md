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
