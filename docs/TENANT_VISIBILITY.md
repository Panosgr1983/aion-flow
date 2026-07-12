# AION Flow — Tenant Visibility Matrix

**Last Updated:** 2026-07-12
**Purpose:** Τι βλέπει ο κάθε χρήστης όταν συνδέεται στο AION Flow.

---

## Super Admin: info@aionweb.gr (εσύ)

### Κατά την είσοδο
1. Login → Tenant selector grid
2. Επιλέγεις tenant από τη λίστα

### Βλέπεις (όταν επιλέξεις tenant)

| Section | Kolokotronis | Ktima Kareli |
|---------|-------------|-------------|
| **Dashboard** | ✅ | ✅ |
| **Διαχείριση Ιστοσελίδας** | ✅ | ✅ |
| **Πολυμέσα** | ✅ | ✅ |
| **Υπηρεσίες** | ✅ | — |
| **Εμπειρίες** | — | ✅ |
| **Workshops** | — | ✅ |
| **Εκδηλώσεις** | — | ✅ |
| **FAQ** | — | ✅ |
| **Κρατήσεις** | — | ✅ |
| **Blog** | ✅ | — |
| **Κριτικές** | ✅ | ✅ |
| **Gallery** | — | ✅ (από Portfolio) |
| **Site Settings** | ✅ | ✅ |
| **Branding** | ✅ | ✅ |
| **Business Info** | ✅ | ✅ |
| **Inbox / Pipeline** | ✅ | — |
| **Platform / System** | ✅ | ✅ |

### Πλατφόρμα (Super Admin only)
- Platform Overview, Usage Dashboard, Observability, System Debug
- Backup management
- User management
- History / Audit log

---

## Business User: client@ktimakareli.gr

### Κατά την είσοδο
1. Login → Κατευθείαν στο dashboard του Κτήματος Καρέλη
2. **ΔΕΝ βλέπει** tenant selector
3. **ΔΕΝ βλέπει** άλλους tenants

### Βλέπει

| Section | Visibility | Notes |
|---------|-----------|-------|
| **Dashboard** | ✅ | Tenant overview |
| **Διαχείριση Ιστοσελίδας** | ✅ | Site management hub |
| **Πολυμέσα** | ✅ | Media Library |
| **Εμπειρίες** | ✅ | CRUD experiences |
| **Workshops** | ✅ | CRUD workshops |
| **Εκδηλώσεις** | ✅ | CRUD events (GR/EN) |
| **FAQ** | ✅ | CRUD FAQ |
| **Κρατήσεις** | ✅ | View/manage bookings |
| **Gallery** | ✅ | Photos (από Portfolio) |
| **Site Settings** | ✅ | Hero, footer, SEO, nav |
| **Branding** | ✅ | Logo, colors |
| **Business Info** | ✅ | Contact details |
| **Προφίλ** | ✅ | User profile |
| **Ρυθμίσεις** | ✅ | Dashboard settings |

### ΔΕΝ βλέπει

| Section | Reason |
|---------|--------|
| Platform Overview | Super Admin only |
| System Debug | Super Admin only |
| Usage Dashboard | Super Admin only |
| User Management | Admin only (but available) |
| Backup | Admin only (but available) |
| Άλλοι tenants | Tenant isolation |

---

## Business User: admin@kolokotronis.gr

### Βλέπει

| Section | Notes |
|---------|-------|
| **Dashboard** | Tenant overview |
| **Διαχείριση Ιστοσελίδας** | Site management hub |
| **Πολυμέσα** | Media Library |
| **Υπηρεσίες** | Services CRUD |
| **Blog** | Blog posts CRUD |
| **Κριτικές** | Testimonials CRUD |
| **Site Settings** | Hero, footer, SEO, nav |
| **Branding** | Logo, colors |
| **Business Info** | Contact details |
| **Inbox** | CRM inbox |
| **Pipeline** | Lead pipeline |

### ΔΕΝ βλέπει

| Section | Reason |
|---------|--------|
| Retreat panels | `retreat_module` = false |
| Locale panels | `locale_module` = false |
| Gallery | `portfolio_module` = false |
| Bookings | `retreat_booking` = false |
| Platform features | Super Admin only |

---

## Module Visibility Per Tenant

| Module | Kolokotronis | Ktima Kareli | Future Tenant |
|--------|-------------|-------------|---------------|
| CMS Core | ✅ | ✅ | ✅ |
| CRM | ✅ | ❌ | Optional |
| Portfolio | ❌ | ✅ (gallery only) | Optional |
| Retreat | ❌ | ✅ | Optional |
| Locale | ❌ | ✅ | Optional |
| Booking | ❌ | ✅ | Optional |

---

## Tenant Feature Flags

| Flag | Kolokotronis | Ktima Kareli | Default |
|------|-------------|-------------|---------|
| `cms` | ✅ | ✅ | ✅ |
| `crm` | ✅ | ❌ | ✅ |
| `portfolio_module` | ❌ | ✅ | ❌ |
| `retreat_module` | ❌ | ✅ | ❌ |
| `locale_module` | ❌ | ✅ | ❌ |
| `retreat_booking` | ❌ | ✅ | ❌ |

---

> Το tenant isolation είναι πλήρες: κάθε χρήστης βλέπει ΜΟΝΟ τα δεδομένα του δικού του tenant.
> Super Admin βλέπει τα πάντα (με επιλογή tenant από τη λίστα).
