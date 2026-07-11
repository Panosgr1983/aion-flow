# Locale Module — CMS Panel

## /dashboard/settings/translations

```
Translations Editor
├── Search bar (by key or value)
├── Category filter (hero, nav, footer, sections, ...)
├── Import button (JSON upload)
├── Export button (JSON download)
│
├── Translation rows
│   ├── Key: 'hero.title'
│   ├── Description: 'Τίτλος hero section'
│   ├── GR: [input] "Καλώς ήρθατε στο Κτήμα Καρέλη"
│   └── EN: [input] "Welcome to Ktima Kareli"
│       [Save] per row
│
└── Summary: "142 keys · 120 translated · 22 missing"
```

## Fields

| Field | Type | Editor |
|-------|------|--------|
| Key | text | Read-only |
| Description | text | Read-only |
| value_el (GR) | text | Single-line or textarea |
| value_en (EN) | text | Single-line or textarea |
| Category | text | Read-only badge |
