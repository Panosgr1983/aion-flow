# AION CMS — Known Issues

> Παρακολούθηση γνωστών bugs.  
> Δεν θέλουμε bugs μέσα στο μυαλό μας.

---

## How to report

```
❌ Δεν δουλεύει το Χ
→ Πώς το αναπαράγουμε
→ Τι περιμέναμε
→ Τι έγινε αντί αυτού
→ Screenshot / console log (αν υπάρχει)
```

---

## Active Issues

### #1. Gallery — Inline-content media δεν εμφανίζονται

**Περιγραφή:**  
Media που ανεβαίνουν με `source: 'inline-content'` από τον RichEditor δεν εμφανίζονται στη Media Gallery (φιλτράρει μόνο `source: 'editor'`).

**Priority:** High  
**Planned:** v0.2  
**Module:** Media  
**Workaround:** Αλλαγή του filter στη MediaLibrary.

---

### #2. RichEditor — Δεν χρησιμοποιεί uploadCmsAsset()

**Περιγραφή:**  
Ο RichEditor χρησιμοποιεί ακόμα `uploadImage()` από το `storage.ts` αντί για `uploadCmsAsset()`. Αυτό σημαίνει ότι inline-content media δεν έχουν tenant_id, category, ή source metadata.

**Priority:** High  
**Planned:** v0.2  
**Module:** CMS — Content / RichEditor  
**Workaround:** Δεν επηρεάζει τη λειτουργία, αλλά τα media είναι "orphan" στη DB.

---

### #3. Delete media — No usage detection

**Περιγραφή:**  
Το `deleteMedia()` δεν ελέγχει αν το asset χρησιμοποιείται αλλού. Μπορεί να διαγράψεις μια εικόνα που χρησιμοποιείται σε blog post ή product.

**Priority:** Medium  
**Planned:** v0.3  
**Module:** Media  
**Workaround:** Manual verification πριν delete.

---

### #4. Gallery — Categories δεν έχουν CRUD UI

**Περιγραφή:**  
Η Media Gallery υποστηρίζει categories, αλλά δεν υπάρχει dedicated UI για CRUD categories. Τα categories δημιουργούνται αυτόματα βάσει του `category` field.

**Priority:** Medium  
**Planned:** v0.2  
**Module:** Media  
**Workaround:** Categories δημιουργούνται μέσω upload.

---

### #5. RichEditor — Media picker modal missing

**Περιγραφή:**  
Ο RichEditor δεν έχει ακόμα modal για Media Picker. Ο χρήστης πρέπει να έχει ήδη ανεβασμένο το media URL για να το επικολλήσει.

**Priority:** Medium  
**Planned:** v0.3  
**Module:** CMS — Content / RichEditor  
**Workaround:** Ανέβασμα από Gallery και copy/paste URL.

---

### #6. Upload stability — Large files

**Περιγραφή:**  
Upload μεγάλων αρχείων (>5MB) μπορεί να αποτύχει χωρίς clear error message. Δεν υπάρχει progress indicator.

**Priority:** Low  
**Planned:** v0.3  
**Module:** Media  
**Workaround:** Upload μικρότερων αρχείων.

---

## Resolved Issues

### #R1. uploadImage() ← uploadCmsAsset() σε όλους τους editors (Sprint 2.2)

