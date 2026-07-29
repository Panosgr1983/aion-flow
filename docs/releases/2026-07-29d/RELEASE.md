# Release — 2026-07-29d

## Rich Content Engine Expansion + Client-Driven Refinements

---

### Root Cause

TipTap rich text editor existed only for Blog articles. Biography and service descriptions were limited to plain textarea fields. Seminar articles had category normalization issues (ampersand variant not recognized as announcement). Multiple hardcoded strings prevented client from editing via CMS.

---

### Scope

| In | Out |
|----|-----|
| `renderTipContent()` extracted to shared `content-hooks.ts` | FAQ ownership architecture (Gen1 vs Gen2) |
| `RichEditor` in AboutPanel (biography) | Content Engine consolidation (Phases 1-6) |
| `RichEditor` for service short_description + long_description | Kareli content model upgrade |
| Blog hero eyebrow → `blog_hero_eyebrow` setting | Kolokotronis Vercel secondary HTTP 404 |
| Category normalization: `ΟΜΙΛΙΕΣ & ΣΕΜΙΝΑΡΙΑ` ampersand | CMS authenticated Playwright tests |
| TipTap editor CSS: paragraph spacing, list markers | |
| `service_faq_visible` toggle (default off) | |
| `extractPlainText()` helper for services list | |
| Slug cleanup (3 bad slugs fixed) | |
| Title width: `max-w-3xl` removed | |

---

### Commit Hashes

**aion-flow-v2 (10 commits):**

| Hash | Message |
|------|---------|
| `203c2f0` | fix: TipTap editor paragraph spacing and list marker visibility (WYSIWYG) |
| `8591ab0` | feat: TipTap rich editor for biography in AboutPanel |
| `24f9fdc` | fix: pre-convert existing bio paragraphs to TipTap JSON on load (no data loss) |
| `52d0765` | fix: handleSave now creates new settings keys (about_bio_content was not persisted) |
| `0b824a8` | feat: blog_hero_eyebrow setting in CMS Site Settings |
| `e457f99` | feat: TipTap RichEditor for service long_description |
| `e89c11c` | fix: raw variable scope bug in openEdit (blocked modal from opening) |
| `ddc8242` | feat: add RichEditor for short_description in services |
| `34526d8` | feat: service_faq_visible toggle in CMS (default off) |
| `93980ec` | fix: render short_description as plain text in services list (extract from TipTap JSON) |

**kolokotronis-pshychologist-main (7 commits):**

| Hash | Message |
|------|---------|
| `a763384` | fix: normalize ΟΜΙΛΙΕΣ & ΣΕΜΙΝΑΡΙΑ category for announcement_show_dates toggle |
| `860bd92` | feat: rich text editor for biography, extract renderTipContent to shared lib |
| `bcc67b3` | fix: blog hero eyebrow from site setting (default: Ανακοινώσεις) |
| `7a33096` | feat: render service long_description as TipTap JSON (backward compatible) |
| `64ba8ea` | feat: render service short_description as TipTap JSON (backward compatible) |
| `ba167d9` | fix: remove max-w-3xl constraint on blog and service titles |
| `c5a9377` | fix: FAQ visible only when service_faq_visible setting is true |

---

### Database

**No new migrations.** Changes are code-only and setting-based.

**Slug fixes (direct API):**
- Services: `365----` → `365-1-meres-mesa-sta-thaymata`
- Blog: `-------------` → `eygnomosyni-egkefalos-zoi`
- Blog: `--` → `omada-monopati-eytyxias`

**New site_settings keys:**
- `blog_hero_eyebrow` → blog page hero eyebrow (default: "Ανακοινώσεις")
- `about_bio_content` → biography TipTap JSON content
- `service_faq_visible` → FAQ visibility toggle (default: "false")

---

### Deploy Targets

| Project | Target | URL |
|---------|--------|-----|
| aion-flow-v2 | Vercel | `https://aion-flow-v2.vercel.app` |
| kolokotronis | Cloudflare Workers | `https://kolokotronis-website.choliasmenos-panos.workers.dev` |

---

### Verification

| Check | Result |
|-------|--------|
| Service FAQ (PB#1) — 8 tests | ✅ 8/8 — 29.4s |
| Manual QA — 12 tests | ✅ 12/12 — 1.1m |
| Zero console errors (13 pages) | ✅ |
| Zero broken images | ✅ |
| All service pages HTTP 200 | ✅ |
| Blog eyebrow shows "Ανακοινώσεις" | ✅ |
| Seminar article date hidden | ✅ |
| Back button shows "Όλες οι ανακοινώσεις" | ✅ |
| CMS editors (About, Services) render | ✅ |

---

### Known Issues

| Issue | Type | Status |
|-------|------|--------|
| Empty article `slug: omada-monopati-eytyxias` (content: `{}`) | Data | Pending decision |
| FAQ ownership: Gen1 vs Gen2 architecture | Architecture | Pending investigation |
| CMS authenticated Playwright tests (TenantSelector) | Test infra | Blocked |
| Agent runtime telemetry capture | Metrics | Schema-ready, not implemented |

---

### Rollback

To roll back this release:
1. **aion-flow-v2:** `vercel rollback --prod` to commit `059eda9`
2. **kolokotronis:** `wrangler rollback` to version `0e5eda74-812f-4762-8820-36a475a309d4` (pre-2026-07-29c baseline)

Note: Rollback will remove new settings (`blog_hero_eyebrow`, `about_bio_content`, `service_faq_visible`) from the UI but DB entries will persist. Slug changes are permanent.
