# Locale Module — Architecture

## Design Principle

> **Generalize When Proven, Not When Predicted.**
> Το Locale Module ξεκινά με GR/EN. Η επέκταση σε 3+ γλώσσες θα γίνει όταν το απαιτήσει 2ος tenant.

## Feature Flag

| Flag | Default | Effect |
|------|---------|--------|
| `locale_module` | `false` | Ενεργοποιεί translations editor + locale columns |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LOCALE MODULE                          │
│                                                           │
│  CMS Layer:                                               │
│    TranslationsEditor.tsx                                  │
│    ├── Search by key or value                              │
│    ├── Category filter                                     │
│    ├── GR/EN side-by-side editor                           │
│    └── Import/Export JSON                                  │
│                                                           │
│  Database Layer:                                           │
│    locale_translations table                               │
│    locale column on content tables                         │
│                                                           │
│  Public Site Layer:                                        │
│    Read content filtered by locale                         │
│    Language toggle (localStorage)                          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
Translations Editor (CMS)
  └── locale_translations table (tenant_id, key, value_el, value_en)
        └── Public site reads:
              └── translations[key][currentLang]
```

## Tenant Behavior

| Tenant | locale_module | locale column | Translations Editor |
|--------|---------------|---------------|-------------------|
| Kolokotronis | false | 'el' (default) | Hidden |
| Ktima Kareli | true | 'el' or 'en' | Visible |
| Future tenant | true | 'el' or 'en' | Visible |

---

## Completeness Standard

A multilingual feature is **COMPLETE** only when verified at ALL three levels:

| Level | What It Means | Example (Events EN) |
|-------|---------------|-------------------|
| **1. Database** | Columns exist and accept EN values | `title_en`, `description_en`, `includes_en` in DB ✅ |
| **2. CMS Authoring** | Editor UI allows entering/editing EN values | EventsCRUD has GR/EN tabs ✅ |
| **3. Public Rendering** | Site displays EN content based on locale | Events page reads locale ✅ |

**Status definitions:**
| Status | Meaning |
|--------|---------|
| ✅ COMPLETE | All 3 levels verified |
| 🟡 PARTIAL | DB ready, CMS or Public pending |
| 🟢 ACCEPTABLE | Single-language by design (e.g. FAQ GR only) |

### Fallback Rule

When EN content is missing for a field:
1. Display the GR value as fallback
2. Log/metric the missing translation (future)
3. Never show empty/null or broken UI

See also: `docs/02_TENANTS/ktima-kareli/CONTENT_MAPPING.md` — Section 14: Locale Readiness Matrix

