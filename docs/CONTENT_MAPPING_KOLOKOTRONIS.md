# Tenant Content Mapping: Νικόλας Κολοκοτρώνης

**Tenant ID:** `00000000-0000-0000-0000-000000000001`
**Slug:** `kolokotronis`
**Industry:** psychology
**Type:** Psychologist / Mental Health
**Public Site:** `https://kolokotronis-website.choliasmenos-panos.workers.dev`
**CMS:** AION Flow — `https://aion-flowv2.vercel.app`
**Client Login:** `admin@kolokotronis.gr`

---

## 1. Site Structure — Pages & Routes

| Page | Route | Type | Content Source |
|------|-------|------|---------------|
| Home | `/` | Landing | site_settings + DB tables |
| About | `/about` | Bio | site_settings + DB |
| Services | `/services` | List | DB (services) |
| Service Detail | `/services/:slug` | Detail | DB (services) |
| Blog | `/blog` | List | DB (blog_posts) |
| Blog Post | `/blog/:slug` | Detail | DB (blog_posts) |
| Books | `/books` | List | site_settings (JSON) |
| Contact | `/contact` | Page | DB + component |
| Privacy | `/privacy` | Static | Fully hardcoded |
| Terms | `/terms` | Static | Fully hardcoded |

---

## 2. Homepage Sections

### 2.1 Hero Section

| Field | Value | GR | CMS Panel |
|-------|-------|----|-----------|
| Background | `hero_image` | — | Site Settings → Hero |
| Heading | `hero_heading` | `Κατανόηση.\nΑποδοχή.\nΑλλαγή.` | Site Settings → Hero |
| Subtitle | `hero_subtitle` | `Ένας ασφαλής χώρος για να μιλήσετε, να κατανοήσετε, να προχωρήσετε.` | Site Settings → Hero |
| CTA 1 | `hero_cta_primary_text` | `Μάθετε περισσότερα` | Site Settings → Hero |
| CTA 1 link | `hero_cta_primary_link` | `/about` | Site Settings → Hero |
| CTA 2 | `hero_cta_secondary_text` | `Πώς μπορώ να σας βοηθήσω` | Site Settings → Hero |
| CTA 2 link | `hero_cta_secondary_link` | `/services` | Site Settings → Hero |

### 2.2 Services Section

| Field | GR | CMS Panel |
|-------|----|-----------|
| Title | `Πώς μπορώ να σας βοηθήσω` | Site Settings → Services Section |
| Grid | 5 service cards (icon + title + short_desc) | Services CRUD |
| CTA | `Όλες οι υπηρεσίες` | Site Settings → Services Section |

### 2.3 About Section

| Field | GR | CMS Panel |
|-------|----|-----------|
| Eyebrow | `Βιογραφικό` | Site Settings → About Section |
| Title | `Γεια σας, είμαι ο Νικόλας Κολοκοτρώνης` | Site Settings → About Section |
| Paragraph 1 | (hardcoded fallback) | Site Settings → About Section |
| Paragraph 2 | (hardcoded fallback) | Site Settings → About Section |
| Portrait | `about_section_portrait` | Site Settings → About Section |
| CTA | `Περισσότερα για εμένα` | Site Settings → About Section |

### 2.4 Books Showcase (Optional)

| Field | GR | CMS Panel |
|-------|----|-----------|
| Visible | `home_books_showcase_enabled` | Site Settings → Books |
| Title | `Συγγραφικό Έργο` | Site Settings → Books |
| Books | up to 4 from `about_books` JSON | Site Settings → Books |

### 2.5 Testimonials Section

| Field | GR | CMS Panel |
|-------|----|-----------|
| Title | `Τι λένε όσοι έχουν συνεργαστεί μαζί μου` | Site Settings → Testimonials |
| Grid | 3-column cards | Testimonials CRUD |

### 2.6 Seminars Section (Optional)

