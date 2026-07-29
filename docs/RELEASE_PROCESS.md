# AION Flow — Release Process

**Σκοπός:** Κάθε release να ακολουθεί την ίδια επαναλήψιμη διαδικασία,  
ανεξάρτητα από το μέγεθος ή τον tenant.

---

## Φάση 1: Development

```
[1.1] Ανάλυση απαίτησης
  → Root cause (όχι symptom fix)
  → Scope: IN / OUT
  → Affected projects identified

[1.2] Implementation
  → Code changes
  → Database migration (idempotent)
  → No hardcoded tenant IDs (unless Gen1 legacy)
  → Rollback path planned

[1.3] Local verification
  → npm run build (both projects if multi-project)
  → npm run typecheck
  → npm run lint
```

**Output:** Committed code, build passes, migration file ready.

---

## Φάση 2: Pre-Deployment

```
[2.1] Commit
  → Meaningful commit message (feat/fix/chore pattern)
  → Commit hash recorded

[2.2] Database seed / migration
  → Run idempotent SQL
  → SELECT to verify rows
  → Confirm no overwrites, no duplicates

[2.3] Pre-deployment review
  → Verify tenant UUID against production
  → Verify JSONB format
  → Verify fallback values in code
  → npm audit (upgrade patched deps if available)
```

**Output:** DB ready, review complete, go-ahead from product owner.

---

## Φάση 3: Deploy

```
[3.1] Deploy CMS first (AION Flow)
  → vercel --prod
  → Verify HTTP 200

[3.2] Verify CMS settings
  → Settings load
  → Settings save
  → Settings persist after reload

[3.3] Deploy public site
  → Primary target (Cloudflare Workers / Vercel)
  → Secondary target (if applicable)
  → Verify HTTP 200 on all routes
```

**Order matters:** CMS first → verify → public site.  
Never deploy public site before CMS is verified.

---

## Φάση 4: QA

```
[4.1] Automated (Playwright / CLI)
  → DB settings verification
  → Demo content lifecycle (create → test → delete)
  → Date visibility toggle (false → true → false)
  → Rich text rendering (all node types)
  → Category filters (URL parameter)
  → Responsive screenshots (6 viewports × 3 pages)
  → Production posts unchanged

[4.2] Manual (browser, authenticated)
  → CMS settings save/persist cycle
  → Word / Google Docs paste
  → Browser back/forward
  → Shift+Enter, empty paragraphs
  → 10+ numbered lines save/reload

[4.3] Regression
  → All routes HTTP 200
  → No console errors
  → No 404s
  → Existing content unchanged
```

**Output:** QA_CHECKLIST.md completed, all items ✅ Verified or documented.

---

## Φάση 5: Cleanup

```
[5.1] Remove demo/test content from DB

[5.2] Restore settings to production values

[5.3] Verify production posts unchanged
  → count, content, categories
```

**Output:** Clean state, no test artifacts.

---

## Φάση 6: Close

```
[6.1] Update documentation
  → CHANGELOG.md — version + changes
  → AGENTS.md — working rules
  → QA_CHECKLIST.md — completed per release

[6.2] Final report
  → Deployment URLs
  → Commit hashes
  → QA results
  → Remaining limitations (if any)
  → Rollback commands

[6.3] Acceptance
  → Product owner review
  → Task closed
```

**Output:** Release complete, documented, accepted.

---

## Rollback

| Stage | Action |
|-------|--------|
| Pre-deploy | `git checkout -- .` (discard uncommitted) |
| After commit | `git revert <hash>` (safe reverse commit) |
| After deploy CF | `git revert <hash> && npm run build && wrangler deploy` |
| After deploy Vercel | `git revert <hash> && npm run build && vercel --prod --yes` |
| After DB seed | `DELETE FROM site_settings WHERE key IN (...)` (if no existing data overwritten) |
