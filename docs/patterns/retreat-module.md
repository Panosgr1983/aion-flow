# Retreat Module — AION Flow

## Status: Planned (v0.6)

## Vision

Vertical module για wellness retreats, καταφύγια, φυσιολατρικά καταλύματα και τουριστικά καταλύματα. Παρέχει CRUD panels για experiences, workshops, events, FAQ και booking pipeline.

## Professional Types

- Retreat center
- Wellness resort
- Yoga retreat
- Eco lodge
- Guesthouse
- Camp
- Spa resort

## Feature Flag

| Flag | Default | Description |
|------|---------|-------------|
| `retreat_module` | `false` | Ενεργοποιεί το Retreat Module για τον tenant |

## Relationship to Existing Modules

```
AION Flow Modules:

Portfolio Module (v1.0, frozen)     Retreat Module (v0.6, planned)
├── Biography CRUD                   ├── Experiences CRUD
├── Filmography CRUD                 ├── Workshops CRUD
├── Television CRUD                  ├── Events CRUD
├── Theatre CRUD                     ├── FAQ CRUD
├── Timeline CRUD                    └── Bookings Manager
├── Gallery CRUD (shared) ─────────→ Reuses Gallery CRUD
├── Press CRUD
└── Showreels CRUD
```

**Shared across modules:**
- `Gallery CRUD` — portfolio + retreat use the same component
- `Media Library` — all images
- `RichEditor` — TipTap for descriptions
- `MediaPicker` — image selection
- `ModuleRegistry` — self-registration

## Database Tables

### Experiences

```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,                    -- '2 hours', 'full day'
  level TEXT,                       -- 'beginner', 'intermediate', 'all'
  includes TEXT[],                  -- ['Equipment', 'Guide', 'Meals']
  image_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  locale TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_experiences_tenant ON experiences(tenant_id);
```

### Workshops (same structure)

```sql
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  group_size TEXT,                  -- 'up to 12', 'individual'
  includes TEXT[],
  image_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  locale TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Events (with GR/EN bilingual fields)

```sql
CREATE TABLE retreat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  date DATE,
  organizer TEXT,
  capacity INT,
  price NUMERIC(10,2),
  description TEXT,
  description_en TEXT,
  includes TEXT[],
  includes_en TEXT[],
  image_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  locale TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### FAQ

```sql
CREATE TABLE faq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  locale TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_faq_tenant ON faq_entries(tenant_id);
```

## CMS Panels

| Panel | Route | Purpose |
|-------|-------|---------|
| Experiences CRUD | `/dashboard/retreat/experiences` | Create/edit/delete experiences |
| Workshops CRUD | `/dashboard/retreat/workshops` | Create/edit/delete workshops |
| Events CRUD | `/dashboard/retreat/events` | Create/edit/delete events |
| FAQ CRUD | `/dashboard/retreat/faq` | Q&A management |
| Bookings Manager | `/dashboard/retreat/bookings` | View/manage booking submissions |

## Label Mapping

Οι ετικέτες του AION Flow μπορούν να προσαρμοστούν για κάθε tenant:

| AION Default | Ktima Kareli |
|-------------|--------------|
| "Υπηρεσίες" | "Εμπειρίες" |
| "Workshops" | "Workshops" |
| "Εκδηλώσεις" | "Εκδηλώσεις & Σεμινάρια" |
| "FAQ" | "Συχνές Ερωτήσεις" |
| "Gallery" | "Φωτογραφίες" |
| "Κρατήσεις" | "Κλείστε το Δωμάτιό σας" |

## Reuse from Portfolio Module

| Component | Retreat Module |
|-----------|---------------|
| GalleryCard | Same — gallery grid |
| GalleryLightbox | Same — image lightbox |
| MediaPicker | Same — image selection |
| ModuleRegistry | Same — self-registration |
| CRUD pattern (list/edit) | Same — multi-entry CRUD |
| Status badges | Same — draft/review/published |
| Empty states | Same — "Προσθέστε την πρώτη" |
| History logging | Same — content_history |

## What's New (Retreat-specific)

| Component | Reason |
|-----------|--------|
| BookingForm | Date range, guests, arrival/departure |
| Booking Manager | Submission list, status, internal notes |
| FAQ CRUD | Simple Q&A (not in any existing module) |
| Events with bilingual fields | GR/EN title, description, includes |
| Includes list (array) | Checklist per experience/workshop/event |

## Module Manifest

```typescript
ModuleRegistry.register({
  name: 'retreat',
  version: '0.1.0',
  label: 'Καταφύγιο',
  description: 'Διαχείριση καταφυγίου / wellness retreat',
  featureFlag: 'retreat_module',
  routes: [
    { path: '/dashboard/retreat/experiences', element: ExperiencesCRUD, label: 'Εμπειρίες', sidebar: true, permission: 'retreat.edit' },
    { path: '/dashboard/retreat/workshops', element: WorkshopsCRUD, label: 'Workshops', sidebar: true, permission: 'retreat.edit' },
    { path: '/dashboard/retreat/events', element: EventsCRUD, label: 'Εκδηλώσεις', sidebar: true, permission: 'retreat.edit' },
    { path: '/dashboard/retreat/faq', element: FAQCRUD, label: 'FAQ', sidebar: true, permission: 'retreat.edit' },
    { path: '/dashboard/retreat/bookings', element: BookingManager, label: 'Κρατήσεις', sidebar: true, permission: 'retreat.bookings' },
  ],
  sidebar: {
    label: 'Καταφύγιο',
    icon: 'TreePine',
    permission: 'retreat.view',
    items: [
      { path: '/dashboard/retreat/experiences', label: 'Εμπειρίες', icon: 'Compass' },
      { path: '/dashboard/retreat/workshops', label: 'Workshops', icon: 'Users' },
      { path: '/dashboard/retreat/events', label: 'Εκδηλώσεις', icon: 'Calendar' },
      { path: '/dashboard/retreat/faq', label: 'FAQ', icon: 'HelpCircle' },
      { path: '/dashboard/retreat/bookings', label: 'Κρατήσεις', icon: 'CalendarCheck' },
    ],
  },
  permissions: ['retreat.view', 'retreat.edit', 'retreat.bookings'],
  dbTables: ['experiences', 'workshops', 'retreat_events', 'faq_entries', 'booking_submissions'],
  dependencies: ['core', 'media-engine'],
});
```

## Permissions

| Permission | Meaning |
|------------|---------|
| `retreat.view` | Read-only access to retreat panels |
| `retreat.edit` | Create, edit, delete retreat content |
| `retreat.bookings` | View and manage booking submissions |

## QA Checklist

- [ ] Experiences CRUD: create/edit/delete with all fields
- [ ] Workshops CRUD: same pattern
- [ ] Events CRUD: bilingual fields (GR/EN)
- [ ] FAQ CRUD: Q&A display on public site
- [ ] Booking form submits correctly
- [ ] Booking manager: list, detail, status change
- [ ] Gallery: existing GalleryCRUD works for retreat images
- [ ] Locale: translations panel works for 100+ keys
- [ ] Label mapping: client-facing labels correct
- [ ] Tenant isolation: Kolokotronis unaffected
- [ ] Build: zero errors

## Future (v1.0+)

- Online payments (Stripe)
- Availability calendar
- Automated booking confirmation
- Multi-language experiences/workshops
- Review management with responses
- Spaces/Accommodation CRUD (rooms, pricing, availability)
