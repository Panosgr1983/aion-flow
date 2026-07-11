# Retreat Module — Architecture

## Module Dependency

```
Authentication
  └── Multi-Tenant
        ├── Platform Core (Media, ModuleRegistry, Auth)
        ├── Portfolio Module (GalleryCRUD reused)
        └── Retreat Module
              ├── Experiences CRUD
              ├── Workshops CRUD
              ├── Events CRUD
              ├── FAQ CRUD
              └── Bookings Manager
```

## Data Flow

```
CMS Panel (CRUD)
  → Supabase Table (tenant_id isolated)
    → Public Site reads via anon key (status = published)
      → Booking form → booking_submissions table
        → Email notification to client
          → Bookings Manager in CMS
```

## Component Tree

```
Retreat Module
├── ExperiencesCRUD (list + edit form)
│   ├── MediaPicker (image)
│   └── RichEditor (description)
├── WorkshopsCRUD (same as Experiences)
├── EventsCRUD (list + edit form)
│   ├── MediaPicker (image)
│   └── Bilingual fields (GR/EN tabs)
├── FAQCRUD (list + edit form)
└── BookingsManager (list + detail)
    └── Status management

Reused from Portfolio:
├── GalleryCRUD
├── GalleryLightbox
└── GalleryCard
```
