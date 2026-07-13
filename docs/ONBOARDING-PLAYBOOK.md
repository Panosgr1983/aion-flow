# AION FLOW — Static Site to Tenant Method
## Gen2 Tenant Onboarding Playbook v1
### Date: July 13, 2026

> **AKES Rule:** Every existing website is first treated as a structured content source.
> All business-specific content, assets, labels, navigation and page sections are mapped
> into tenant-owned data. The CMS is then composed from reusable modules using the
> tenant's real content and terminology. No tenant-specific UI or content is hardcoded
> when a reusable data-driven pattern exists.

---

## Phase 1: Static Site Inventory

Read the entire existing site and capture:

```
Page: Home
  Section: Hero
    - title
    - subtitle
    - background_image
    - primary_cta_label
    - primary_cta_url
    - secondary_cta_label
    - secondary_cta_url
  Section: Services
    - section_title
    - section_description
    - items[]
      - icon
      - title
      - description
      - link
```

**Must capture:**
- Header, Logo, Navigation links, Footer, Contact data, Social links
- All Pages (slug, title, sections)
- Per section: Titles, Subtitles, Paragraphs, CTAs, Buttons, Images, Galleries
- Services, Products, Testimonials, Credentials, FAQs, Forms
- SEO titles, Meta descriptions, Structured data, Legal pages
- Any dynamic or interactive elements

**Deliverable:** `CONTENT_INVENTORY.md` (or structured JSON)

---

## Phase 2: Content Classification

Classify every element into:

| Category | Description | Example |
|----------|-------------|---------|
| **Global Setting** | Applies to entire site | Logo, Phone, Footer text |
| **Page Setting** | Specifies to one page | Hero title, Page SEO description |
| **Structured Entity** | Has dedicated table | services, blog_posts, testimonials |
| **Reusable Module** | Cross-tenant module | portfolio, retreat, gallery |
| **Static Asset** | Image/file | Logo image, Gallery photos |
| **Navigation Item** | Nav link | Menu link + URL |
| **SEO Field** | SEO metadata | meta_title, meta_description |
| **Unknown** | Needs review | Custom component without clear mapping |

**Rule:** Map to existing structures first. Never create new fields "because the static site uses a different label."

---

## Phase 3: Reuse Audit

Before creating ANY new schema/panel/module, check:

- Does an existing table cover this data? (services, blog_posts, testimonials, etc.)
- Does an existing component/reusable panel exist?
- Does an existing CRUD panel handle this?
- Does an existing module match?
- Does an existing method/API endpoint handle this?
- Does an existing mapping pattern from a previous tenant apply?
- Does an existing `site_settings` key cover the field?

**Order of operations:**
1. Existing field → 2. Existing module → 3. Existing reusable pattern → 4. Adaptation → 5. New implementation (LAST RESORT)

---

## Phase 4: Canonical Data Model

Content is stored with **canonical internal keys**. Labels are tenant-specific and stored separately.

| Internal Key | Tenant A Label | Tenant B Label |
|-------------|----------------|----------------|
| `services` | Υπηρεσίες | Θεραπείες |
| `retreat_events` | Εκδηλώσεις | Δράσεις & Εκδηλώσεις |
| `testimonials` | Κριτικές | Μαρτυρίες |

**Architecture:**
```
Canonical module
+ tenant data
+ tenant labels
+ feature flags
= tenant-specific CMS
```

The AION Flow does NOT change its code per client. It adapts data, labels, modules, feature flags, and navigation configuration.

---

## Phase 5: Dynamic Labels

Every module MUST support tenant-specific labels. Not hardcoded.

```json
{
  "module": "services",
  "label_singular": "Θεραπεία",
  "label_plural": "Θεραπείες",
  "menu_label": "Υπηρεσίες",
  "create_label": "Νέα θεραπεία",
  "empty_state": "Δεν υπάρχουν ακόμη θεραπείες"
}
```

Same reusable panel, different tenant language.

---

## Phase 6: Database Mapping

Deliver a mapping table BEFORE any import:

| Source | Content | Destination | Reuse | New field needed |
|--------|---------|-------------|-------|-----------------|
| Header | Logo | `site_settings.site_logo` | Yes | No |
| Header | Navigation | `site_settings.nav_links` | Yes | No |
| Home Hero | Title | `home_hero_title` | Yes | No |
| Experience cards | Cards | `retreat_experiences` | Yes | No |
| Custom retreat copy | Long description | `detail_description` | Partial | Yes |

Every field must have:
- **source_path** — URL or file path
- **source_selector** — CSS/JSON selector
- **destination_table** — Target table
- **destination_column/key** — Target column or settings key
- **transformation** — Any data transformation needed
- **locale** — Language
- **status** — pending / mapped / imported / verified
- **verification** — DB ✅ / CMS ✅ / Public ✅

