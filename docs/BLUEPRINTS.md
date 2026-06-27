# AION CMS — Blueprint Registry

> Κατάλογος όλων των blueprints που ορίζουν πώς η πλατφόρμα
> παράγει ολοκληρωμένες ιστοσελίδες.
>
> Αυτό είναι registry, όχι αποθήκη γνώσης.
> Τα detailed playbooks ανήκουν στο `knowledge/playbooks/` της
> AION Web Solutions.

---

## Registry

| Blueprint | Category | CMS Modules | Status | Repository |
|-----------|----------|-------------|--------|------------|
| Service-Business-v1 | Website | CMS, SEO | ✅ Stable | `AION-Web-Solutions-Blueprints` |

---

## How Blueprints connect to CMS

```
Blueprint
    │ defines
    ├── Page architecture (sections, layout)
    ├── SEO rules (meta, schema, OG)
    ├── Copywriting rules (voice, tone, CTA)
    ├── Design tokens (colors, glass effects)
    └── Performance targets (Lighthouse scores)
            │
            ▼
    AION CMS generates:
    ├── Pages with correct sections
    ├── SEO metadata
    ├── Navigation structure
    └── CMS content structure
```

---

## Blueprint lifecycle

| Phase | What happens |
|-------|-------------|
| **Draft** | Blueprint is being defined |
| **Review** | Under review by team |
| **Stable** | Production-ready, used in client projects |
| **Deprecated** | Replaced by newer version |

---

## For contributors

1. Add new blueprint here when it reaches **Stable** status
2. Keep descriptions minimal — this is a registry
3. Link to the actual blueprint repository

---

_Τελευταία ενημέρωση: 2026-06-27_
