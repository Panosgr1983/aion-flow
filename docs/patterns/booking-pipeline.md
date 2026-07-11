# Booking Pipeline — AION Flow

## Status: Planned (v0.6)

## Vision

Πλήρες booking pipeline για επιχειρήσεις που χρειάζονται κρατήσεις: retreat centers, εστιατόρια, ξενοδοχεία, υπηρεσίες. Το pipeline καλύπτει από την υποβολή της φόρμας από τον επισκέπτη μέχρι τη διαχείριση από τον πελάτη στο CMS.

## Feature Flag

| Flag | Default | Description |
|------|---------|-------------|
| `retreat_booking` | `false` | Ενεργοποιεί booking form + submission manager |

Όταν `retreat_booking = false`: δεν εμφανίζεται καμία booking λειτουργικότητα.

## Architecture

```
Public Site
  └── BookingForm (name, email, phone, guests, arrival, departure, message)
        │ POST
        ▼
Supabase → booking_submissions table
        │ trigger
        ▼
Edge Function → send-booking-email (notification to client)
        │
        ▼
CMS → /dashboard/retreat/bookings (submissions manager)
        ├── List (status: new/confirmed/cancelled/completed)
        ├── Detail view
        └── Status management
```

## Database

### booking_submissions (extends contact_submissions pattern)

```sql
CREATE TABLE booking_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  guests INT DEFAULT 1,
  arrival_date DATE,
  departure_date DATE,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','confirmed','cancelled','completed')),
  notes TEXT,                    -- Internal notes (CMS only)
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_booking_tenant ON booking_submissions(tenant_id);
CREATE INDEX idx_booking_status ON booking_submissions(status);
CREATE INDEX idx_booking_dates ON booking_submissions(arrival_date, departure_date);
```

## CMS Panel

### /dashboard/retreat/bookings

```
Booking Manager
├── Filters: status (new/confirmed/cancelled/completed), date range
├── List
│   ├── Name, email, phone
│   ├── Dates: arrival → departure
│   ├── Guests
│   ├── Status badge (colored)
│   └── Read/unread indicator
├── Detail view
│   ├── All fields (read-only)
│   ├── Status dropdown (new → confirmed → completed)
│   ├── Internal notes (textarea)
│   └── Mark as read
└── Export (CSV)
```

## BookingForm Component (Public Site)

```tsx
interface BookingFormProps {
  tenantId: string;
  onSuccess?: () => void;
  compact?: boolean;
}
```

### Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Όνομα | text | ✅ | min 2 chars |
| Email | email | ✅ | valid email |
| Τηλέφωνο | tel | ❌ | — |
| Επισκέπτες | number | ❌ | min 1, max 20 |
| Άφιξη | date | ✅ | not in past |
| Αναχώρηση | date | ✅ | after arrival |
| Μήνυμα | textarea | ❌ | max 1000 chars |

### States

| State | Behavior |
|-------|----------|
| Empty | Fresh form |
| Validation error | Inline per-field errors |
| Submitting | Loading spinner on button |
| Success | "Η κράτηση στάλθηκε με επιτυχία" + reset |
| Error | "Σφάλμα αποστολής. Δοκιμάστε ξανά." |

## Email Notification (Edge Function)

Reuses the existing `send-contact-email` pattern:

```typescript
// Edge Function on new booking_submissions row
const sendBookingEmail = async (submission: BookingSubmission) => {
  await emailClient.send({
    to: tenantContactEmail,
    subject: `Νέα κράτηση από ${submission.name}`,
    html: `
      <h2>Νέα κράτηση</h2>
      <p><strong>Όνομα:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Τηλέφωνο:</strong> ${submission.phone}</p>
      <p><strong>Άφιξη:</strong> ${submission.arrival_date}</p>
      <p><strong>Αναχώρηση:</strong> ${submission.departure_date}</p>
      <p><strong>Επισκέπτες:</strong> ${submission.guests}</p>
      <p><strong>Μήνυμα:</strong> ${submission.message}</p>
    `,
  });
};
```

## Reuse from Existing

| Component | Source | Adaptation |
|-----------|--------|------------|
| ContactForm | Portfolio module | Add date/guest fields → BookingForm |
| contact_submissions table | AION Core | Extend with date/guest columns or new table |
| InboxPage | CRM module | Reuse read/unread + status pattern |
| send-contact-email | Edge Function | Copy → send-booking-email |

## Future

- Online payments (Stripe integration)
- Availability calendar
- Automated confirmation emails
- Booking rescheduling
- Waitlist
