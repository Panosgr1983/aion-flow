# Tenant Content Mapping: Κτήμα Καρέλη

**Tenant ID:** `a6a0e182-2e86-4b3a-9601-b055e56a605e`
**Slug:** `ktima-kareli`
**Industry:** wellness
**Type:** Retreat / Wellness center
**Public Site:** `https://ktima-kareli-site.vercel.app`
**CMS:** AION Flow — `https://aion-flowv2.vercel.app`
**Client Login:** `client@ktimakareli.gr` / `ktimakareli2026`

---

## 1. Site Structure — Pages & Routes

| Page | Route | Type | Content Source |
|------|-------|------|---------------|
| Home | `/` | Landing (1 page) | translations.ts + DB |
| Experiences | `/experiences` | List | DB (experiences) |
| Experience Detail | `/experiences/:slug` | Detail | DB (experiences) |
| Workshops | `/workshops` | List | DB (workshops) |
| Workshop Detail | `/workshops/:slug` | Detail | DB (workshops) |
| Events | `/events` | List | DB (retreat_events) |
| Event Detail | `/events/:id` | Detail | DB (retreat_events) |
| Community | `/community` | Page | translations.ts + DB (faq) |

**No 404 page** — inline fallback only.

---

## 2. Homepage Sections — Full Content Mapping

### 2.1 Hero Section

```
┌──────────────────────────────────────────────────────────┐
│  [background: /images/hero-yoga-BWzdSU7G.jpg]             │
│                                                           │
│            hero.heading (GR/EN)                           │
│            hero.subtitle (GR/EN)                          │
│                                                           │
│  [hero.retreat]  [hero.book]                              │
└──────────────────────────────────────────────────────────┘
```

| Field | GR | EN | CMS Panel |
|-------|----|----|-----------|
| Background image | — | — | Media Library → hero |
| Heading | `Αναζωογόνηση στη Φύση` | `Revitalize in Nature` | Content → Hero Section |
| Subtitle | `ΕΠΑΝΑΣΥΝΔΕΣΗ • ΑΝΑΖΩΟΓΟΝΗΣΗ • ΑΝΑΝΕΩΣΗ` | `RECONNECT • REVITALIZE • RENEW` | Content → Hero Section |
| CTA 1 | `Εξερευνήστε το Retreat` | `Explore the Retreat` | Content → Hero Section |
| CTA 2 | `Κάντε Κράτηση` | `Book Now` | Content → Hero Section |

### 2.2 Welcome Section

```
┌──────────────────────────────────────────────────────────┐
│  welcome.heading (GR/EN)  "Κτήμα Καρέλη"                 │
│  welcome.text (GR/EN)  [paragraph about estate]          │
│                                           ┌──────────┐   │
│                                           │ ktima-   │   │
│                                           │ estate   │   │
│                                           │ .jpg     │   │
│                                           └──────────┘   │
└──────────────────────────────────────────────────────────┘
```

| Field | GR | EN | CMS Panel |
|-------|----|----|-----------|
| Heading | `Καλώς ήρθατε στο` | `Welcome to` | Content → Welcome |
| Text | Το Κτήμα Καρέλη βρίσκεται στο Λουτράκι... (100 words) | Ktima Kareli is located in Loutraki... (100 words) | Content → Welcome |
| Image | `/images/ktima-estate.jpg` | — | Media Library |

### 2.3 Spaces Section

| Field | GR | EN | CMS Panel |
|-------|----|----|-----------|
| Heading | `Χώροι Φιλοξενίας & Δραστηριότητες για Workshops, Yoga και Εκδηλώσεις` | `Accommodation & Activity Spaces for Workshops, Yoga and Events` | Content → Spaces |
| Text | Χωρητικότητα 12 ατόμων, εσωτερική αίθουσα, βεράντα... | Capacity 12 people, indoor hall, veranda... | Content → Spaces |

### 2.4 Experience Categories (3 sections)

