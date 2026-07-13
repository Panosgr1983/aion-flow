# Bookings Module — AION Flow

**Module Name:** bookings
**Feature Flag:** `retreat_booking`
**Status:** Active (v0.6)

---

## Overview

Το Bookings Module παρέχει booking form (public site), submission pipeline και διαχείριση κρατήσεων στο CMS. Δημιουργήθηκε για το Ktima Kareli αλλά είναι reusable για όσους χρειάζονται κρατήσεις.

## Architecture

```
Public Site (BookingForm)
  └── POST → booking_submissions table
        └── Edge Function (send-booking-email)
              └── BookingsManager (CMS)
                    ├── List (status filters)
                    ├── Detail view
                    └── Status management
```

## Database Table: `booking_submissions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `name` | TEXT | Required |
| `email` | TEXT | Required |
| `phone` | TEXT | Optional |
| `guests` | INT | Default 1 |
| `arrival_date` | DATE | Required |
| `departure_date` | DATE | Optional |
| `message` | TEXT | Optional |
| `status` | TEXT | new, confirmed, cancelled, completed |
| `notes` | TEXT | Internal (CMS only) |
| `read` | BOOLEAN | Unread tracking |

## CMS Panel

`/dashboard/retreat/bookings` — BookingsManager.tsx

| Feature | Detail |
|---------|--------|
| List view | All submissions with status badges, unread indicator |
| Filters | By status (new/confirmed/cancelled/completed) |
| Detail | Full submission data, inline status change |
| Contact | Email (mailto link), phone, dates, guests, message |

## Public Site Component

`BookingForm.tsx` — validated form with name, email, phone, guests, dates, message.

## Tenant Isolation

✅ Uses `withTenant(..., effectiveTenantId)` for reads.
✅ Uses `.eq('tenant_id', effectiveTenantId)` for updates.

## Used By

- Ktima Kareli
