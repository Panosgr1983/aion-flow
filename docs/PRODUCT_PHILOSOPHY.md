# AION CMS — Product Philosophy

> Οι αρχές που δεν αλλάζουν.
>
> Τα ADRs (`DECISIONS.md`) τεκμηριώνουν τεχνικές αποφάσεις —
> μπορεί να αλλάξουν όταν αλλάζει η τεχνολογία.
>
> Αυτό το έγγραφο τεκμηριώνει επιχειρηματικές αποφάσεις —
> δεν αλλάζει χωρίς επαναπροσδιορισμό του προϊόντος.

---

## PD-001: Δεν πουλάμε websites. Πουλάμε Customer Operating Systems.

Το AION δεν είναι CMS. Είναι η πλατφόρμα πάνω στην οποία χτίζεται
ολόκληρο το λειτουργικό σύστημα μιας επιχείρησης.

Ένας φούρνος δεν αγοράζει "CMS + Gallery + Newsletter".
Αγοράζει **AION Bakery OS**.

Ένας γιατρός αγοράζει **AION Medical OS**.
Ένα ξενοδοχείο αγοράζει **AION Hospitality OS**.

Όλα βασίζονται στον ίδιο κώδικα. Αλλάζει μόνο το configuration.

---

## PD-002: Ένας κοινός Core. Ποτέ forks ανά πελάτη.

Δεν δημιουργούμε ξεχωριστό repository, deployment ή version
για κανέναν πελάτη. Ποτέ.

Το AION είναι ένα codebase. Ένα deployment. Ένα SaaS.

Αν μια αλλαγή χρειάζεται fork, τότε δεν έχει σχεδιαστεί σωστά.

---

## PD-003: Κάθε feature πρέπει να εξυπηρετεί περισσότερους από έναν πελάτες.

Πριν γράψεις κώδικα, αναρωτήσου:

> Αυτό που φτιάχνω είναι feature για έναν πελάτη ή δυνατότητα
> που μπορεί να αξιοποιήσει ολόκληρη η πλατφόρμα;

Αν η απάντηση είναι "μόνο για έναν πελάτη", ξανασχεδίασέ το.

---

## PD-004: Κάθε νέος πελάτης πρέπει να κάνει το προϊόν καλύτερο για όλους.

Κάθε onboarding είναι ευκαιρία να βελτιωθεί η πλατφόρμα.

- Νέος πελάτης → νέα industry profile
- Νέο αίτημα → νέο module ή configuration option
- Νέο bug → fix για όλους

Το AION βελτιώνεται με κάθε πελάτη, όχι παρά τη συμμετοχή του.

---

## PD-005: Τα Industry Profiles είναι configurations, όχι διαφορετικά προϊόντα.

Το Industry Profile είναι ένα JSON config. Δεν είναι fork.
Δεν είναι νέο product. Δεν είναι custom development.

Ορίζει:
- Ποια modules ενεργοποιούνται
- Ποια navigation structure εμφανίζεται
- Ποια permissions ισχύουν
- Ποιο blueprint website χρησιμοποιείται

---

## PD-006: Revenue πριν από complexity.

Κάθε νέο feature αξιολογείται με τη σειρά:

1. Πόσοι πελάτες το ζήτησαν;
2. Πόσο revenue θα φέρει;
3. Πόσο complexity προσθέτει στο Core;
4. Μπορεί να γίνει module αντί core feature;

Αν το complexity υπερβαίνει το revenue, δεν μπαίνει.

---

## PD-007: Build once. Configure infinitely.

Αυτή είναι η θεμελιώδης αρχή του AION.

Κάθε γραμμή κώδικα γράφεται μία φορά.
Κάθε feature υλοποιείται μία φορά.
Κάθε bug διορθώνεται μία φορά.

Η διαφοροποίηση γίνεται μέσω configuration:
- Tenant settings
- Module flags
- Industry profiles
- Blueprint definitions
- Role permissions

---

## How to use this document

| Αρχή | Εφαρμόζεται όταν… |
|------|------------------|
| PD-001 | Ορίζεις product strategy, pricing, positioning |
| PD-002 | Κάποιος προτείνει fork ή custom deployment |
| PD-003 | Σχεδιάζεις νέο feature |
| PD-004 | Onboardεις νέο πελάτη |
| PD-005 | Ορίζεις industry profile structure |
| PD-006 | Αξιολογείς feature request |
| PD-007 | Γράφεις οποιοδήποτε configuration |

---

_Τελευταία ενημέρωση: 2026-06-27_