| Key | GR Title | GR Description | EN Title | EN Description |
|-----|----------|---------------|----------|---------------|
| `exp.yoga` | Γιόγκα & Διαλογισμός | (paragraph about yoga) | Yoga & Meditation | (paragraph about yoga) |
| `exp.massage` | Ταϊλανδέζικο Θεραπευτικό Μασάζ | (paragraph about massage) | Traditional Thai Massage | (paragraph about massage) |
| `exp.walks` | Περίπατοι στη Φύση | (paragraph about walks) | Nature Walks | (paragraph about walks) |

### 2.5 Experiences Grid (4 cards)

See Section 3 (Experiences content type).

### 2.6 Community Banner

| Field | GR | EN | CMS Panel |
|-------|----|----|-----------|
| Heading | `Η Κοινότητά μας` | `Our Community` | Content → Community Banner |
| Workshops (3) | Mindfulness, Sunset Meditation, Sound Healing | Same | DB (workshops) |
| CTA | `Δείτε όλα τα εργαστήρια` | `View All Workshops` | Content → Community Banner |
| Image | `/images/community.jpg` | — | Media Library |

### 2.7 Gallery (10 images)

See Section 6 (Gallery).

### 2.8 Reviews (6 testimonials)

See Section 8 (Reviews/Testimonials).

### 2.9 Booking Form

| Field | GR | EN | CMS Panel |
|-------|----|----|-----------|
| Title | `Κλείστε την Απόδρασή σας` | `Book Your Escape` | Content → Booking Section |
| Description | Συμπληρώστε τη φόρμα... | Fill out the form... | Content → Booking Section |
| Name label | `Ονοματεπώνυμο` | `Full Name` | Content → Booking Section |
| Email label | `Email` | `Email` | Content → Booking Section |
| Phone label | `Τηλέφωνο` | `Phone` | Content → Booking Section |
| Guests label | `Άτομα` | `Guests` | Content → Booking Section |
| Arrival label | `Άφιξη` | `Arrival` | Content → Booking Section |
| Departure label | `Αναχώρηση` | `Departure` | Content → Booking Section |
| Message label | `Πείτε μας περισσότερα...` | `Tell us more...` | Content → Booking Section |
| Submit button | `Κάντε Κράτηση` | `Book Now` | Content → Booking Section |

---

## 3. Experiences (Content Type) — 4 entries

| Slug | Title (GR) | Title (EN) | Duration | Level | Includes (GR) | Includes (EN) | Image |
|------|-----------|-----------|----------|-------|---------------|---------------|-------|
| yoga-nature | Γιόγκα στη Φύση | Yoga in Nature | 75 λεπτά | Όλα | Στρώμα, Δάσκαλος, Τσάι | Mat, Teacher, Tea | exp-yoga-nature.jpg |
| thai-massage | Θεραπεία Ταϊλ. Μασάζ | Thai Massage Therapy | 60/90 λεπτά | Όλα | Λάδια, Πετσέτα, Συμβουλή | Oils, Towel, Advice | exp-thai-massage.jpg |
| forest-flow | Flow Γιόγκα στο Δάσος | Forest Flow Yoga | 60 λεπτά | Μεσαίο | Στρώμα, Instructor, Νερό | Mat, Instructor, Water | exp-forest-yoga.jpg |
| indoor-meditation | Διαλογισμός Εσωτ. Χώρο | Indoor Meditation | 45 λεπτά | Αρχάριο | Μαξιλάρι, Coach, Τσάι | Cushion, Coach, Tea | exp-indoor-meditation.jpg |

**CMS Panel:** Retreat → Experiences
**DB Table:** `experiences`
**Missing EN columns:** `title_en`, `description_en`, `includes_en` — need DB migration + CMS form update
**Missing:** `detailDescription` — longer description for detail page (currently shows short description)

---

## 4. Workshops (Content Type) — 3 entries

