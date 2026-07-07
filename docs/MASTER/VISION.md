# AION — Vision & Product Philosophy

> **Single Source of Truth για το όραμα του AION.**
> Αυτό το αρχείο ΔΕΝ αλλάζει χωρίς ρητή απόφαση.

---

## 1. Τι είναι το AION

Το AION είναι μια **multi-tenant SaaS πλατφόρμα** για ψηφιακές
επιχειρήσεις. Δεν είναι ένα CMS. Είναι ένα **Customer Operating System**
που περιλαμβάνει:

- **AION Platform** — Κέντρο ελέγχου του SaaS (super admin console)
- **AION Workspace** — Περιβάλλον εργασίας κάθε πελάτη (tenant portal)

Κάθε νέος πελάτης ΔΕΝ σημαίνει νέο deployment. Σημαίνει νέο tenant
στο ίδιο σύστημα.

## 2. Ποιο πρόβλημα λύνει

### Πριν το AION
- Κάθε πελάτης είχε ξεχωριστό fork → 40 deployments, 40 bugs
- Δεν υπήρχε versioning → κάθε bug fix γινόταν 40 φορές
- Κάθε νέος developer ήθελε εβδομάδες για να καταλάβει την αρχιτεκτονική

### Με το AION
- Ένα repository. Ένα deployment. Feature flags ανά tenant.
- Κάθε bug fix διορθώνεται μία φορά.
- Single Source of Truth σε όλα (code, docs, configuration, telemetry).
- 30-min developer onboarding.

## 3. Φιλοσοφία

### Single Source of Truth
- Τα δεδομένα ΔΕΝ αντιγράφονται. Οι απόψεις (views) παράγονται.
- Mock data ΜΟΝΟ για demo mode / local dev.
- Το documentation είναι μέρος του προϊόντος, όχι βοηθητικό υλικό.

### Build once. Configure infinitely.
- Η διαφοροποίηση γίνεται μέσω configuration, όχι forks.
- Feature flags, industry profiles, tenant settings.
- Ο core engine είναι κοινός για όλους.

### Data-driven development
- Telemetry καθοδηγεί αποφάσεις (όχι υποθέσεις).
- Feature adoption, churn risk, usage patterns.
- Κάθε νέο feature χτίζεται μία φορά και αποσβένεται σε όλους.

## 4. Μη διαπραγματεύσιμες αρχές

1. **Κανένα production dashboard δεν διαβάζει mock data.**
2. **Κανένα deploy χωρίς approval.**
3. **Κανένα overwrite σε GitHub/Vercel χωρίς version control.**
4. **Documentation = Product.**
5. **Tenant isolation σε ΕΠΙΠΕΔΟ DATABASE (RLS).**
6. **Super admin bypass με JWT claims, όχι hardcoded.**
7. **Το telemetry ΠΟΤΕ δεν πετάει exception.**
8. **Κάθε component χρησιμοποιεί `effectiveTenantId`, όχι raw `selectedTenantId`.**
