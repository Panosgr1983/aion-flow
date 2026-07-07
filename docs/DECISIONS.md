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

---

## ADR-005: Modular Architecture (Core + Modules)

**Ημερομηνία:** 2026-06-27
**Κατάσταση:** Εφαρμοσμένη

### Πλαίσιο
Κάθε πελάτης έχει διαφορετικές ανάγκες. Ένας φούρνος χρειάζεται διαφορετικά modules από ένα yoga retreat. Δεν μπορεί να υπάρχει "ένα CMS για όλους" γιατί δημιουργεί πολυπλοκότητα, αλλά ούτε και "ξεχωριστό fork για κάθε πελάτη" γιατί σκοτώνει την κερδοφορία.

### Απόφαση
Το AION είναι ένα repository. Ένας Core Engine. Ένα κοινό SaaS. Η διαφοροποίηση γίνεται μέσω:

```
Core Platform (πάντα ενεργό):
  Authentication, Tenants, Users, Media,
  Pages, SEO, Settings, Analytics, Backups

Modules (ενεργοποιούνται ανά tenant):
  CRM, Pipeline, Bookings, Email Workspace,
  Newsletter, Eshop, Gallery, Quotes, Invoices,
  Loyalty, Memberships

Tenant Configuration:
  Ποια modules είναι enabled
  Navigation structure
  Permissions
  Default content
```

### Εναλλακτικές
| Λύση | Απερρίφθη λόγω |
|------|---------------|
| Per-client fork | 40 repos, 40 deployments, 40 bugs — unsustainable |
| One-size-fits-all | Πολυπλοκότητα, UI overload, confused users |

### Επιπτώσεις
- ✅ Ένα deployment για όλους τους πελάτες
- ✅ Feature flags σε επίπεδο tenant
- ✅ No code duplication across clients
- ✅ Κάθε bug fix διορθώνεται μία φορά
- ⚠️ Απαιτεί configuration engine (βλ. ADR-006)
- ⚠️ Modules must be isolated (no circular dependencies)

---

## ADR-006: Industry Profiles & Configuration Engine

**Ημερομηνία:** 2026-06-27
**Κατάσταση:** Σχεδιασμένη (σε φάση σχεδιασμού)

### Πλαίσιο
Το ADR-005 ορίζει modular architecture. Απομένει το ερώτημα: πώς αποφασίζουμε ποια modules ενεργοποιούνται για κάθε νέο πελάτη; Η απάντηση: **Industry Profiles**. Κάθε νέος tenant επιλέγει βιομηχανία και το σύστημα ενεργοποιεί αυτόματα το κατάλληλο σύνολο modules, permissions, navigation και default content.

### Απόφαση
Το AION θα χρησιμοποιεί Industry Profiles ως configuration layer:

```
Industry Profile (π.χ. Bakery)
  └── Enabled Modules: CMS, Gallery, Products, Offers, SEO, Newsletter
  └── Navigation: custom menu structure
  └── Permissions: role presets
  └── Default Content: pages, sections, copy
  └── Widgets: dashboard cards, analytics
  └── Blueprint: website structure (σύνδεση με BLUEPRINTS.md)

Παραδείγματα:
  Bakery      → CMS, Gallery, Products, Offers, SEO, Newsletter
  Yoga Retreat → CMS, Bookings, Events, Gallery, Testimonials, Email
  Dentist     → CMS, Appointments, Patients, Services, Reviews, CRM
  Lawyer      → CMS, Appointments, Documents, Cases, CRM, Invoices
```

### Εναλλακτικές
| Λύση | Απερρίφθη λόγω |
|------|---------------|
| Χειροκίνητη επιλογή modules | Αργή onboarding, ανθρώπινο λάθος |
| Hardcoded per tenant | Σπάει το ADR-005 |

### Σχέση με Blueprints
Τα Industry Profiles συνδέονται με τα Blueprints (βλ. `docs/BLUEPRINTS.md`):
- **Blueprint:** Ορίζει website page architecture + SEO + copy
- **Industry Profile:** Ορίζει CMS modules + navigation + permissions + automation

Μαζί παράγουν ολόκληρο το Customer Operating System.

### Επιπτώσεις
- ✅ Onboarding 10x ταχύτερο
- ✅ Consistent UX ανά βιομηχανία
- ✅ Κάθε νέος πελάτης βελτιστοποιεί την πλατφόρμα
- ✅ Τα blueprints γίνονται από website templates → OS generators
- ⚠️ Χρειάζεται configuration engine (να διαβάζει profiles και να ενεργοποιεί modules)
- ⚠️ Χρειάζεται migration για υπάρχοντες tenants
- **Target:** v0.4

### Implementation Note
Ο developer δεν γράφει νέο CMS για κάθε πελάτη.
Το AION φορτώνει διαφορετικό configuration.
Build once. Configure infinitely.