| Field | GR | CMS Panel |
|-------|----|-----------|
| Visible | `seminar_section_visible` | Site Settings → Ομιλίες & Σεμινάρια |
| Title | `Ομιλίες & Σεμινάρια` | Site Settings → Ομιλίες & Σεμινάρια |
| Subtitle | (about upcoming) | Site Settings → Ομιλίες & Σεμινάρια |
| Count | 2 | Site Settings → Ομιλίες & Σεμινάρια |
| CTA | `Δείτε όλες τις ομιλίες & σεμινάρια` | Site Settings → Ομιλίες & Σεμινάρια |

### 2.7 Blog Section (Optional)

| Field | GR | CMS Panel |
|-------|----|-----------|
| Visible | `blog_home_section_visible` | Site Settings → Blog Home Section |
| Title | `Πρόσφατα Άρθρα` | Site Settings → Blog Home Section |
| Count | 2 | Site Settings → Blog Home Section |
| CTA | `Δείτε όλα τα άρθρα` | Site Settings → Blog Home Section |

### 2.8 Contact Section

| Field | Value | CMS Panel |
|-------|-------|-----------|
| Eyebrow | `Στοιχεία επικοινωνίας` | Site Settings |
| CTA | `Κλείστε ραντεβού` | Site Settings |
| Address | Απόλλωνος 30, Νέο Ηράκλειο, 14121 | Business Info |
| Phone | +30 697 437 1139 | Business Info |
| Hours | Δε-Πα 10:00-20:00 | Business Info |

---

## 3. Site Settings — Complete Key Inventory (~90 keys)

