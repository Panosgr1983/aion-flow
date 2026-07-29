# AKES Memory Update Protocol

**Part of AKES v1.5 — AI_MEMORY**
**Purpose:** Mandatory post-task sequence for updating AKES documentation after every session.

---

## Rule

Every session that modifies code, documentation, database or infrastructure MUST execute this protocol before the session is considered complete.

This prevents the most common AKES failure: the agent finishes the technical work but leaves AKES documentation stale.

---

## Mandatory Sequence

Execute in order. Skip only when the condition clearly does not apply.

```
1. Update CURRENT_STATE.md
2. Update NEXT_APPROVED_ACTION.md
3. Create or update session log
4. Update tenant HISTORY.md (if tenant affected)
5. Update tenant CONTENT_MAPPING.md (if content sources changed)
6. Create or update ADR (if architecture changed)
7. Update methods/reuse registry (if new pattern established)
8. Update maturity evidence (MODULE_MATURITY.md)
9. Create release record (if release)
10. Record performance metrics
11. Regenerate SEARCH_INDEX.md
12. Link validation
13. Commit documentation
```

---

## Conditions Per Document

### 1. CURRENT_STATE.md
**Update when:** Any module, tenant, platform element or known issue changes.
**Skip when:** Documentation-only changes that don't affect state.

### 2. NEXT_APPROVED_ACTION.md
**Update when:** Current priority changes, new tasks identified, blocked tasks cleared.
**Skip when:** Session completes exactly what was planned with no new tasks.

### 3. Session Log
**Update when:** Always. Every session gets a log.
**Skip when:** Never. Even failed or cancelled sessions must be logged.

### 4. Tenant HISTORY.md
**Update when:** Code, content, or config changes for that tenant.
**Skip when:** Platform-only changes (e.g. new module that no tenant uses yet).

### 5. Tenant CONTENT_MAPPING.md
**Update when:** Content sources change (new DB fields, new settings keys, hardcoded→DB migration).
**Skip when:** Pure code refactoring with no content source change.

### 6. ADR
**Update when:** Architecture decision made (new pattern, new dependency, structural change).
**Skip when:** Bug fix, content migration, or pure implementation within existing architecture.

### 7. Methods/Reuse Registry
**Update when:** New reusable pattern established.
**Skip when:** All changes are tenant-specific.

### 8. MODULE_MATURITY.md
**Update when:** Maturity score changes or new evidence exists.
**Skip when:** No module-level change (e.g. tenant-specific content only).

### 9. Release Record
**Update when:** Production deployment occurs.
**Skip when:** Development session with no deploy.

### 10. Performance Metrics
**Update when:** Release or measured task completed.
**Skip when:** Non-measured session (baseline / discovery).

### 11. SEARCH_INDEX.md
**Update when:** New documents created or existing ones deleted.
**Skip when:** Edits to existing documents only (no structural change).

### 12. Link Validation
**Update when:** Files moved, renamed, or deleted.
**Skip when:** No structural changes to documentation.

---

## Failure Mode

If any step is skipped incorrectly:
- The documentation becomes stale
- Future agents will work with outdated context
- Decisions will be repeated unnecessarily
- Metrics will be incomplete

When in doubt, update. Over-documentation is cheaper than mis-documentation.