**Περιγραφή:**  
Οι editors (Site Settings, Blog, Services, Products, Pages, About) χρησιμοποιούσαν `uploadImage()`.  
**Fix:** Μετανάστευσαν σε `uploadCmsAsset()` — Sprint 2.2 (2026-06-27).  
**Remaining:** RichEditor (Issue #2).

---

_Τελευταία ενημέρωση: 2026-06-27

---

### ~~#7. Artist Module not yet implemented~~ ✅ RESOLVED v0.4.0-dev

**Περιγραφή:**  
Το Artist Module υλοποιήθηκε ως v0.1 — read-only CMS shell. 8 panels (Biography, Filmography, Television, Theatre, Timeline, Gallery, Press, Showreels) πίσω από feature flag `artist_module`. Additive migration με 8 νέους πίνακες + media table extension.

**Priority:** Medium → Resolved  
**Planned:** v0.1 → ✅ v0.4.0-dev  
**Module:** CMS — Artist

---

### #8. External project UI not available

**Περιγραφή:**  
Το kolokotronis-website settings (site_settings, business_hours, services, testimonials κλπ.) δεν είναι επεξεργάσιμα από το AION CMS UI. Υπάρχουν στη DB αλλά το CMS δεν έχει UI για tenant-specific ρυθμίσεις εξωτερικών project.

**Priority:** Medium  
**Planned:** TBD  
**Module:** CMS — Multi-tenant

---

### #9. media table missing media_type column

**Περιγραφή:**  
Το `media` table δεν έχει `media_type` column (π.χ. 'photo', 'video', 'document'). Απαραίτητο για την κατηγοριοποίηση media ανά artist (Artist Module).

**Priority:** Medium  
**Planned:** v0.1  
**Module:** Database / Media

---

### #10. No multi-language support

**Περιγραφή:**  
Το `locale` column υπάρχει στο `dionisis-xanthos` schema (services, blog, pages) αλλά δεν χρησιμοποιείται στο aion-flow. Δεν υποστηρίζεται multi-language περιεχόμενο.

**Priority:** Low  
**Planned:** TBD  
**Module:** CMS — Internationalization

---

### #11. Contact form alert() removed in dionisis-xanthos but aion-flow still uses legacy pattern

**Περιγραφή:**  
Το dionisis-xanthos έχει αντικαταστήσει το `alert()` με toast notifications στο contact form. Το aion-flow χρησιμοποιεί ακόμα το legacy `alert()` pattern. Απαιτείται synchronization.

**Priority:** Low  
**Planned:** TBD  
**Module:** CMS — UI Patterns

---

### #12. No multi-language support

**Περιγραφή:**  
Το AION Flow δεν υποστηρίζει multi-language content (GR/EN). Το Ktima Kareli χρειάζεται bilingual site. Το Locale Module έχει σχεδιαστεί (ADR-014) αλλά δεν υλοποιηθεί.

**Priority:** High (for Ktima Kareli)  
**Planned:** v0.7  
**Module:** Locale

---

### #13. No booking pipeline

**Περιγραφή:**  
Δεν υπάρχει pipeline για booking form submissions. Το Ktima Kareli χρειάζεται form με date range, guests, arrival/departure. Το υπάρχον contact_submissions δεν επαρκεί.

**Priority:** High (for Ktima Kareli)  
**Planned:** v0.6  
**Module:** Retreat — Bookings

---

### #14. No FAQ CRUD

**Περιγραφή:**  
Το Ktima Kareli έχει FAQ section στο public site αλλά το CMS δεν έχει panel για διαχείριση FAQ. Προς το παρόν τα FAQ είναι hardcoded.

**Priority:** Medium  
**Planned:** v0.6 (Retreat Module)  
**Module:** Retreat — FAQ

---

### #15. No per-tenant label customization

**Περιγραφή:**  
Τα labels στο CMS είναι global. To Ktima Kareli χρειάζεται διαφορετικά labels από το Kolokotronis (π.χ. "Εμπειρίες" αντί για "Υπηρεσίες").

**Priority:** Medium  
**Planned:** v0.6 (Retreat Module)  
**Module:** Platform — Labels

---

### #16. CRM helpers not tenant-filtered

**Περιγραφή:**  
Οι CRM helpers (`conversationsHelper`, `contactMessagesHelper`, `emailAccountsHelper`, κλπ.) δεν έχουν tenant isolation. Αν ενεργοποιηθεί το CRM για πολλούς tenants, υπάρχει κίνδυνος διαρροής δεδομένων.

**Priority:** HIGH (blocker for CRM rollout)  
**Planned:** Before CRM enabled for 2nd tenant  
**Module:** CRM

---

### #17. E-commerce helpers not tenant-filtered

**Περιγραφή:**  
Οι e-commerce helpers (`categoriesHelper`, `productsHelper`, `customersHelper`, `ordersHelper`) δεν έχουν tenant isolation. Προς το παρόν είναι demo-only.

**Priority:** HIGH (blocker for e-commerce rollout)  
**Planned:** Before e-commerce enabled for any production tenant  
**Module:** E-commerce

---

### #18. Static site images not managed through Media Library

**Περιγραφή:**  
Το Ktima Kareli public site χρησιμοποιεί `/images/*.jpg` static paths. Οι εικόνες υπάρχουν στο `media` table αλλά το site δεν τις διαβάζει από εκεί. Ο tenant admin δεν μπορεί να τις αλλάξει από το CMS.

**Priority:** Low (functional, but CMS ownership gap)  
**Planned:** Post v0.7  
**Module:** Media — Public site integration
