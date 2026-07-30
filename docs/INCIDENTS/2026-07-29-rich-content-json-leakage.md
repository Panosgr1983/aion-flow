# Incident Report: Homepage TipTap JSON Leakage (2026-07-29)

**Status:** RESOLVED (scope expanded and re-closed 2026-07-30)  
**Severity:** Production presentation regression — no data loss  
**Detection:** Client report. Scope expanded after CMS Services list showed same regression.  

---

## Timeline

| Time | Event |
|------|-------|
| 2026-07-29 (late) | Client reported homepage showing raw JSON (`type`, `doc`, `content`) under "Μέθοδοι / Μονοπάτια ενδοσκόπησης" |
| Immediate | Phase 0: Backups taken (services table, site_settings) |
| Immediate | Raw DB inspection confirmed TipTap JSON intact — no data loss |
| 30 min | Root cause identified: `src/routes/index.tsx:222` — `{s.short_description}` rendered directly |
| 30 min | Fix: `extractPlainText()` in `content-hooks.ts`, applied to homepage |
| +1h | Regression tests added (content-pipeline.spec.ts: extractPlainText matrix, all-services, all-info-pages) |
| +1h | Manual QA confirmed: homepage shows Greek text, no JSON keys |
| +1h | Tests: 24/24 passed |
| +1h | Deployed to production |

## Root Cause

Commit `c5a9377` deployed the RichEditor for service `short_description` in the CMS. The CMS saved valid TipTap JSON. The homepage (`index.tsx:222`) rendered `{s.short_description}` directly — no parsing, no extraction.

**File:** `src/routes/index.tsx:222`  
**Code before fix:** `{s.short_description}`  
**Code after fix:** `{extractPlainText(s.short_description)}`  

## Impact

| Scope | Status |
|-------|--------|
| Homepage services section | Raw JSON displayed |
| Services list page | ✅ Correct (had JSON.parse + renderTipContent) |
| Services detail page | ✅ Correct |
| About page | ✅ Correct (about_bio_content properly handled) |
| Blog pages | ✅ Correct |
| Data loss | ❌ None — all 16 service descriptions intact, about bio intact |

## Data Verification

- All 16 service `short_description` fields: valid TipTap JSON ✅
- All 16 service `long_description` fields: valid TipTap JSON ✅
- `about_bio_content`: 13 text nodes, 5967 chars ✅
- Blog posts: unaffected ✅

## Recovery

No data recovery needed — database content was correct. The fix was purely in the rendering layer.

## Prevention

| Control | Type | Status |
|---------|------|--------|
| `extractPlainText()` in shared `content-hooks.ts` | Code | ✅ |
| Homepage JSON-leakage regression test | Test | ✅ |
| `content-pipeline.spec.ts` (3 tests) | Test | ✅ |
| Pre-deploy smoke checklist (Section 9 in QA_CHECKLIST.md) | Process | ✅ |
| Engineering Principle: *Protect user content first* | Documentation | ✅ |
| Content rendering rule documented | Documentation | ✅ |

## Lessons Learned

1. Rich content migration must include a homepage/renderer audit.
2. Shared utilities (`extractPlainText`) prevent scattered fixes.
3. Regression tests must check the exact failure mode (raw JSON keys in visible text).
4. The pre-deploy checklist now includes: *"no raw JSON on homepage"*.

## Scope Expansion (2026-07-30)

**Discovery:** The same regression existed in the AION Flow CMS Services list — `short_description` rendered as raw TipTap JSON because the Supabase JS client auto-parses JSON strings from TEXT columns into objects.

**Root cause deeper:** `extractPlainText()` only handled the `string` input case. When Supabase returns `short_description` as a parsed JavaScript object, `JSON.parse(object)` throws, and the function returned the raw object.

**Fix:** `extractPlainText()` now handles both:
- Already-parsed TipTap JSON objects (`typeof val === 'object' && val.type === 'doc'`)
- JSON strings (`typeof val === 'string'` → `JSON.parse`)
- Plain text / fallback

**Full surface audit completed:** All rich-content fields across CMS and public site inspected. Only `Services.tsx:236` (CMS list) and `index.tsx:222` (homepage) had direct renderings. Both now use `extractPlainText()`.

**Incident reopened → reclosed.** Scope now covers both public-site and CMS surfaces.

## Commit References

| Change | Repo | Commit |
|--------|------|--------|
| `extractPlainText()` + homepage fix | kolokotronis | `2fe18f1` |
| Regression tests | kolokotronis | `6f7700d` |
| Usage rule docs | kolokotronis | `f657161` |
| Pre-deploy checklist | aion-flow-v2 | `329c8e2` |
| Incident documentation | aion-flow-v2 | `841e409` |
| Engineering Principles | aion-flow-v2 | `d193b82` |
| **extractPlainText handle objects fix** | **aion-flow-v2** | **`92a54c4`** |
| **extractPlainText handle objects fix** | **kolokotronis** | **`22ac10e`** |
| **Full surface audit** | **both** | **Confirmed: only 2 surfaces affected** |
