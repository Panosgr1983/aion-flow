# Retreat Module — CMS Panels

## Experiences CRUD

| Field | Type | Component | Required |
|-------|------|-----------|----------|
| Τίτλος | text | Input | ✅ |
| Περιγραφή | rich text | RichEditor (TipTap) | ❌ |
| Διάρκεια | text | Input | ❌ |
| Επίπεδο | select | Beginner / Intermediate / All | ❌ |
| Συμπεριλαμβάνονται | array | Tags input | ❌ |
| Εικόνα | image | MediaPicker | ❌ |
| Σειρά | number | Input | ❌ |
| Κατάσταση | select | Draft / Review / Published | ❌ |
| Γλώσσα | select | EL / EN | ❌ |

## Workshops CRUD

Same structure as Experiences, with one additional field:

| Field | Type | Component |
|-------|------|-----------|
| Μέγεθος ομάδας | text | Input |

## Events CRUD (Bilingual)

| Field | Type | Component | GR | EN |
|-------|------|-----------|----|----|
| Τίτλος | text | Input | ✅ | ✅ |
| Ημερομηνία | date | Date picker | — | — |
| Διοργανωτής | text | Input | — | — |
| Χωρητικότητα | number | Input | — | — |
| Τιμή | number | Input | — | — |
| Περιγραφή | rich text | RichEditor | ✅ | ✅ |
| Συμπεριλαμβάνονται | array | Tags input | ✅ | ✅ |
| Εικόνα | image | MediaPicker | — | — |

## FAQ CRUD

| Field | Type | Component | Required |
|-------|------|-----------|----------|
| Ερώτηση | text | Textarea | ✅ |
| Απάντηση | rich text | RichEditor | ✅ |
| Σειρά | number | Input | ❌ |
| Κατάσταση | select | Draft / Review / Published | ❌ |

## Bookings Manager

| Feature | Detail |
|---------|--------|
| List view | All submissions with status badges |
| Filters | By status, date range |
| Detail view | Read-only form data + internal notes |
| Status management | new → confirmed → cancelled → completed |
| Mark as read | Toggle |
| Export | CSV export |

## Gallery (Reused from Portfolio)

Το GalleryCRUD του Portfolio Module χρησιμοποιείται αυτούσιο. Καμία αλλαγή.

| Feature | Detail |
|---------|--------|
| Grid view | 4 responsive columns |
| Lightbox | Fullscreen with Prev/Next |
| Metadata | caption, alt_text, category, photographer, copyright |
| MediaPicker | Image selection |