| Category | Key | Default (GR) | CMS Panel |
|----------|-----|-------------|-----------|
| **General** | `site_name` | Νικόλας Κολοκοτρώνης | Branding |
| | `site_subtitle` | Ψυχολόγος | Branding |
| | `site_monogram` | ΝΚ | Branding |
| | `site_logo` | (upload) | Branding |
| | `site_favicon` | (upload) | Branding |
| | `site_logo_footer` | (upload) | Branding |
| | `site_tagline` | (text) | Branding |
| | `footer_copyright` | Νικόλας Κολοκοτρώνης. All Rights Reserved. | Branding |
| **SEO** | `seo_default_title` | Νικόλας Κολοκοτρώνης — Ψυχολόγος \| Νέο Ηράκλειο | Site Settings |
| | `seo_default_description` | (paragraph) | Site Settings |
| | `seo_default_og_image` | (upload) | Site Settings |
| **Navigation** | `nav_links` | 7 links: Αρχική, Βιογραφικό, Υπηρεσίες, Ομάδες, Ομιλίες/Σεμινάρια, Βιβλία, Επικοινωνία | Site Settings |
| | `page_visibility` | JSON: show/hide per page | Site Settings |
| | `page_data` | JSON: hero per page | Site Settings |
| | `header_cta_text` | Κλείστε ραντεβού | Site Settings |
| | `header_cta_link` | /contact | Site Settings |
| **Hero** | `hero_heading` | Κατανόηση.\nΑποδοχή.\nΑλλαγή. | Site Settings |
| | `hero_subtitle` | Ένας ασφαλής χώρος... | Site Settings |
| | `hero_cta_primary_text` | Μάθετε περισσότερα | Site Settings |
| | `hero_cta_primary_link` | /about | Site Settings |
| | `hero_cta_secondary_text` | Πώς μπορώ να σας υποστηρίξω | Site Settings |
| | `hero_cta_secondary_link` | /services | Site Settings |
| | `hero_image` | (upload) | Site Settings |
| **Services Section** | `services_section_title` | Πώς μπορώ να σας βοηθήσω | Site Settings |
| | `services_section_link_text` | Όλες οι υπηρεσίες | Site Settings |
| **About Section** | `about_section_eyebrow` | Βιογραφικό | Site Settings |
| | `about_section_title` | Γεια σας, είμαι ο Νικόλας Κολοκοτρώνης | Site Settings |
| | `about_section_paragraph_1` | (paragraph) | Site Settings |
| | `about_section_paragraph_2` | (paragraph) | Site Settings |
| | `about_section_cta_text` | Περισσότερα για εμένα | Site Settings |
| | `about_section_portrait` | (upload) | Site Settings |
| **About Page** | `about_hero_eyebrow` | Βιογραφικό | Site Settings |
| | `about_bio_eyebrow` | Λίγα λόγια για εμένα | Site Settings |
| | `about_bio_title` | Ποιος είμαι | Site Settings |
| | `about_bio_paragraphs` | (JSON array) | Site Settings |
| | `about_portrait` | (upload) | Site Settings |
| | `about_achievements` | (JSON array: icon, value, label) | Site Settings |
| | `about_pull_quote` | (text) | Site Settings |
| | `about_pull_quote_author` | (text) | Site Settings |
| **Credentials** | `credentials_section_title` | Πιστοποιήσεις & σπουδές | Site Settings |
| **Testimonials** | `testimonials_section_title` | Τι λένε όσοι έχουν συνεργαστεί μαζί μου | Site Settings |
| **CTA Band** | `cta_band_title` | Είστε έτοιμοι για το επόμενο βήμα; | Site Settings |
| | `cta_band_subtitle` | Κλείστε μια πρώτη γνωριμία — χωρίς δέσμευση. | Site Settings |
| | `cta_band_button_text` | Κλείστε ραντεβού | Site Settings |
| | `cta_band_button_link` | /contact | Site Settings |
| **Contact** | `contact_hero_eyebrow` | Επικοινωνία | Site Settings |
| | `contact_hero_title` | Κλείστε το ραντεβού σας | Site Settings |
| | `contact_hero_subtitle` | (text) | Site Settings |
| | `contact_section_eyebrow` | Στοιχεία επικοινωνίας | Site Settings |
| | `contact_cta_text` | Κλείστε ραντεβού | Site Settings |
| | `contact_cta_link` | /contact | Site Settings |
| | `contact_address_heading` | Διεύθυνση | Site Settings |
| | `contact_address_area` | Νέο Ηράκλειο | Site Settings |
| | `contact_address_postal_code` | 14121 | Site Settings |
| | `contact_map_title` | Χάρτης | Site Settings |
| | `contact_open_maps_text` | Άνοιγμα στους Χάρτες | Site Settings |
| | `contact_form_heading` | Θα σας απαντήσω εντός 24 ωρών. | Site Settings |
| **Footer** | `footer_heading_nav` | Πλοήγηση | Site Settings |
| | `footer_heading_contact` | Επικοινωνία | Site Settings |
| | `footer_nav_links` | 7 links (accents) | Site Settings |
| | `footer_privacy_text` | Πολιτική Απορρήτου | Site Settings |
| | `footer_terms_text` | Όροι Χρήσης | Site Settings |
| **Seminar Section** | `seminar_section_visible` | true | Site Settings |
| | `seminar_section_title` | Ομιλίες & Σεμινάρια | Site Settings |
| | `seminar_section_count` | 2 | Site Settings |
| **Blog Home** | `blog_home_section_visible` | true | Site Settings |
| | `blog_home_section_title` | Πρόσφατα Άρθρα | Site Settings |
| | `blog_home_section_count` | 2 | Site Settings |
| **Books** | `about_books` | (JSON array) | Site Settings → About |
| | `about_books_cta_text` | Δείτε όλα τα βιβλία | Site Settings |
| | `home_books_showcase_enabled` | false | Site Settings |
| | `home_books_showcase_title` | Συγγραφικό Έργο | Site Settings |

---

## 4. Business Information

