# AION — Project Memory

> Η μνήμη του project. Δεν είναι changelog. Είναι η εξέλιξη της
> σκέψης πίσω από το AION.

---

## 1. Η εξέλιξη

```
CMS                    → Διαχείριση περιεχομένου για ένα site
  ↓
Multi-Tenant            → Πολλαπλοί πελάτες, ένα deployment
  ↓
Customer Operating System → CMS + CRM + Pipeline + Email + Analytics
  ↓
Platform                → Super admin console, telemetry, churn detection
  ↓
Business Intelligence   → Data-driven insights across all tenants (future)
```

### Φάση 1: CMS (Απρ 2026)
Ξεκίνησε ως απλό CMS για το kolokotronis-website. Services, Blog,
Products, Pages. Ένας πελάτης, ένα deployment.

### Φάση 2: Multi-Tenant (Μαϊ 2026)
Η ανάγκη για πολλαπλούς πελάτες οδήγησε σε multi-tenant architecture.
JWT hook, RLS policies, `withTenant()` helper. ADR-002.

### Φάση 3: CRM (Μαϊ 2026)
Inbox με split view, Pipeline Kanban, Email Workspace. Το AION έγινε
CRM + CMS.

### Φάση 4: Platform (Ιουν 2026)
Super admin console, Platform vs Workspace separation, capability guard,
telemetry, churn detection, usage dashboard, system health cockpit.

### Φάση 5: Telemetry & Operations (Ιουν 2026)
35+ event types, usage_events, churn risk, automated backups,
observability, edge functions.

### Φάση 6: Single Source of Truth (Ιουν 2026)
Documentation overhaul, MASTER docs, no mock data in production,
effectiveTenantId, permission matrix, project memory.

## 2. Βασικές αποφάσεις που διαμόρφωσαν το project

| Απόφαση | Γιατί | Επίπτωση |
|----------|-------|-----------|
| Supabase αντί Firebase | SQL, RLS, no vendor lock-in | ADR-001 |
| JWT hook αντί DB per query | Ταχύτητα, RLS bypass | ADR-002 |
| `user_role` αντί `role` | Δεν σπάει Supabase Auth | ADR-002 fix |
| Modular architecture | Scale without forks | ADR-005 |
| Industry profiles | Onboarding 10x ταχύτερο | ADR-006 |
| `effectiveTenantId` | SA και μη-SA με ένα hook | v0.3.2 |

## 3. Τι ΔΕΝ πρέπει ποτέ να αλλάξει

1. **Το `role: "authenticated"`** — ΔΕΝ αλλάζεται ποτέ (βλ. ADR-002 fix)
2. **Single Source of Truth** — Mock data απαγορεύονται σε production
3. **RLS στο επίπεδο database** — Tenant isolation ΔΕΝ γίνεται στο frontend
4. **`effectiveTenantId`** — Όλα τα components το χρησιμοποιούν
5. **Documentation = Product** — Δεν κόβεται από το backlog

## 4. Μαθήματα

### Τι πήγε λάθος
- **JWT hook `role` override** — Διέγραψε το `authenticated` και έσπασε
  όλα τα REST API queries. Διορθώθηκε με migration + `user_role`.
- **`refreshSession()` στο useTenant** — Προκαλούσε SIGNED_OUT loop.
  Διορθώθηκε με αφαίρεση του refreshSession.
- **Stale TenantContext state** — Μετά από login, το TenantContext
  κρατούσε παλιά localStorage τιμή. Διορθώθηκε με sync check.

### Τι πήγε σωστά
- **`can()` capability guard** — Ξεκάθαρη ιεραρχία permissions.
- **Telemetry από την αρχή** — Χωρίς telemetry, δεν ξέρουμε τι
  χρησιμοποιούν οι πελάτες.
- **Documentation** — 30+ docs, MASTER overview, 30-min onboarding.
