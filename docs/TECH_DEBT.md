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

_Τελευταία ενημέρωση: 2026-06-27_
