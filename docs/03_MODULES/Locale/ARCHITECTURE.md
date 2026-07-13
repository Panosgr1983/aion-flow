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
