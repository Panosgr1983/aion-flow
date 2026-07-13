# Retreat Module — Lessons Learned

## Phase 0 (Documentation)

### What went well
- Η χρήση του Portfolio Module ως reference επιτάχυνε τη σχεδίαση
- Το label mapping προστέθηκε νωρίς (όχι ως afterthought)
- Το booking pipeline σχεδιάστηκε ως extension του contact_submissions

### What to improve
- Η bilingual απαίτηση έπρεπε να εντοπιστεί νωρίτερα (επηρεάζει schema)
- Το label mapping θα μπορούσε να είναι platform feature από την αρχή

### Reusable patterns
- Retreat module pattern → blueprint για επόμενα verticals (Hotel, Medical, κλπ.)
- Booking pipeline → επαναχρησιμοποιήσιμο για όσους χρειάζονται κρατήσεις
- External project setup → κάθε νέος tenant ακολουθεί το ίδιο μοτίβο