| Slug | Title (GR) | Title (EN) | Duration | Group | Includes (GR) | Image |
|------|-----------|-----------|----------|-------|---------------|-------|
| mindfulness | Εργαστήρια Ενσυνειδητότητας | Mindfulness Workshops | 2,5 ώρες | 6-14 άτομα | Ασκήσεις, Συζήτηση, Τσάι | indoor-meditation.jpg |
| sunset-meditation | Κύκλος Διαλογισμού στο Ηλιοβασίλεμα | Sunset Meditation Circle | 1,5 ώρα | έως 20 | Διαλογισμός, Κύκλος, Θέα | community.jpg |
| sound-healing | Ταξίδια Ηχοθεραπείας | Sound Healing Journeys | 75 λεπτά | 8-16 | Singing bowls, Στρώματα, Ρόφημα | exp-forest-yoga.jpg |

**CMS Panel:** Retreat → Workshops
**DB Table:** `workshops`
**Missing EN columns:** `title_en`, `description_en`, `includes_en` — need DB migration + CMS form update

---

## 5. Events (Content Type) — 6 entries

| ID | Title (GR) | Title (EN) | Date | Organizer | Capacity | Price (€) |
|----|-----------|-----------|------|-----------|----------|-----------|
| yoga-teacher-training | Yoga Teacher Training — 200h RYT | Yoga Teacher Training — 200h RYT | 1-15 Sep 2026 | Yoga Academy Greece | 12 | 1.200 |
| thai-massage-seminar | Σεμινάριο Ταϊλανδέζικου Μασάζ | Thai Massage Seminar | 18-22 Sep 2026 | Thai Healing Center | 10 | 650 |
| mindfulness-retreat | Retreat Ενσυνειδητότητας | Mindfulness & Self-Care Retreat | 5-9 Oct 2026 | Mindful Living Co. | 10 | 480 |
| sound-healing-weekend | Weekend Ηχοθεραπείας | Sound Healing & Harmony Weekend | 16-18 Oct 2026 | Harmonic Wave | 14 | 380 |
| art-workshop | Εργαστήριο Δημιουργικής Γραφής | Creative Writing & Art Workshop | 6-8 Nov 2026 | Art & Soul | 10 | 350 |
| new-year-retreat | Retreat Πρωτοχρονιάς | New Year Retreat | 28 Dec - 2 Jan | Ktima Kareli | 12 | 890 |

**CMS Panel:** Retreat → Εκδηλώσεις
**DB Table:** `retreat_events`
**Bilingual Fields:** title/title_en, description/description_en, includes/includes_en ✅

---

## 6. Gallery — 10 Images

| File | Category | CMS Status |
|------|----------|-----------|
| `gallery-1.jpg` | site / gallery | ✅ Uploaded |
| `gallery-2.jpg` | site / gallery | ✅ Uploaded |
| `gallery-3.jpg` | site / gallery | ✅ Uploaded |
| `gallery-4.jpg` | site / gallery | ✅ Uploaded |
| `gallery-5.jpg` | site / gallery | ✅ Uploaded |
| `gallery-6.jpg` | site / gallery | ✅ Uploaded |
| `gallery-7.jpg` | site / gallery | ✅ Uploaded |
| `gallery-8.jpg` | site / gallery | ✅ Uploaded |
| `gallery-9.jpg` | site / gallery | ✅ Uploaded |
| `gallery-10.jpg` | site / gallery | ✅ Uploaded |

**CMS Panel:** Gallery (από Portfolio Module)
**Total:** 10 images, all under `public/images/gallery-*.jpg`

---

## 7. Reviews / Testimonials — 6 entries

| Author | Text (GR) | Text (EN) | CMS Status |
|--------|-----------|-----------|-----------|
| Μαρία Κ. | Μοναδική εμπειρία... | — | ✅ Inserted |
| John D. | — | An unforgettable retreat... | ✅ Inserted |
| Ελένη Π. | Το Ταϊλανδέζικο μασάζ ήταν απίστευτο! | — | ✅ Inserted |
| Sophie M. | — | The sound healing experience... | ✅ Inserted |
| Γιώργος Χ. | Ιδανικό μέρος για να ξεφύγεις... | — | Need insert |
| Anna W. | — | I came for a weekend... | Need insert |