| Field | Value | CMS Panel |
|-------|-------|-----------|
| **Address — Street** | Απόλλωνος 30 | Business Info |
| **Address — Area** | Νέο Ηράκλειο | Business Info |
| **Address — Postal Code** | 14121 | Business Info |
| **Phone** | +30 697 437 1139 | Business Info |
| **Email** | nikolashealing@yahoo.gr | Business Info |
| **Facebook** | (URL) | Business Info |
| **Hours — Weekdays** | 10:00 - 20:00 | Business Info |
| **Google Maps** | Απόλλωνος 30, Νέο Ηράκλειο 14121 | Business Info |

---

## 5. Services (DB: `services` table)

| Slug | Title | Icon | CMS Status |
|------|-------|------|-----------|
| (configured) | Ατομική Συμβουλευτική / Ψυχοθεραπεία | (icon) | Services CRUD ✅ |
| (configured) | Ρέικι | (icon) | Services CRUD ✅ |
| (configured) | NLP | (icon) | Services CRUD ✅ |
| (configured) | Ομάδες | (icon) | Services CRUD ✅ |
| (configured) | Ομιλίες / Σεμινάρια | (icon) | Services CRUD ✅ |

Each service has: `title`, `slug`, `short_description`, `long_description`, `icon`, `image_url`, `sort_order`.

---

## 6. Blog Posts (DB: `blog_posts` table)

| Category | Count | CMS Panel |
|----------|-------|-----------|
| ΟΜΙΛΙΕΣ | (varies) | Blog CRUD ✅ |
| ΣΕΜΙΝΑΡΙΑ | (varies) | Blog CRUD ✅ |
| ΟΜΑΔΕΣ | (varies) | Blog CRUD ✅ |

Each post has: `title`, `slug`, `excerpt`, `content` (TipTap JSON), `category`, `image_url`, `is_published`, `published_at`, `meta_title`, `meta_description`, `og_image`.

---

## 7. Testimonials (DB: `testimonials` table)

| Count | Fields | CMS Panel |
|-------|--------|-----------|
| (varies) | `name`, `title`, `content`, `rating`, `sort_order` | Testimonials CRUD ✅ |

---

## 8. Credentials (DB: `credentials` table)

| Count | Fields | CMS Panel |
|-------|--------|-----------|
| (varies) | `title`, `description`, `icon`, `image_url`, `sort_order` | Credentials CRUD ✅ |

---

## 9. Core Values (DB: `core_values` table)

| Count | Fields | CMS Panel |
|-------|--------|-----------|
| (varies) | `title`, `description`, `icon`, `sort_order` | Core Values CRUD ✅ |

---

## 10. Navigation — 7 Default Items

| Label | Path | Visible (page_visibility) |
|-------|------|--------------------------|
| Αρχική | `/` | ✅ |
| Βιογραφικό | `/about` | ✅ |
| Υπηρεσίες | `/services` | ✅ |
| Ομάδες | `/services/omades` | ✅ |
| Ομιλίες, Σεμινάρια | `/services/seminar-omilies` | ✅ |
| Βιβλία | `/books` | ✅ |
| Επικοινωνία | `/contact` | ✅ |

Overridable via `nav_links` site setting.

---

## 11. Footer

| Section | Content | Source |
|---------|---------|--------|
| **Logo** | `logo-white.png` (fallback) | Branding |
| **Nav** | 7 links (accents) | DB `nav_links` |
| **Contact** | Phone, Email, Address, Facebook | Business Info |
| **CTA** | "Κλείστε την πρώτη σας γνωριμία" | Hardcoded |
| **Copyright** | © 2026 Νικόλας Κολοκοτρώνης. All Rights Reserved. | Branding |
| **Credit** | Website designed & developed by AION WEB | Hardcoded |
| **Legal** | Πολιτική Απορρήτου, Όροι Χρήσης | Hardcoded links |

---

## 12. Hardcoded Content (No CMS)

