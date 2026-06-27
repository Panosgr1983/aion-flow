# AION CMS — Engineering Manifesto

Το AION δεν είναι ένα ακόμα CMS. Είναι μια πλατφόρμα που χτίζεται για να
εξυπηρετεί πραγματικές επιχειρήσεις. Κάθε γραμμή κώδικα, κάθε απόφαση,
κάθε δοκιμή γίνεται με επίγνωση ότι το προϊόν βρίσκεται σε παραγωγή.

## Αρχές

### 1. Αν κάτι δουλεύει, δεν το πειράζουμε χωρίς σοβαρό λόγο
Το "δεν το πειράζουμε" δεν σημαίνει στασιμότητα. Σημαίνει ότι κάθε
αλλαγή πρέπει να δικαιολογείται από πραγματική ανάγκη, όχι από
"καλύτερη αρχιτεκτονική" χωρίς tangible όφελος.

### 2. Backward compatibility πάνω από όλα
Οι πελάτες δεν ενδιαφέρονται για την τεχνολογική μας στοίβα.
Ενδιαφέρονται ότι τα sites τους δουλεύουν. Κάθε αλλαγή πρέπει να
είναι συμβατή προς τα πίσω, ή να συνοδεύεται από migration plan.

### 3. Κάθε feature πρέπει να μπορεί να αφαιρεθεί χωρίς να διαλύσει το CMS
Αυτό σημαίνει:
- Feature flags για μεγάλες αλλαγές
- Ξεχωριστά modules χωρίς circular dependencies
- Το `uploadImage()` δεν αλλάζει αν δεν υπάρχει λόγος
- Το `createMedia()` είναι πρόσθεση, όχι αντικατάσταση

### 4. Όλα είναι modular
Ένα module ξέρει το interface του. Δεν ξέρει την υλοποίηση. Το
`storage.ts` ξέρει Storage, όχι Media Library. Το `media.ts` ξέρει
Media, όχι Business Logic.

### 5. Κανένα hardcoded tenant
Ο κώδικας δεν περιέχει tenant ID, domain name ή configuration που
αφορά συγκεκριμένο πελάτη. Όλα είναι parameterized.

### 6. Migration πρώτα. Code μετά.
Η σειρά είναι πάντα:
1. Migration (backward compatible)
2. Seed data
3. Κώδικας
4. Deploy preview
5. Testing
6. Deploy production

### 7. Rollback πάντα διαθέσιμο
Το rollback plan γράφεται πριν το deployment. Αν μια migration δεν
μπορεί να γυρίσει πίσω, δεν γίνεται deploy χωρίς backup.

### 8. Δεν κάνουμε optimization πριν υπάρξει πραγματικό bottleneck
Το bottleneck αποδεικνύεται με μετρήσεις, όχι με προαίσθηση. Πρώτα
μετράμε, μετά βελτιστοποιούμε.

### 9. Documentation είναι code
Ότι δεν είναι documented, δεν υπάρχει. Το `docs/` είναι το βιβλίο
του AION. Ο κώδικας λέει "τι". Τα docs λένε "γιατί".

### 10. To production είναι ιερό
Το `main` branch είναι μόνο για bug fixes. Όλη η ανάπτυξη γίνεται
σε branches. Όλα τα deploys σε production περνάνε από:
- Feature branch → Develop → Preview → QA → Release → Production
