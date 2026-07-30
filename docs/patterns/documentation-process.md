# Documentation Process — AION Flow

## Core Rule

> **No undocumented architecture is allowed.**
> Αν υπάρχει λειτουργικότητα που δεν περιγράφεται στα documentation, θεωρείται τεχνικό χρέος.

## Documentation-First Development

Πριν υλοποιηθεί οποιοδήποτε νέο module, subsystem ή αρχιτεκτονική αλλαγή:

1. **Architecture analysis** — Πώς επηρεάζει την πλατφόρμα
2. **Documentation update** — Ενημέρωση όλων των σχετικών docs
3. **Approval** — Η αρχιτεκτονική εγκρίνεται
4. **Implementation** — Μόνο τότε ξεκινάει η υλοποίηση

## Pre-Commit Checklist

```
Architecture changed?
  YES → Documentation updated?
    YES → Commit
    NO → STOP
  NO → Commit
```

## Documentation Structure

```
docs/
├── ARCHITECTURE.md         Core architecture
├── DATABASE.md             Database schema
├── MODULES.md              Module inventory
├── FEATURES.md             Feature catalog
├── ROADMAP.md              Development roadmap
├── DECISIONS.md            ADRs
├── CHANGELOG.md            Version history
├── PERMISSIONS.md          Permission model
├── DEPLOYMENT.md           Deployment guide
├── KNOWN_ISSUES.md         Known issues
├── TECH_DEBT.md            Technical debt
├── CODING_STANDARDS.md      Code conventions
├── CONTRIBUTING.md         Contribution guide
├── patterns/               Reusable patterns
│   ├── module-registry.md
│   ├── media-pipeline.md
│   ├── research-workflow.md
│   ├── portfolio-pattern.md
│   ├── editorial-review.md
│   ├── gallery-pattern.md
│   ├── timeline-pattern.md
│   ├── client-approval.md
│   ├── multi-project-pattern.md
│   ├── feature-flags.md
│   ├── tenant-isolation.md
│   └── documentation-process.md
└── modules/
    └── portfolio/
        ├── INTEGRATION_PLAN.md
        └── ... (per-module docs)
```

## Documentation Change Methodology

For the process of auditing, updating, consolidating, and maintaining existing documentation, see:

→ `docs/01_PLATFORM/DOCUMENTATION_METHODOLOGY.md`

This document covers Documentation-First *development* (writing docs before code). The methodology covers Documentation *change management* (auditing, updating, and maintaining existing docs).

---

## Per-Module Documentation

Κάθε module πρέπει να έχει:

| File | Purpose |
|------|---------|
| README.md | Overview, vision, scope |
| ARCHITECTURE.md | Technical design |
| DATABASE.md | Tables, relationships, RLS |
| CMS.md | Editor panels, fields |
| RESEARCH.md | Research methodology |
| MEDIA.md | Media specification |
| QA.md | Quality checklist |
| DESIGN.md | UI/UX specification |
| WORKFLOW.md | Editorial process |
| CHANGELOG.md | Module version history |
| ROADMAP.md | Module roadmap |
| LESSONS_LEARNED.md | Retrospective |