| Content | File | Status |
|---------|------|--------|
| Privacy policy (5 sections) | `privacy.tsx` | Fully hardcoded |
| Terms of use (5 sections) | `terms.tsx` | Fully hardcoded |
| 404 page | `__root.tsx` | Fully hardcoded |
| Error page | `__root.tsx` | Fully hardcoded |
| Blog categories (filter labels) | `blog.tsx` | Hardcoded map |
| "Όλα" filter label | `blog.tsx` | Hardcoded |
| Empty blog state | `blog.tsx` | Hardcoded |
| Contact form labels | `ContactForm.tsx` | Hardcoded |
| Form validation messages | `ContactForm.tsx` | Hardcoded (Zod) |
| Toast messages | `ContactForm.tsx` | Hardcoded |
| Form placeholders | `ContactForm.tsx` | Hardcoded |
| Default SEO metadata | `__root.tsx` | Partially hardcoded |
| English error page | `error-page.tsx` | Hardcoded |

---

## 13. Images

| Image | Type | CMS Status |
|-------|------|-----------|
| `logo.png` | Logo | Branding ✅ |
| `logo-white.png` | Logo (footer) | Branding ✅ |
| `hero_image` | Hero background | Media Library |
| `about_section_portrait` | Portrait (homepage) | Media Library |
| `about_portrait` | Portrait (about page) | Media Library |
| Service images | Per service | Services CRUD |
| Blog images | Per post | Blog CRUD |
| Book covers | Per book | About Panel |

---

## 14. CMS Panels — Complete List

| Panel | Route | Uses |
|-------|-------|------|
| **Dashboard** | `/dashboard` | Metrics, navigation |
| **Site Management** | `/dashboard/tenant-site` | Links to all editors |
| **Services** | `/dashboard/services` | 5+ services CRUD |
| **Blog** | `/dashboard/blog` | Blog posts CRUD |
| **Testimonials** | `/dashboard/testimonials` | Reviews CRUD |
| **Credentials** | `/dashboard/credentials` | Qualifications CRUD |
| **Core Values** | `/dashboard/core-values` | Values CRUD |
| **About** | `/dashboard/about` | Bio, books, achievements |
| **CTA** | `/dashboard/cta` | CTA Band settings |
| **Business Info** | `/dashboard/business-info` | Contact, address, hours |
| **Branding** | `/dashboard/branding` | Logo, colors, favicon |
| **Pages** | `/dashboard/pages` | Per-route hero content |
| **Site Settings** | `/dashboard/site-settings` | All ~90 keys |
| **Media** | `/dashboard/media` | Image library |
| **Inbox** | `/dashboard/inbox` | Contact messages |
| **Pipeline** | `/dashboard/pipeline` | Lead management |

**Total: 16 CMS panels** — all read from shared Supabase.

---

## 15. CMS Panel — Current Data Status

| Panel | Data Populated | Notes |
|-------|---------------|-------|
| Services | ✅ | 5 services with icons |
| Blog | ✅ | Posts in 3 categories |
| Testimonials | ✅ | Multiple testimonials |
| Credentials | ✅ | Qualifications listed |
| Core Values | ✅ | 4 core values |
| About | ✅ | Bio, books, achievements |
| CTA | ✅ | Title + button configured |
| Business Info | ✅ | Address, phone, hours |
| Branding | ✅ | Logo, favicon, colors |
| Site Settings | ✅ | 90+ keys configured |
| Media | ✅ | Images uploaded |

---

## 16. Translation Keys Summary

**No i18n.** All content is in Greek only. No bilingual support. The site has `lang="el"` hardcoded.

---

## 17. Documentation Location

This document: `docs/modules/retreat/CONTENT_MAPPING_KOLOKOTRONIS.md`

Related documents:
- `docs/TENANT_VISIBILITY.md` — what each user sees
- `docs/CREDENTIALS.md` — login credentials
- `docs/PLATFORM_STATUS.md` — platform overview
- `docs/ARCHITECTURE.md` — platform architecture

---

*Generated: 2026-07-12. Update whenever site content changes.*