**Deliverable:** `CONTENT_MAPPING.md`

---

## Phase 7: Media Migration

Static images must NOT remain as `/images/*.jpg`. Full migration flow:

```
Static image
  → download/copy
  → validate
  → optimize (if required)
  → upload to tenant storage
  → create media record
  → map to entity/setting
  → verify public rendering
```

Preserve for every asset:
- filename (original)
- alt text
- caption
- source page
- related entity
- tenant ownership
- original URL
- checksum (for duplicate detection)

**Deliverable:** `MEDIA_INVENTORY.md`

---

## Phase 8: Database Import

Import must be:
- **Idempotent** — safe to run multiple times
- **Tenant-scoped** — never affects other tenants
- **Transactional where possible** — rollback on failure
- **With duplicate detection** — match by checksum/URL/slug
- **With dry-run report** — preview before actual insert
- **With rollback capability** — known restore point

**Workflow:**
```
Analyze → Generate mapping → Preview → Approve → Import → Verify
```

No manual inserts without logging.

**Deliverable:** `IMPORT_PLAN.md`

---

## Phase 9: Tenant Labels Configuration

After data is in the DB, configure labels:

```json
{
  "tenant_id": "KAR-001-uuid",
  "labels": {
    "retreat_module": {
      "label_singular": "Εκδήλωση",
      "label_plural": "Εκδηλώσεις",
      "menu_label": "Δράσεις & Εκδηλώσεις",
      "create_label": "Νέα εκδήλωση",
      "empty_state": "Δεν υπάρχουν ακόμη εκδηλώσεις"
    }
  }
}
```

**Deliverable:** `TENANT_LABELS.md`

---

## Phase 10: CMS Generation

CMS panel is built from:
- Enabled features (tenant_features)
- Registered modules (ModuleRegistry)
- Available data types
- Tenant labels
- Permissions
- Tenant generation (1=Legacy, 2=Gen2)
- Readiness status

**Example for Ktima Kareli:**
```
Tenant data:
  - experiences
  - workshops
  - retreat_events
  - gallery_items
  - booking_submissions
  - portfolio_items

AION Flow builds:
  Καταφύγιο (retreat_module: true)
    - Εμπειρίες
    - Εργαστήρια
    - Εκδηλώσεις
    - FAQ
    - Κρατήσεις
  Χαρτοφυλάκιο (portfolio_module: true)
    - Gallery
```

**Rule:** Sidebar is generated from configuration + registry. Never rewrite sidebar per tenant.

**Deliverable:** `FEATURE_MATRIX.md`

---

## Phase 11: Three-Way Verification

Every element verified at three layers:

| Element | DB | CMS | Public | Verified |
|---------|----|-----|--------|----------|
| Hero title | ✅ | ✅ | ✅ | ✅ |
| Logo | ✅ | ✅ | ✅ | ✅ |
| Footer links | ✅ | ✅ | ✅ | ✅ |
| Experiences | ✅ | ✅ | ✅ | ✅ |
| EN description | ✅ | ❌ | ❌ | ❌ |

**Deliverable:** `VERIFICATION_REPORT.md`

---

## Phase 12: Hardcoded Content Audit

After completion, scan for remaining hardcoded:
- Visible strings
- Image paths
- Contact data
- Navigation items
- CTA labels
- Page titles
- Business details
- Tenant-specific defaults

**Rule:** No tenant-specific content remains hardcoded in the public site (except approved fallbacks — each documented).

**Deliverable:** `HARDCODED_CONTENT_AUDIT.md`

---

## Official Work Cycle

```
1.  Read static site
2.  Inventory all content
3.  Classify content
4.  Search reusable modules and fields
5.  Create mapping
6.  Approve mapping
7.  Import data and media
8.  Configure tenant labels
9.  Enable modules
10. Generate CMS navigation
11. Verify DB → CMS → Public
12. Audit remaining hardcoded content
13. Update AKES
```

## Deliverables Checklist

| # | Document | Phase |
|---|----------|-------|
| 1 | `CONTENT_INVENTORY.md` | Phase 1 |
| 2 | `CONTENT_MAPPING.md` | Phase 6 |
| 3 | `IMPORT_PLAN.md` | Phase 8 |
| 4 | `TENANT_LABELS.md` | Phase 9 |
| 5 | `FEATURE_MATRIX.md` | Phase 10 |
| 6 | `MEDIA_INVENTORY.md` | Phase 7 |
| 7 | `VERIFICATION_REPORT.md` | Phase 11 |
| 8 | `HARDCODED_CONTENT_AUDIT.md` | Phase 12 |

---

## Critical Rule

> The AION Flow must not adapt its code to each client.
> It must adapt data, labels, modules, feature flags, and navigation configuration.
> Code remains reusable.
