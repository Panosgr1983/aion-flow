# AION CMS — Design Principles

> Οι αρχές πάνω στις οποίες χτίζεται κάθε feature.
>
> Αυτό το έγγραφο είναι η πυξίδα για κάθε απόφαση του developer.
> Όχι implementation. Όχι architecture. Οι κανόνες.

---

## 1. Every feature must solve a real customer problem.

Κανένα feature δεν μπαίνει επειδή είναι "cool" ή "trending".
Πρέπει να απαντάει σε μια πραγματική ανάγκη που προκύπτει από:

- Πελάτη
- Αγορά
- Support request

Αλλιώς δεν μπαίνει.

---

## 2. Configuration before customization.

Πριν γράψεις custom code για έναν πελάτη, ρώτα:

> Μπορεί αυτό να γίνει configurable στο CMS;

Αν ναι, γίνεται setting. Όχι fork. Όχι branch. Όχι one-off.

Το AION δεν είναι bespoke. Είναι πλατφόρμα.

---

## 3. Every feature must work in multi-tenant mode.

Από την πρώτη γραμμή κώδικα.

Δεν υπάρχει "θα το κάνουμε tenant-aware αργότερα".
Δεν υπάρχει "τώρα το φτιάχνουμε για έναν πελάτη".

Tenant isolation είναι προϋπόθεση, όχι αναβάθμιση.

---

## 4. Telemetry first.

Κάθε feature:

- Γεννάει events
- Καταγράφει usage
- Μετριέται

Αν δεν μπορείς να μετρήσεις αν ένα feature χρησιμοποιείται,
δεν ξέρεις αν αξίζει να υπάρχει.

---

## 5. AI consumes structured data.

Το AION θα τροφοδοτεί AI συστήματα.

Άρα:

- Τα settings είναι JSON (όχι ελεύθερο κείμενο)
- Τα metadata είναι structured
- Οι κανόνες είναι machine-readable

Αν ένα πεδίο είναι free-text, το AI δεν μπορεί να το διαβάσει.

---

## 6. Documentation is part of the feature.

Ένα feature δεν είναι complete αν δεν έχει:

- Τεκμηρίωση στο docs/
- Entry στο FEATURES.md
- Καταγραφή σε KNOWN_ISSUES.md ή TECH_DEBT.md (αν χρειάζεται)
- Telemetry

---

## 7. Features are modules, not one-off implementations.

Κάθε feature ανήκει σε ένα module.

Αν δεν ξέρεις σε ποιο module ανήκει, δεν ξέρεις ακόμα τι χτίζεις.

Το module ορίζει:

- Πού μένει ο κώδικας
- Πώς συνδέεται με τα άλλα modules
- Ποιος το συντηρεί

---

## 8. Every feature should improve future projects.

Πριν γράψεις κώδικα, ρώτα:

> Θα το ξαναχρησιμοποιήσουμε;

Αν ναι, γίνεται reusable component ή helper.
Αν όχι, μήπως δεν πρέπει να το κάνουμε;

---

## 9. Default experience first. Advanced settings second.

Ο μέσος χρήστης δεν αλλάζει settings.

Άρα:

- Το default πρέπει να είναι σωστό
- Η βασική ροή πρέπει να είναι προφανής
- Τα advanced settings δεν μπαίνουν μπροστά

---

## 10. Delete complexity before adding functionality.

Όταν ένα feature γίνεται πολύπλοκο, η λύση δεν είναι:

❌ "Ας προσθέσουμε άλλο ένα setting"

Αλλά:

✅ "Τι μπορούμε να αφαιρέσουμε;"

---

## Application

| Principle | Applies when… |
|-----------|--------------|
| #1 | Proposing a new feature |
| #2 | Building for a specific client |
| #3 | Writing any query or component |
| #4 | Shipping any feature |
| #5 | Defining data models |
| #6 | Closing a PR |
| #7 | Organizing code |
| #8 | Writing utilities |
| #9 | Designing UI |
| #10 | Refactoring |

---

_Τελευταία ενημέρωση: 2026-06-27_
