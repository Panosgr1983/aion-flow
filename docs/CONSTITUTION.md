# AION Flow Development Constitution

**Effective:** 2026-07-08
**Type:** Platform-wide policy
**Scope:** All modules, subsystems, panels, and features
**Enforcement:** Pre-commit checklist, code review, documentation audit

---

## Golden Rule #1 — No Docs. No Done.

Ένα feature, module ή panel δεν θεωρείται ολοκληρωμένο μέχρι να υπάρχουν:

- ✅ Κώδικας
- ✅ Migration (αν απαιτείται)
- ✅ QA
- ✅ Documentation
- ✅ Commit
- ✅ Changelog

Αν λείπει έστω ένα: **Status = In Progress.**

---

## Golden Rule #2 — Documentation First

Πριν ξεκινήσει οποιοδήποτε νέο subsystem:

1. Architecture analysis
2. Database schema
3. Workflow design
4. Documentation update
5. Approval
6. Implementation

---

## Golden Rule #3 — Every Commit Teaches the System

Κάθε commit πρέπει να αφήνει πίσω του γνώση:

```
Code
  ↓
Documentation
  ↓
Pattern
  ↓
Lesson Learned
  ↓
Reusable Knowledge
```

---

## Golden Rule #4 — Every Panel Must Produce

```
Code
QA
Documentation
Report
Lessons Learned
Commit
```

---

## Golden Rule #5 — Every Reusable Discovery Becomes a Pattern

Αν βρεθεί καλύτερος τρόπος για RichEditor, MediaPicker, Validation, History, Autosave, τότε δημιουργείται ή ενημερώνεται docs/patterns/.

Η γνώση δεν μένει κρυμμένη στον κώδικα.

---

## Golden Rule #6 — Every Module Owns Its Documentation

```
docs/modules/{module}/
├── README.md
├── MASTER.md
├── ARCHITECTURE.md
├── DATABASE.md
├── CMS.md
├── MEDIA.md
├── QA.md
├── WORKFLOW.md
├── REPORTS/
│   ├── week-01-{panel}.md
│   └── ...
├── CHANGELOG.md
├── ROADMAP.md
└── LESSONS_LEARNED.md
```

Κάποιος πρέπει να μπορεί να καταλάβει ολόκληρο το module χωρίς να ανοίξει .tsx.

---

## Golden Rule #7 — Reports Are Mandatory

Μετά από κάθε ολοκληρωμένο panel:

```
reports/week-01-{panel}.md
```

Περιεχόμενο: Scope, Decisions, QA, Documentation Updated, Known Issues, Lessons Learned, Next Steps.

---

## Golden Rule #8 — Architecture Never Lives Only in Code

Αλλαγές σε Database, Routing, Registry, Permissions, Feature Flags, Module Structure, Media Pipeline ενημερώνουν υποχρεωτικά:

- ARCHITECTURE.md
- DATABASE.md
- MODULES.md
- DECISIONS.md
- FEATURES.md
- CHANGELOG.md

---

## Definition of Done (DoD)

Κάθε ολοκληρωμένη εργασία πρέπει να περνάει:

- [ ] Requirements υλοποιημένα
- [ ] Code review
- [ ] Build χωρίς errors
- [ ] QA ολοκληρωμένο
- [ ] Documentation ενημερωμένο
- [ ] Patterns ενημερωμένα (αν προέκυψαν)
- [ ] Reports δημιουργημένα
- [ ] Changelog ενημερωμένο
- [ ] Roadmap ενημερωμένος
- [ ] Commit με σαφές μήνυμα

**Αν λείπει έστω ένα: το feature είναι Work in Progress, όχι Done.**

---

## Pre-Commit Checklist

```
Architecture changed?
  YES → Documentation updated?
    YES → Commit
    NO → STOP
  NO → Continue

New panel completed?
  Report created?
    YES → Commit
    NO → STOP

Pattern discovered?
  docs/patterns/ updated?
    YES → Continue
    NO → STOP
```

---

*This Constitution is a living document. Updates require ADR and documentation update.*