---

## ADR-007: Three-Tier Tenant ID System (effectiveTenantId)

**Ημερομηνία:** 2026-07-06
**Κατάσταση:** Εφαρμοσμένη

### Πλαίσιο
Τα components χρησιμοποιούσαν απευθείας `selectedTenantId` από το
`TenantContext`, το οποίο ήταν πάντα `null` για μη-super-admin χρήστες.
Αυτό σήμαινε ότι τα uploads και τα queries αποτύγχαναν για tenant admins,
editors, sales, και viewers.

### Απόφαση
Δημιουργήθηκε τριεπίπεδο σύστημα tenant ID στο `useTenant()` hook:

```typescript
interface TenantState {
  tenantId: string | null;          // SA: selectedTenantId || null
                                    // μη-SA: JWT/profile tenant_id
  // (internal) selectedTenantId    // TenantContext — τι διάλεξε ο SA
  effectiveTenantId: string | null; // SA: selectedTenantId
                                    // μη-SA: tenantId
}
```

### Alternatives
| Λύση | Απερρίφθη λόγω |
|------|---------------|
| `useTenantContext().selectedTenantId` παντού | Δεν δούλευε για μη-SA |
| `useTenant().tenantId` σκέτο | Σωστό αλλά μη ξεκάθαρο semantic |
| Ξεχωριστό `useEffectiveTenantId()` hook | Υπερβολή για μία γραμμή λογικής |

### Επιπτώσεις
- ✅ Όλα τα components λειτουργούν για SA και μη-SA
- ✅ Ξεκάθαρο semantic: `effectiveTenantId` = "τι να χρησιμοποιήσω τώρα"
- ✅ Backward compatible (τα components άλλαξαν σταδιακά)
- ⚠️ Απαιτείται έλεγχος: κανένα component δεν χρησιμοποιεί raw `selectedTenantId`

---

## ADR-008: Super Admin Auto-Assign χωρίς refreshSession()

**Ημερομηνία:** 2026-07-06
**Κατάσταση:** Εφαρμοσμένη

### Πλαίσιο
Οι super admin έπρεπε να πατάνε "self-fix" κουμπί για να ενεργοποιήσουν
τα δικαιώματά τους. Αυτό ήταν:
- Μη διαισθητικό (δεν ήξεραν ότι πρέπει να το πατήσουν)
- Απαιτούσε logout/login μετά
- Προκαλούσε confusion

### Πρώτη απόπειρα (απέτυχε)
Προστέθηκε `refreshSession()` μετά το auto-assign profile update.
**Πρόβλημα:** Το `refreshSession()` προκαλούσε `SIGNED_OUT` event
(λόγω JWT hook misconfiguration ή rate limiting) και ο χρήστης
επέστρεφε στη login σελίδα.

### Λύση
1. Το `useTenant()` hook ελέγχει το email του χρήστη
2. Αν είναι στα `KNOWN_SUPER_ADMIN_EMAILS`, θέτει `isSuperAdmin: true` άμεσα
3. Ενημερώνει το profile στη DB χωρίς `await` — fire-and-forget
4. ΔΕΝ καλείται `refreshSession()` — το profile update είναι για persistence

### Επιπτώσεις
- ✅ Ο SA βλέπει άμεσα τα δικαιώματά του
- ✅ Το profile persistei για επόμενα login
- ✅ ΔΕΝ υπάρχει κίνδυνος sign-out
- ⚠️ Τα JWT claims δεν ανανεώνονται μέχρι το επόμενο login

---

## ADR-009: Clear tenant selection on SIGNED_IN

**Ημερομηνία:** 2026-07-06
**Κατάσταση:** Εφαρμοσμένη

### Πλαίσιο
Ο super admin, μετά από login, έβλεπε αυτόματα τον τελευταίο tenant
που είχε επιλέξει (από localStorage). Αυτό ήταν ανεπιθύμητο — ο SA
θέλει να βλέπει ΠΡΩΤΑ την οθόνη επιλογής tenant σε κάθε νέο login.

### Απόφαση
Στο `SIGNED_IN` event του `AuthContext`, προστέθηκε:
```ts
localStorage.removeItem('aion_selected_tenant');
```

### Sync fix
Μετά το SIGNED_IN, το `TenantContext` έχει stale state (κρατά την
παλιά τιμή από localStorage). Το `useTenant()` το ανιχνεύει και το
διορθώνει:
```ts
if (selectedTenantId !== lsTenantId) {
  setSelectedTenantId(lsTenantId);
  return; // effect re-runs
}
```

### Επιπτώσεις
- ✅ Login → tenant selection grid πάντα
- ✅ Refresh στη διάρκεια session → persistence
- ✅ Logout → cleared
- ⚠️ Χρειάστηκε sync fix στο useTenant
