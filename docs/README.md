# AION — Documentation

> **Single Source of Truth για ολόκληρο το project.**
> Διάβασε αυτό το README πρώτο — σου δείχνει πού να βρεις τι.

---

## 🧭 30-Minute Developer Onboarding

Ένας νέος developer διαβάζει **με αυτή τη σειρά**:

| Βήμα | Αρχείο | Χρόνος |
|------|--------|--------|
| 1 | `docs/MASTER/VISION.md` | 5' — τι είναι το AION |
| 2 | `docs/MASTER/PROJECT_MEMORY.md` | 5' — πώς εξελίχθηκε |
| 3 | `docs/MASTER/ARCHITECTURE_MAP.md` | 5' — πώς δουλεύει |
| 4 | `docs/MASTER/PERMISSIONS_MATRIX.md` | 5' — permissions |
| 5 | `docs/MASTER/CURRENT_STATE.md` | 3' — τι έχει γίνει |
| 6 | `docs/MASTER/DEVELOPMENT_RULES.md` | 3' — πώς δουλεύουμε |
| 7 | `docs/TELEMETRY.md` | 2' — telemetry |
| 8 | `docs/DECISIONS.md` | 2' — γιατί πήραμε αυτές τις αποφάσεις |

**Σύνολο: ~30 λεπτά.** Μετά μπορείς να κάνεις το πρώτο feature branch.

---

## 📂 Δομή `docs/`

```
docs/
├── README.md                  ← ΕΣΥ ΕΔΩ — entry point
├── MASTER/                    ← Single Source of Truth
│   ├── VISION.md              ← Όραμα, non-negotiables
│   ├── PROJECT_MEMORY.md      ← Evolution, lessons
│   ├── CURRENT_STATE.md       ← Τι δουλεύει, τι εκκρεμεί
│   ├── ARCHITECTURE_MAP.md    ← High-level architecture & data flow
│   ├── PERMISSIONS_MATRIX.md  ← Πίνακας δικαιωμάτων ανά ρόλο
│   └── DEVELOPMENT_RULES.md   ← Git flow, conventions, απαγορεύσεις
│
├── ARCHITECTURE.md            ← Λεπτομερής αρχιτεκτονική
├── PERMISSIONS.md             ← Λεπτομερή permissions (μαζί με MASTER)
├── DATABASE.md                ← DB schema, views, policies
├── DECISIONS.md               ← ADRs (Architecture Decision Records)
├── CHANGELOG.md               ← Releases ανά έκδοση
├── ROADMAP.md                 ← Μελλοντικές εκδόσεις
├── VERSIONS.md                ← Version history & release branches
├── TELEMETRY.md               ← Telemetry & usage events
│
├── DEPLOYMENT.md              ← Deploy guides
├── BACKUP.md                  ← Backup/restore
├── MODULES.md                 ← Module descriptions
│
├── 01-Architecture.md ...     ← Παλαιότερα (σε μετάβαση σε MASTER/)
│
├── AION-FLOW-COMPLETE.md      ← Full flow documentation
├── CODING_STANDARDS.md        ← Code style & conventions
├── CONTRIBUTING.md            ← Contribution guide
├── COPYWRITING.md             ← Copy & tone
├── DESIGN_PRINCIPLES.md       ← UI/UX principles
├── FEATURES.md                ← Feature overview
├── KNOWN_ISSUES.md            ← Known issues & workarounds
├── MANIFESTO.md               ← Product manifesto
├── PRODUCT_PHILOSOPHY.md      ← Business decisions (σταθερές)
└── TECH_DEBT.md               ← Technical debt log
```

---

## 🔗 Key References

| Θέμα | Πού να κοιτάξεις |
|------|-----------------|
| Τι είναι το AION | `MASTER/VISION.md` |
| Τι έχει γίνει | `MASTER/CURRENT_STATE.md` |
| Πώς δουλεύουμε | `MASTER/DEVELOPMENT_RULES.md` |
| Ποιος βλέπει τι | `MASTER/PERMISSIONS_MATRIX.md` + `PERMISSIONS.md` |
| Γιατί πήραμε αποφάσεις | `DECISIONS.md` |
| DB schema | `DATABASE.md` |
| Deploy | `DEPLOYMENT.md` |
| Latest changes | `CHANGELOG.md` |
| Τι έπεται | `ROADMAP.md` |
| Τεχνικό χρέος | `TECH_DEBT.md` |
| Code conventions | `CODING_STANDARDS.md` |
| Telemetry events | `TELEMETRY.md` |

---

## ⚠️ Σημαντικοί Κανόνες

1. **Documentation = Product.** Δεν είναι auxiliary material.
2. **MASTER/ είναι Single Source of Truth.** Αν υπάρχει αντίφαση μεταξύ MASTER και άλλου doc, το MASTER κερδίζει.
3. **Κάθε feature γράφεται στο documentation ΠΡΙΝ τον κώδικα.**
4. **Δεν υπάρχει production dashboard με mock data.**
5. **Αν κάτι αλλάζει, ενημέρωσε τα docs ΠΡΙΝ commit.**
