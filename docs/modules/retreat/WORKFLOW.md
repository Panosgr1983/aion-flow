# Retreat Module — Editorial Workflow

## Content Creation Flow

```
1. Create content in CMS panel
   ↓
2. Set status = 'draft'
   ↓
3. Add media (images via MediaPicker)
   ↓
4. Review content (internal)
   ↓
5. Set status = 'published'
   ↓
6. Public site displays content (locale-aware)
```

## Status Definitions

| Status | Meaning |
|--------|---------|
| draft | Αρχική δημιουργία, υπό επεξεργασία |
| review | Έτοιμο για editorial review |
| published | Εγκεκριμένο και δημοσιευμένο |

## Booking Flow

```
1. Visitor fills Booking Form on public site
   ↓
2. Form submitted → booking_submissions table
   ↓
3. Edge Function sends email notification to client
   ↓
4. Client views in Bookings Manager (CMS)
   ↓
5. Client changes status: new → confirmed
   ↓
6. (Future) Automated confirmation email sent
```

## Label Mapping

Κατά τη δημιουργία content, το CMS εμφανίζει τα labels του AION Flow.
Το public site μπορεί να χρησιμοποιεί διαφορετικά labels ανά tenant.

Παράδειγμα:
| AION Label | Ktima Kareli Label |
|-----------|-------------------|
| Υπηρεσίες | Εμπειρίες |
| Εκδηλώσεις | Εκδηλώσεις & Σεμινάρια |
| FAQ | Συχνές Ερωτήσεις |
