# AION — Development Rules

> **Πώς δουλεύουμε. Single Source of Truth για την ανάπτυξη.**
> Αυτό το αρχείο ΔΕΝ παραβιάζεται.

---

## 1. Κανόνας #1: Version Control

```
Κανένα production deploy χωρίς έγκριση.
Κανένα overwrite.
Πάντα branch.
Πάντα diff.
Πάντα review.
Μετά approval.
Μετά merge.
Μετά deploy.
```

### Git Flow

```
main              → production (μόνο bug fixes)
  └── develop     → integration
        └── feature/*  → νέες λειτουργίες
        └── fix/*      → διορθώσεις
        └── release/v*.* → release branches
```

### Commit Convention

```
type: σύντομη περιγραφή

Τύποι:
  feat:    Νέο feature
  fix:     Διόρθωση bug
  docs:    Documentation
  refactor: Αλλαγή χωρίς αλλαγή λειτουργίας
  perf:    Επίδοση
  chore:   Build, CI, dependencies
  db:      Migration
```

### Πριν από κάθε commit

1. `git status` — έλεγξε τι αλλάζει
2. `git diff` — έλεγξε την αλλαγή (όχι secrets, όχι debug code)
3. `npm run build` — έλεγξε compilation
4. Δεν κάνεις commit secrets, API keys, .env

---

## 2. Documentation First

- Κάθε νέο feature γράφεται στο documentation ΠΡΙΝ τον κώδικα
- Documentation = Product → ενημερώνεται σε κάθε αλλαγή
- MASTER docs → η "μνήμη" του project
- CHANGELOG → αναλυτικές αλλαγές ανά έκδοση

---

## 3. Single Source of Truth

1. **Κανένα production dashboard δεν διαβάζει mock data.**
2. Mock data επιτρέπονται ΜΟΝΟ για demo mode / local dev.
3. Όλα τα components χρησιμοποιούν `effectiveTenantId`.
4. Το telemetry ΠΟΤΕ δεν πετάει exception.

---

## 4. Tenant Isolation

1. RLS στο επίπεδο database (όχι frontend filtering).
2. Όλα τα queries περνάνε από `withTenant()` helper.
3. Super admin bypass με JWT claims, όχι hardcoded.
4. `effectiveTenantId` για όλα τα components.

---

## 5. Security

1. SMTP credentials ΜΟΝΟ σε Edge Functions (όχι στο frontend).
2. Service role key ΜΟΝΟ σε environment variables.
3. RLS policies ελέγχονται σε κάθε migration.
4. JWT claims ελέγχονται σε κάθε deploy.

---

## 6. Review Process

1. Ο developer κάνει branch + diff
2. Παρουσιάζει diff στον product owner
3. Product owner εγκρίνει
4. Merge + deploy

---

## 7. 30-Minute Developer Onboarding

Ένας νέος developer πρέπει να διαβάσει (με αυτή τη σειρά):

1. `docs/MASTER/VISION.md` — 5 λεπτά: τι είναι το AION
2. `docs/MASTER/PROJECT_MEMORY.md` — 5 λεπτά: πώς εξελίχθηκε
3. `docs/MASTER/ARCHITECTURE_MAP.md` — 5 λεπτά: πώς δουλεύει
4. `docs/MASTER/PERMISSIONS_MATRIX.md` — 5 λεπτά: permissions
5. `docs/MASTER/CURRENT_STATE.md` — 3 λεπτά: τι έχει γίνει
6. `docs/DEVELOPMENT_RULES.md` — 3 λεπτά: πώς δουλεύουμε
7. `docs/TELEMETRY.md` — 2 λεπτά: telemetry
8. `docs/DECISIONS.md` — 2 λεπτά: γιατί πήραμε αυτές τις αποφάσεις

Σύνολο: ~30 λεπτά.

Μετά από αυτό, μπορεί να κάνει το πρώτο του feature branch.

---

## 8. Απαγορεύεται

❌ Push σε main χωρίς PR/review
❌ Deploy χωρίς approval
❌ Overwrite σε GitHub ή Vercel
❌ `selectedTenantId` απευθείας σε component
❌ `refreshSession()` χωρίς έλεγχο
❌ Mock data σε production
❌ Secrets σε commits
❌ Hardcoded tenant IDs
❌ `console.log` σε production (μόνο `trackEvent`)
