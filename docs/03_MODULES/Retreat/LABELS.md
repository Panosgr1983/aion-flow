# Retreat Module — Label Mapping

## Purpose

Το Label Mapping επιτρέπει σε κάθε tenant να έχει διαφορετικά ονόματα για τα panels του CMS, χωρίς αλλαγή κώδικα.

## Default Labels (AION Flow)

| AION Label | Purpose |
|-----------|---------|
| Υπηρεσίες | Services panel |
| Εκδηλώσεις | Events panel |
| FAQ | FAQ panel |
| Κρατήσεις | Bookings panel |
| Gallery | Gallery panel |
| Πολυμέσα | Media library |
| Κριτικές | Testimonials |

## Ktima Kareli Labels

| AION Default | Ktima Kareli |
|-------------|--------------|
| Υπηρεσίες | Εμπειρίες |
| Εκδηλώσεις | Εκδηλώσεις & Σεμινάρια |
| FAQ | Συχνές Ερωτήσεις |
| Κρατήσεις | Κλείστε το Δωμάτιό σας |
| Gallery | Φωτογραφίες |
| Πολυμέσα | Πολυμέσα |
| Κριτικές | Αξιολογήσεις |

## Implementation (Planned v0.6)

```typescript
// src/modules/retreat/labels.ts
export const retreatLabels: Record<string, string> = {
  'Υπηρεσίες': 'Εμπειρίες',
  'Εκδηλώσεις': 'Εκδηλώσεις & Σεμινάρια',
  'FAQ': 'Συχνές Ερωτήσεις',
  'Κρατήσεις': 'Κλείστε το Δωμάτιό σας',
  'Gallery': 'Φωτογραφίες',
  'Κριτικές': 'Αξιολογήσεις',
};
```

## Golden Rule

> **Generalize When Proven, Not When Predicted.**
> Το label mapping γίνεται platform-wide feature μόνο όταν το χρειαστεί 2ος tenant. Μέχρι τότε, παραμένει retreat-module specific.
