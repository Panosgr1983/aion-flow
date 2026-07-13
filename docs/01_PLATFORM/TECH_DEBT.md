# AION CMS — Technical Debt

> Παρακολούθηση τεχνικού χρέους.  
> Δεν είναι bugs — είναι πράγματα που ξέρουμε ότι πρέπει να βελτιώσουμε.

---

## How to use

```
❌ Πράγμα που δεν μας αρέσει
→ Γιατί υπάρχει
→ Τι θέλουμε αντί αυτού
→ Effort estimate
```

---

## Active Debt

### #1. uploadImage() — Legacy function (storage.ts)

**Περιγραφή:**  
Η `uploadImage()` στο `storage.ts` χρησιμοποιείται ακόμα σε 1 σημείο: `RichEditor.tsx`.  
Δεν είναι tenant-aware, δεν γράφει metadata, δεν κάνει telemetry.

**Why it exists:** Πριν τη νέα media architecture (v0.2).  
**Wanted:** `uploadCmsAsset()` everywhere.  
**Blocked by:** RichEditor refactor (Issue KNOWN_ISSUES #2).  
**Effort:** Small (1 file, ~3 lines).

---

### #2. storage.ts — Duplication with media.ts

**Περιγραφή:**  
Το `storage.ts` και `media.ts` έχουν overlapping functionality.  
`uploadToStorage()` vs `uploadCmsAsset()`, `deleteFromStorage()` vs `deleteMedia()`.

**Why it exists:** Σταδιακή μετανάστευση από raw storage → media service.  
**Wanted:** `storage.ts` να γίνει thin wrapper (μόνο raw upload/download), όλη η λογική στο `media.ts`.  
**Blocked by:** Nothing — incremental.  
**Effort:** Medium.

---

### #3. mockData.ts — Growing maintenance

**Περιγραφή:**  
Το `mockData.ts` μεγαλώνει συνεχώς για να υποστηρίζει offline development.  
Υπάρχει κίνδυνος να αποκλίνει από την πραγματική DB.

**Why it exists:** Development χωρίς Supabase connection.  
**Wanted:** Auto-generation από types, ή dedicated mock server.  
**Effort:** Medium.

---

### #4. No integration tests

**Περιγραφή:**  
Δεν υπάρχουν integration tests για upload, delete, replace, multi-tenant operations.

**Why it exists:** Προτεραιότητα ήταν η λειτουργικότητα.  
**Wanted:** Test suite with Vitest + Supabase local.  
**Effort:** Large.

---

### #5. Error handling inconsistency

**Περιγραφή:**  
Some editors use `alert()`, some use toast, some use inline error messages.  
No centralized error handling.

**Why it exists:** Ξεχωριστή ανάπτυξη per editor.  
**Wanted:** Centralized notification system (toast).  
**Effort:** Medium.

---

### #6. Type safety — Some `any` usage

**Περιγραφή:**  
Παρά το strict TypeScript, υπάρχουν σημεία με `any` (π.χ. `Record<string, any>` σε Site Settings, AboutPanel).

**Why it exists:** Τα settings are dynamic JSON.  
**Wanted:** Typed settings interfaces.  
**Effort:** Large (requires schema analysis).

---

### #7. Gallery — No pagination

**Περιγραφή:**  
Η Media Library φορτώνει όλα τα media ταυτόχρονα. Θα γίνει πρόβλημα με >500 assets.

**Why it exists:** Απλό implementation.  
**Wanted:** Pagination or infinite scroll.  
**Effort:** Medium.

---

### #8. No loading skeletons

**Περιγραφή:**  
Τα components δείχνουν spinner ή τίποτα κατά το loading.  
UX θα βελτιωθεί με skeleton loaders.

**Why it exists:** Προτεραιότητα στο functionality.  
**Wanted:** Skeleton components per module.  
**Effort:** Medium.

---

## Resolved Debt

### #R1. uploadImage() → uploadCmsAsset() — CMS Editors (Sprint 2.2)

**Περιγραφή:** Όλοι οι CMS editors χρησιμοποιούσαν `uploadImage()` αντί για `uploadCmsAsset()`.  
**Fix:** Sprint 2.2 (2026-06-27) — Site Settings, Blog, Services, Products, Pages, About.  
**Remaining:** RichEditor (see #1 above).

---

_Τελευταία ενημέρωση: 2026-06-27

---

### #9. VIDEO_FILMOGRAPHY constant in dionisis-xanthos is DEPRECATED

**Περιγραφή:**  
Η σταθερά `VIDEO_FILMOGRAPHY` (hardcoded array of video objects) στο dionisis-xanthos πρέπει να μεταναστεύσει σε DB table (media with media_type='video').

**Why it exists:** Προσωρινή λύση για γρήγορο launch.  
**Wanted:** DB-driven filmography with CMS UI.  
**Blocked by:** Artist Module (KNOWN_ISSUES #7), media_type column (KNOWN_ISSUES #9).  
**Effort:** Medium.

---

### #10. media table needs media_type column for artist module

**Περιγραφή:**  
Το `media` table χρειάζεται ένα `media_type` column ('photo', 'video', 'document', 'audio') για να υποστηρίξει τον Artist Module.

**Why it exists:** Το αρχικό schema δεν προέβλεπε κατηγοριοποίηση media.  
**Wanted:** ALTER TABLE migration + CMS UI filter.  
**Blocked by:** Nothing — DB migration.  
**Effort:** Small (migration) + Medium (UI).

---

### #11. No reusable Artist Module in aion-flow yet

**Περιγραφή:**  
Τα components του dionisis-xanthos (ArtistList, ArtistDetail, ArtistFilmography, ArtistBiography, ArtistMediaGallery) ζουν μόνο στο reference project. Δεν υπάρχει portable module στο aion-flow.

**Why it exists:** Το aion-flow εστίασε σε CMS editors πρώτα.  
**Wanted:** `src/modules/artist/` with reusable components + routes.  
**Blocked by:** KNOWN_ISSUES #7.  
**Effort:** Large.

---

### #12. 44 hardcoded content strings in dionisis-xanthos need CMS migration

**Περιγραφή:**  
Στο dionisis-xanthos εντοπίστηκαν 44 hardcoded strings (hero titles, section headings, CTAs, bio text, labels) που πρέπει να μεταφερθούν σε DB.

**Why it exists:** Αρχική ανάπτυξη με content hardcoded για ταχύτητα.  
**Wanted:** Πλήρης content audit → DB migration → CMS UI.  
**Blocked by:** —  
**Effort:** Large (content audit + migration + UI per field).

---

### #13. Timeline component has unused `isLeft` variable

**Περιγραφή:**  
Στο Timeline component του dionisis-xanthos, η μεταβλητή `isLeft` ορίζεται αλλά δεν χρησιμοποιείται (πιθανό legacy από alternating layout).

**Why it exists:** Αλλαγή design κατά την ανάπτυξη χωρίς cleanup.  
**Wanted:** Αφαίρεση dead code.  
**Effort:** Trivial.

---

### #14. GalleryToolbar has unnecessary `justify-between` with single child

**Περιγραφή:**  
Στο GalleryToolbar, το `justify-between` class εφαρμόζεται σε container που έχει μόνο ένα child, καθιστώντας το layout class περιττό.

**Why it exists:** Πιθανό legacy από toolbar που είχε περισσότερα elements.  
**Wanted:** Αφαίρεση περιττού class.  
**Effort:** Trivial.

---

### #15. GalleryToolbar.tsx unused/unnecessary classes

**Περιγραφή:**  
Το GalleryToolbar.tsx περιέχει επιπλέον classes που δεν εξυπηρετούν κανένα σκοπό μετά από design iterations.

**Why it exists:** Accumulated cruft από επαναλαμβανόμενες αλλαγές UI.  
**Wanted:** Καθαρισμός και simplification.  
**Effort:** Trivial (5 min).

---

### #16. No multi-language support (Locale Module)

**Περιγραφή:**  
Το AION Flow δεν υποστηρίζει multi-language content. Το Ktima Kareli χρειάζεται GR/EN bilingual site. Η λύση έχει σχεδιαστεί (ADR-014, locale-module.md) αλλά δεν έχει υλοποιηθεί.

**Why it exists:** Δεν υπήρχε ανάγκη μέχρι τώρα.  
**Wanted:** Locale Module v0.7.  
**Effort:** Medium (2-3 days).

---

### #17. No booking pipeline

**Περιγραφή:**  
Το Ktima Kareli χρειάζεται booking form με date range, guests, arrival/departure. Η υπάρχουσα φόρμα επικοινωνίας (contact_submissions) δεν έχει τα απαραίτητα πεδία.

**Why it exists:** Δεν υπήρχε ανάγκη booking pipeline μέχρι τώρα.  
**Wanted:** Booking pipeline (booking-pipeline.md pattern).  
**Effort:** Medium (1-2 days).

---

### #18. No FAQ module

**Περιγραφή:**  
Το Ktima Kareli έχει FAQ section στην public site. Δεν υπάρχει CMS panel για διαχείριση FAQ.

**Why it exists:** Δεν υπήρχε ανάγκη FAQ μέχρι τώρα.  
**Wanted:** FAQ CRUD panel (μέρος του Retreat Module).  
**Effort:** Low (0.5 day).

---

### #19. No label mapping system

**Περιγραφή:**  
Τα labels στο CMS (π.χ. "Υπηρεσίες") δεν προσαρμόζονται ανά tenant. Το Ktima Kareli χρειάζεται "Εμπειρίες" αντί για "Υπηρεσίες".

**Why it exists:** Δεν υπήρχε ανάγκη per-tenant labels μέχρι τώρα.  
**Wanted:** Label mapping config ανά tenant manifest.  
**Effort:** Low (0.5 day).

---

### #20. CRM helpers not tenant-filtered

**Περιγραφή:**  
`contactSubmissionsHelper`, `conversationsHelper`, `contactMessagesHelper`, `emailAccountsHelper`, `draftsHelper`, `crmHealthHelper`, `monitoringHelper`, `crmMetricsHelper` — κανένα query σε αυτά τα helpers ΔΕΝ φιλτράρει με βάση το tenant_id.

**Risk:** HIGH (cross-tenant data leak if activated)  
**Blocked from tenant rollout:** ΝΑΙ  
**Activation condition:** Πλήρες tenant isolation audit + fix όλων των queries  
**Effort:** Medium (1-2 days)

---

### #21. E-commerce helpers not tenant-filtered

**Περιγραφή:**  
`categoriesHelper`, `productsHelper`, `customersHelper`, `ordersHelper` — κανένα query δεν φιλτράρει με βάση το tenant_id.

**Risk:** HIGH (cross-tenant data leak if activated)  
**Blocked from tenant rollout:** ΝΑΙ (demo only)  
**Activation condition:** Πλήρες tenant isolation audit + fix  
**Effort:** Medium (1-2 days)
