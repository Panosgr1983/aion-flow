# Incident Report: Rich Content JSON Leakage (2026-07-29 — 2026-07-30)

**Status:** CLOSED — Reopened once after scope expansion  
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
| +1h | Incident marked closed (incomplete scope) |
| 2026-07-30 | Same failure mode discovered in AION Flow CMS Services list |
| Immediate | Incident reopened, scope expanded |
| Immediate | Root cause deeper: `extractPlainText()` only handled string input |
| Immediate | Fix: `extractPlainText()` handles all runtime input formats |
| Immediate | Full surface audit: all CMS + public site rich-content fields inspected |
| Immediate | No additional affected surfaces found |
| Immediate | Defensive fallback added (empty string, not `[object Object]`) |
| +2h | Deployed. 24/24 validation checks passed. Incident re-closed. |

## Root Cause (Initial)

Commit `c5a9377` deployed the RichEditor for service `short_description` in the CMS. The CMS saved valid TipTap JSON. The homepage (`index.tsx:222`) rendered `{s.short_description}` directly — no parsing, no extraction.

## Root Cause (Expanded)

The same data (`short_description`) was rendered in the CMS Services list via `extractPlainText()`. The utility initially supported only string inputs. The runtime value of `short_description` was not consistently a string — depending on the data path, the application could receive:
- Legacy plain text
- JSON-encoded TipTap content (string)
- An already-parsed TipTap document object

`JSON.parse(object)` throws. The function returned the raw object, and React rendered it as text.

## Fix (two levels)

### Level 1: Shared `extractPlainText()` — handle all runtime formats

```javascript
function extractPlainText(val) {
  if (val == null || val === '') return '';
  let doc = val;
  if (typeof val === 'string') {
    try { doc = JSON.parse(val); } catch { return val; }
  }
  if (!doc || typeof doc !== 'object' || doc.type !== 'doc') return '';
  const texts = [];
  function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (n.type === 'text' && typeof n.text === 'string') texts.push(n.text);
    if (Array.isArray(n.content)) n.content.forEach(walk);
  }
  walk(doc);
  return texts.join(' ').replace(/\s+/g, ' ').trim();
}
```

### Level 2: Surface audit — find all rich-content direct renderings

| Surface | File | Before | After |
|---------|------|--------|-------|
| Public homepage cards | `index.tsx:222` | `{s.short_description}` | `extractPlainText()` |
| CMS services list cards | `Services.tsx:236` | `extractPlainText()` (string-only) | `extractPlainText()` (all formats) |
| All other CMS cards | credentials, testimonials, core values, products | Plain text — not TipTap | ✅ |
| Public services list + detail | `services.tsx`, `services.$slug.tsx` | Already handled (`JSON.parse`) | ✅ |
| Public about page | `about.tsx` | Already handled (`renderTipContent`) | ✅ |
| Public blog | `blog.$slug.tsx` | Already handled (`renderTipContent`) | ✅ |

## Impact

| Scope | Status |
|-------|--------|
| Homepage services section | Raw JSON displayed |
| CMS Services list | Raw JSON displayed |
| Services list page (public) | ✅ Correct |
| Services detail page | ✅ Correct |
| About page | ✅ Correct |
| Blog pages | ✅ Correct |
| **Data loss** | ❌ **None** — all records intact |

## Validation — 24/24 checks passed

| Validation group | Checks | Type |
|-----------------|--------|------|
| Service FAQ (PB#1) | 8/8 | Automated |
| Content Pipeline | 3/3 | Automated |
| Manual QA | 13/13 | Manual |
| **Total** | **24/24** | |
| **Automated** | **11/11** | |
| **Manual** | **13/13** | |

## Prevention

| Control | Type | Status |
|---------|------|--------|
| `extractPlainText()` handles all input formats | Code | ✅ |
| Defensive fallback (empty string, not `[object Object]`) | Code | ✅ |
| Homepage JSON-leakage regression test | Test | ✅ |
| Content Pipeline tests (extractPlainText matrix, all-services, all-info-pages) | Test | ✅ |
| Pre-deploy smoke checklist | Process | ✅ |
| Engineering Principle: *Protect user content first* | Documentation | ✅ |
| Content rendering rule documented (`extractPlainText` vs `renderTipContent`) | Documentation | ✅ |

## Lessons Learned

1. Rich-content migration must include full surface audit — public site + CMS + all card/list views.
2. Shared content utilities must validate runtime values, not rely on declared DB column types. The application may encounter plain strings, JSON-encoded strings, or already-parsed objects depending on the data path.
3. Regression tests must cover all surfaces that render the same field, not only the first discovered occurrence.
4. Defensive fallback in rendering utilities must never produce `[object Object]` — empty string is safer.

## Commit References

| Change | Repo | Commit |
|--------|------|--------|
| `extractPlainText()` + homepage fix | kolokotronis | `2fe18f1` |
| Regression tests | kolokotronis | `6f7700d` |
| Usage rule docs | kolokotronis | `f657161` |
| Pre-deploy checklist | aion-flow-v2 | `329c8e2` |
| Incident documentation | aion-flow-v2 | `841e409` |
| Engineering Principles | aion-flow-v2 | `d193b82` |
| `extractPlainText()` handle all formats | aion-flow-v2 | `92a54c4` |
| `extractPlainText()` handle all formats | kolokotronis | `22ac10e` |
| Full surface audit | both | Confirmed: 2 surfaces |
| Defensive fallback (`[object Object]` prevention) | aion-flow-v2 | `28cdffa` |
| Defensive fallback (`[object Object]` prevention) | kolokotronis | `8c1c95f` |

## Production Baseline

| Project | Code commit | Docs commit |
|---------|-------------|-------------|
| AION Flow CMS | `28cdffa` | `28cdffa` |
| Kolokotronis public | `8c1c95f` | `8c1c95f` |