**CMS Panel:** Testimonials (υπάρχον)
**Note:** Τα reviews είναι είτε GR είτε EN, όχι bilingual. Κάθε review έχει μία γλώσσα.

---

## 8. FAQ — 5 entries

| Question (GR) | Answer (GR) | CMS Status |
|---------------|------------|-----------|
| Πώς μπορώ να συμμετέχω; | Μέσω της φόρμας κράτησης... | ✅ Seeded |
| Ποιο είναι το κόστος; | Ποικίλει ανά πρόγραμμα... | ✅ Seeded |
| Πόση ώρα διαρκούν; | 45 λεπτά έως 2,5 ώρες... | ✅ Seeded |
| Υπάρχει διαμονή; | Ναι, έως 12 άτομα... | ✅ Seeded |
| Παρέχεται γεύμα; | Ναι, βιολογικά προϊόντα... | ✅ Seeded |

**CMS Panel:** Retreat → FAQ
**Note:** FAQ είναι μόνο GR (το site δεν έχει EN FAQ).

---

## 9. Footer Content

| Field | GR | EN |
|-------|----|----|
| `footer.contactInfo` | Πληροφορίες Επικοινωνίας | Contact Information |
| `footer.followUs` | Ακολουθήστε μας | Follow Us |
| `footer.bookEscape` | Κλείστε την Απόδρασή σας | Book Your Escape |
| `footer.bookCta` | Κάντε Κράτηση | Book Now |
| `footer.openMaps` | Ανοίξτε στο Google Maps | Open in Google Maps |
| `footer.copyright` | © 2026 Κτήμα Καρέλη | © 2026 Ktima Kareli |

**Contact Info (hardcoded in Footer.tsx):**
- Phone: `+30 27440 12345`
- Email: `info@ktimakareli.gr`
- Location: `Λουτράκι, Κορινθία` / `Loutraki, Corinth`
- Maps: `37.956938,22.987715`

---

## 10. Navigation — 9 items

| Key | GR Label | EN Label | Link |
|-----|----------|----------|------|
| `nav.home` | Το Κτήμα | The Estate | `/` |
| `nav.experiences` | Εμπειρίες | Experiences | `/experiences` |
| `nav.workshops` | Εργαστήρια | Workshops | `/workshops` |
| `nav.community` | Κοινότητα | Community | `/community` |
| `nav.events` | Events | Events | `/events` |
| `nav.reviews` | Κριτικές | Reviews | `/#reviews` |
| `nav.gallery` | Gallery | Gallery | `/#gallery` |
| `nav.booking` | Κράτηση | Booking | `/#book` |
| `nav.contact` | Επικοινωνία | Contact | `/#book` |

---

## 11. Images — Complete Inventory

| Image | Page(s) | Type | CMS Status |
|-------|---------|------|-----------|
| `hero-yoga-BWzdSU7G.jpg` | Home hero | hero | ✅ Uploaded |
| `logo-ktima-kareli.jpg` | Header, Footer | logo | ✅ Uploaded |
| `ktima-estate.jpg` | Home welcome, Events | estate | ✅ Uploaded |
| `exp-yoga-nature.jpg` | Home, Experiences, Events | experience | ✅ Uploaded |
| `exp-thai-massage.jpg` | Home, Experiences, Events | experience | ✅ Uploaded |
| `exp-forest-yoga.jpg` | Home, Experiences, Workshops | experience | ✅ Uploaded |
| `exp-indoor-meditation.jpg` | Home, Experiences, Workshops | experience | ✅ Uploaded |
| `community.jpg` | Home, Workshops, Events, Community | community | ✅ Uploaded |
| `gallery-1.jpg` through `gallery-10.jpg` | Home gallery | gallery | ✅ Uploaded |
| `favicon.svg` | Browser tab | icon | Done |

---

## 12. CMS Panels — Current Status

