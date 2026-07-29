# Credential Abstraction Layer (CAL)

**AKES v1.6 — Standard**
**Ημερομηνία:** 2026-07-29
**Κατάσταση:** Ενεργό

---

## Σκοπός

Οι agents (AI ή άνθρωποι) δεν πρέπει ποτέ να βλέπουν raw secrets.
Το CAL ορίζει πώς τα credentials αναφέρονται, αποθηκεύονται και περιστρέφονται
χωρίς να εκτίθενται σε contexts, logs, ή git history.

## Αρχές

1. **Never expose raw values** — agents βλέπουν μόνο aliases
2. **Least privilege** — κάθε agent βλέπει μόνο τα credentials που χρειάζεται
3. **Rotation-friendly** — το alias παραμένει ίδιο, το secret αλλάζει
4. **Auditable** — κάθε πρόσβαση σε credential καταγράφεται

## Credential Reference Format

Αντί για raw values, τα credentials αναφέρονται με δομημένο alias:

```yaml
credential_id: supabase_service_role
environment: production
project: KOL-001
scope:
  - database
  - storage
rotation_status: current
storage: vercel_env
```

ή:

```yaml
project_ref: qhbgptlklsavezxpksao
credential_alias: KOL-001-PROD-SERVICE
purpose: server-side operations with full DB access
```

## Υποχρεωτικοί Κανόνες

1. **Κανένα raw secret σε git** — ούτε στιγμιαία, ούτε σε commit που μετά διαγράφεται
2. **Κανένα raw secret σε AGENTS.md, SESSION_OBJECTIVE, ή AKES context**
3. **Rotation σε κάθε suspected exposure** — δεν αρκεί `git rm`
4. **Environment variables** είναι το μόνο αποδεκτό storage για runtime secrets
5. **VITE_ variables** επιτρέπονται μόνο για public keys (anon key, URL)

## Παράδειγμα

**Μη αποδεκτό:**
```
SUPABASE_SERVICE_ROLE_KEY=sb_secret_o0hY7pCNei6K0wR-qDeRxA_cbRLHQ5U
```

**Αποδεκτό:**
```
# Set in Vercel env (production)
# credential_alias: KOL-001-PROD-SERVICE
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

## Εφαρμογή

1. Δημιουργία CAL registry στο aion-core namespace
2. Κάθε project έχει CAL entry με aliases
3. Οι agents διαβάζουν μόνο το CAL registry, ποτέ raw .env ή CREDENTIALS files
4. Secrets rotation triggers CAL update
