# Session Objective

## Product
**KOL-001** — AION Psychology CMS (Νικόλας Κολοκοτρώνης)

## Business Goal
Να μπορεί ο διαχειριστής να ελέγχει από το CMS αν θα εμφανίζονται σχετικά άρθρα στις σελίδες υπηρεσιών του Νικόλα Κολοκοτρώνη, με πλήρη έλεγχο από την υπηρεσία.

## Current Phase
**Service-Level Related Articles (Milestone)** — Αντικατάσταση του προσωρινού `show_on_service_page` με πλήρες σύστημα διαχείρισης σχετικών άρθρων, προσβάσιμο τόσο από Υπηρεσίες όσο και από Άρθρα, με μία κοινή πηγή δεδομένων.

## Next Milestone
- Πιθανή επαναχρησιμοποίηση του pattern για Υπηρεσίες ↔ Testimonials, Υπηρεσίες ↔ FAQs, Υπηρεσίες ↔ Gallery

## Architecture Change
Η σχέση Υπηρεσίες ↔ Άρθρα γίνεται **πολλών-προς-πολλά** (many-to-many) μέσω junction table.
Αυτό είναι αλλαγή αρχιτεκτονικής του AION Flow, όχι απλό feature.

## UI Changes

### 1. Service Editor — Νέο tab "Σχετικά Άρθρα"
- ✅ Εμφάνιση σχετικών άρθρων (ON/OFF)
- Τρόπος επιλογής: Χειροκίνητα / Από κατηγορία / Πιο πρόσφατα
- Τίτλος ενότητας (EL + EN)
- Μέγιστος αριθμός άρθρων
- Αναζήτηση άρθρων
- Επιλογή πολλών άρθρων
- Drag & Drop / Up-Down ταξινόμηση

### 2. Blog Editor — Νέα ενότητα "Σχετίζεται με υπηρεσίες"
- Multi-select όλων των υπηρεσιών
- Παράδειγμα: ☑ Ατομική Ψυχοθεραπεία ☑ Ομαδική Ψυχοθεραπεία ☐ Συμβουλευτική Γονέων

### 3. Μία πηγή αλήθειας
Και οι δύο οθόνες ενημερώνουν τον ίδιο πίνακα: `service_related_articles`

## Acceptance Criteria
- [ ] Service Editor tab "Σχετικά Άρθρα" λειτουργεί (ON/OFF, mode, limit, title, article selection)
- [ ] Blog Editor multi-select υπηρεσιών λειτουργεί
- [ ] `service_related_articles` junction table: id, service_id, blog_post_id, sort_order, timestamps
- [ ] Νέα πεδία `services`: show_related_articles, related_articles_mode, related_articles_limit, related_articles_title, related_articles_title_en
- [ ] Default migration: Ομάδες + Ομιλίες & Σεμινάρια → ON, manual mode, υπάρχοντα άρθρα συνδεδεμένα
- [ ] Migration: idempotent, reversible, ON CONFLICT DO NOTHING, deterministic ordering (published_at DESC)
- [ ] Λειτουργεί για Super Admin + admin@kolokotronis.gr (όχι μόνο Super Admin)
- [ ] Public site: αν show_related_articles == false → δεν εμφανίζει ενότητα
- [ ] Public site modes: Manual (sort_order), Category (category + limit), Latest (published_at DESC)
- [ ] Legacy `show_on_service_page` παραμένει προσωρινά, με plan για migration → deprecation → removal
- [ ] Save + refresh διατηρεί ρυθμίσεις
- [ ] admin@kolokotronis.gr μπορεί να αλλάξει επιλογές

## Blocked By
- **Ο χρήστης αναφέρει ότι δεν βλέπει το checkpoint checkbox στο CMS.** Πρέπει πρώτα να επιβεβαιωθεί ότι το legacy feature λειτουργεί ή να προχωρήσουμε κατευθείαν στο νέο σύστημα.

## Implementation Plan
1. ✅ Project Identity Preflight (completed)
2. Database migration: create `service_related_articles` table + add columns to `services`
3. Default data migration: Ομάδες + Ομιλίες & Σεμινάρια
4. Service Editor: νέο tab "Σχετικά Άρθρα"
5. Blog Editor: multi-select υπηρεσιών
6. Public site: κατανάλωση νέων δεδομένων
7. Documentation: AGENTS.md, KOL-001.md, DATABASE.md, FEATURES.md, CHANGELOG.md, AD-004
8. Deploy + verify

## Verification
1. Migration: verify counts before and after (idempotent, reversible)
2. CMS: Service Editor tab visible and functional for both roles
3. CMS: Blog Editor multi-select functional
4. Public site: correct articles displayed per service
5. Save + refresh persistence
6. Database: no duplicates, correct sort_order