| Panel | Route | Status | Needs |
|-------|-------|--------|-------|
| **Content → All Sections** | `/dashboard/content` | ❌ **Missing** | New panel with GR/EN tabs for all ~60 translation keys |
| **Retreat → Experiences** | `/dashboard/retreat/experiences` | ✅ | 4 entries σε DB. **Missing:** EN fields (title_en, description_en, includes_en) |
| **Retreat → Workshops** | `/dashboard/retreat/workshops` | ✅ | 3 entries σε DB. **Missing:** EN fields |
| **Retreat → Events** | `/dashboard/retreat/events` | ✅ | 6 entries, bilingual GR/EN ✅ |
| **Retreat → FAQ** | `/dashboard/retreat/faq` | ✅ | 5 entries, GR only |
| **Retreat → Bookings** | `/dashboard/retreat/bookings` | ✅ | Pipeline ready, awaits client bookings |
| **Gallery** | `/dashboard/portfolio/gallery` | ✅ | 10 images uploaded + linked ✅ |
| **Πολυμέσα** | `/dashboard/media` | ✅ | 18 images uploaded ✅ |
| **Κριτικές** (Testimonials) | `/dashboard/testimonials` | ✅ | 6 reviews inserted ✅ |
| **Branding** | `/dashboard/branding` | ✅ | Panel ready, needs client to set colors/logo |
| **Business Info** | `/dashboard/business-info` | ✅ | Phone, email, address configured ✅ |
| **Site Settings** | `/dashboard/site-settings` | ✅ | Need SEO defaults |

---

## 13. Translation Keys Summary

| Category | Count | Examples |
|----------|-------|---------|
| Navigation | 10 | nav.home, nav.cta |
| Hero | 4 | hero.heading, hero.subtitle, hero.retreat, hero.book |
| Welcome | 2 | welcome.heading, welcome.text |
| Spaces | 2 | spaces.heading, spaces.text |
| Experience categories | 6 | exp.yoga.*, exp.massage.*, exp.walks.* |
| Section titles | 4 | section.experiences, section.workshops, section.community, section.gallery |
| Community | 12 | community.heading, community.intro, community.subtitle, ... |
| Workshops (detail) | 6 | ws.mindfulness.*, ws.sunset.*, ws.soundHealing.* |
| Experiences (detail) | 8 | exp.yogaNature.*, exp.thaiMassage.*, exp.forestFlow.*, exp.indoorMeditation.* |
| Detail labels | 5 | detail.duration, detail.level, detail.group, detail.includes, detail.book |
| Back links | 4 | back.home, back.experiences, back.workshops, back.back |
| Navigation links | 2 | exp.all, ws.all |
| Footer | 5 | footer.contactInfo, footer.followUs, footer.bookEscape, footer.bookCta, footer.openMaps, footer.copyright |
| Reviews | 5 | reviews.subtitle, reviews.heading, reviews.desc, reviews.writeTitle, reviews.writeDesc |
| Booking | 11 | booking.title, booking.desc, booking.name, booking.email, booking.phone, booking.guests, booking.arrival, booking.departure, booking.message, booking.send, booking.text |
| Review form | 4 | review.name, review.email, review.rating, review.review, review.submit |
| Gallery | 1 | gallery.title |
| Community extra | 1 | community.workshops |
| Reviews title | 1 | reviews.title |
| Not found | 2 | notFound.title, notFound.back |
| **Total** | **~101** | |

---

## 14. Documentation Location

This document: `docs/modules/retreat/CONTENT_MAPPING.md`

Related documents:
- `docs/modules/retreat/MASTER.md` — module reference
- `docs/modules/retreat/DATABASE.md` — database schema
- `docs/modules/retreat/CMS.md` — CMS panels
- `docs/modules/retreat/LABELS.md` — label mapping
- `docs/modules/retreat/MEDIA.md` — media specification
- `docs/TENANT_VISIBILITY.md` — what each user sees

---

*Generated: 2026-07-12. Update whenever site content changes.*
