# AION Flow — QA Checklist

**Υποχρεωτικό για κάθε production release.**  
Κάθε γραμμή πρέπει να έχει: `✅ Verified` / `❌ Failed` / `⚠️ Partial` / `⏳ Blocked` / `🔷 Deferred`.

**Δύο κατηγορίες:**
- **Automated** — Playwright ή CLI, εκτελείται σε CI ή local agent
- **Manual** — απαιτεί authenticated browser session (Supabase Auth, clipboard)

---

## 1. Implementation

- [ ] **Root cause documented** — όχι "fixed", αλλά "γιατί χάλασε"
- [ ] **Scope defined** — what is IN, what is OUT for this release
- [ ] **No hardcoded tenant IDs** in new logic (unless legacy Gen1)
- [ ] **No secrets in code** — env vars or service role only
- [ ] **No dead code / console.log** left behind
- [ ] **Backward compatible** — existing data not altered

## 2. Database

- [ ] **Migration idempotent** — `WHERE NOT EXISTS` / `ON CONFLICT DO NOTHING`
- [ ] **Rollback path documented**
- [ ] **Existing rows verified** — no overwrites, no duplicates
- [ ] **Unique constraint confirmed** — `(tenant_id, key)` or equivalent
- [ ] **Seed values match expected** — SELECT after INSERT
- [ ] **JSONB format correct** — string vs boolean vs object

## 3. Build & Deploy

- [ ] **TypeScript typecheck** — `npm run typecheck` or equivalent
- [ ] **Build passes** — `npm run build` (both projects if multi-project)
- [ ] **Primary deployment** — HTTP 200 on all routes
- [ ] **Secondary deployment** — documented if not applicable
- [ ] **Environment variables** — present and correct on target
- [ ] **Commit hash recorded** — rollback point known

## 4. Browser Automation

- [ ] **Demo content lifecycle** — create → test → delete (no leftovers)
- [ ] **Regular article** — date visible, back link correct
- [ ] **Announcement (default)** — date hidden, category shown, back link correct
- [ ] **Rich text rendering** — all node types render:
  - [ ] H2, H3
  - [ ] Bold, Italic, Underline, Strikethrough
  - [ ] Ordered list, Unordered list
  - [ ] Link, Blockquote, Horizontal rule
  - [ ] prose-content wrapper
- [ ] **Toggle behavior** — false → true → false, verify each state
- [ ] **Category filters** — URL parameter, navigation
- [ ] **FAQ — renders for services with data**
- [ ] **FAQ — absent for services without data**
- [ ] **FAQ — accordion expand/collapse**
- [ ] **FAQ — entry count matches seed**
- [ ] **FAQ — ordering matches DB sort_order**
- [ ] **FAQ — JSON-LD FAQPage structured data present**
- [ ] **FAQ — multi-service verification**

## 5. Manual Browser QA (requires authenticated session)

- [ ] **CMS settings** — load → change → save → reload → persist (🔷 Deferred — needs Supabase Auth)
- [ ] **Paste from Word** — clean HTML, no mso-* styles (🔷 Deferred — clipboard not automatable)
- [ ] **Paste from Google Docs** — clean HTML, supported formatting only (🔷 Deferred — clipboard not automatable)
- [ ] **Browser back/forward** — filter state preserved
- [ ] **Shift+Enter** — soft break, no new paragraph
- [ ] **Empty paragraphs** — preserved on save/reload cycle
- [ ] **10+ numbered lines** — all present after save/reload

## 6. Responsive

- [ ] **360px** — homepage, blog listing, blog detail
- [ ] **390px** — homepage, blog listing, blog detail
- [ ] **768px** — homepage, blog listing, blog detail
- [ ] **1024px** — homepage, blog listing, blog detail
- [ ] **1280px** — homepage, blog listing, blog detail
- [ ] **1440px** — homepage, blog listing, blog detail
- [ ] **No horizontal overflow** on any viewport
- [ ] **Screenshots captured** and archived per release

## 7. Regression

- [ ] **Existing production posts unchanged** — count, content, categories
- [ ] **Existing pages load** — all routes return HTTP 200
- [ ] **No new console errors** on any page
- [ ] **No 404s** on static assets

## 8. Security

- [ ] **XSS prevention** — `escapeHtml()` on all user-rendered text
- [ ] **No script injection** — `<script>` rendered as text
- [ ] **No javascript: URLs** in links
- [ ] **RLS policies** correct for new tables

## 9. Cleanup

- [ ] **Demo/test content deleted** from DB
- [ ] **Temporary settings reverted** to production values
- [ ] **Secrets removed** from code, logs, and git history
- [ ] **Screenshots archived** or removed from working directory

## 10. Documentation

- [ ] **CHANGELOG.md** — version bump + changes summary
- [ ] **QA_CHECKLIST.md** — completed per release
- [ ] **AGENTS.md** — working rules updated with new lessons
- [ ] **Known issues** documented for this release
