# AION CMS — Architecture Decision Records

Κάθε σημαντική απόφαση καταγράφεται εδώ με ημερομηνία, σκεπτικό,
alternatives και επιπτώσεις.

---

## ADR-001: Supabase ως Backend & Database

**Ημερομηνία:** 2026-06-06
**Κατάσταση:** Εφαρμοσμένη

### Πλαίσιο
Χρειαζόμασταν μια λύση που να παρέχει authentication, database, storage
και realtime capabilities χωρίς να διαχειριζόμαστε servers.

### Απόφαση
Επιλέξαμε Supabase (PostgreSQL + Auth + Storage + Edge Functions).

### Alternatives
| Λύση | Απερρίφθη λόγω |
|------|---------------|
| Firebase | Μη σχεσιακή βάση, vendor lock-in, περιορισμένα queries |
| AWS Amplify | Πολύπλοκο setup, overengineered για την κλίμακα μας |
| Self-hosted stack | Δεν είχε νόημα χωρίς DevOps team |

### Επιπτώσεις
- ✅ Serverless, zero DevOps overhead
- ✅ PostgreSQL για relational data
- ✅ Row Level Security (RLS) για tenant isolation
- ⚠️ Platform dependency — migration plan απαραίτητο

---

## ADR-002: Multi-Tenant με JWT Hook + RLS

**Ημερομηνία:** 2026-06-10
**Κατάσταση:** Εφαρμοσμένη (με διόρθωση)

### Πλαίσιο
Κάθε χρήστης ανήκει σε συγκεκριμένο tenant και πρέπει να βλέπει μόνο
τα δεδομένα του. Χρειαζόμασταν isolation σε επίπεδο database.

### Απόφαση
Δημιουργήσαμε custom JWT hook (SECURITY DEFINER) που διαβάζει το
`profiles` table και injects `user_role` + `is_super_admin` στο JWT.
Όλα τα queries περνάνε από RLS policies που ελέγχουν `tenant_id`.

### Διδάγματα
- ❌ Πρώτη υλοποίηση χρησιμοποιούσε `role` αντί για `user_role` —
  διέγραφε το standard `role: "authenticated"` και προκαλούσε σφάλμα
  "role 'admin' does not exist" σε όλα τα REST API queries
- ✅ Διορθώθηκε στο migration `20260610000014_fix_jwt_role_claim.sql`
- ✅ Super admin bypass: `is_super_admin = true` παρακάμπτει RLS

---

## ADR-003: Edge Functions για Email (send-contact-email)

**Ημερομηνία:** 2026-06-10
**Κατάσταση:** Εφαρμοσμένη

### Πλαίσιο
Χρειαζόμασταν αποστολή email από contact forms χωρίς να εκθέσουμε
SMTP credentials στο frontend.

### Απόφαση
Δημιουργήσαμε Supabase Edge Function `send-contact-email` που:
- Δέχεται request από trigger function `handle_new_contact_submission()`
- Στέλνει email μέσω SMTP (Gmail App Password)
- Καταγράφει το αποτέλεσμα στο `contact_messages.status`

### Μέλλον
- ❌ Gmail SMTP έχει όριο 500 emails/day
- ⏳ Σχεδιάζεται μετάβαση σε SendGrid / Resend για production scale

---

## ADR-004: Feature Branches + Dev Environment

**Ημερομηνία:** 2026-06-27
**Κατάσταση:** Εφαρμοσμένη

### Πλαίσιο
Το AION έχει 7+ πελάτες σε παραγωγή. Δεν μπορούμε να ρισκάρουμε
deploy χωρίς testing.

### Απόφαση
Διπλό περιβάλλον:
- **Production:** `main` branch + Supabase Production
- **Development:** feature/release branches + Supabase Dev

Git flow:
```
main → only bug fixes
  └── develop → integration
        └── release/v*.* → feature branches
```

### Κανόνες
- Feature flags για μεγάλες αλλαγές
- Preview deploy πριν production
- Migration πάντα σε dev πρώτα
- Rollback plan γραπτό πριν deploy

---

## ADR-005: Τρία επίπεδα Upload Pipeline

**Ημερομηνία:** 2026-06-27
**Κατάσταση:** Σχεδιασμένη (προς υλοποίηση)

### Πλαίσιο
Το `storage.ts` είχε γίνει God module — ήξερε Storage, Media, business
logic. Αυτό δεν ήταν maintainable.

### Απόφαση
Διαχωρισμός σε τρία επίπεδα:

| Layer | Αρχείο | Ευθύνη |
|-------|--------|--------|
| Level 1 | `storage.ts` | Μόνο upload/download/delete. Επιστρέφει `{ url, path, filename }` |
| Level 2 | `media.ts` | Media CRUD (insert, select, update, delete στον `media` πίνακα) |
| Level 3 | `uploadAsset()` | Business logic: combine storage + media + metadata |

### Οφέλη
- ✅ To `storage.ts` παραμένει "χαζό" — δεν ξέρει από tenants, categories, κλπ.
- ✅ To `media.ts` είναι pure CRUD — testable, replaceable
- ✅ Η `uploadAsset()` είναι το μόνο σημείο που αλλάζει όταν αλλάζουν requirements
- ✅ Το `uploadImage()` παραμένει untouched → backward compatible
