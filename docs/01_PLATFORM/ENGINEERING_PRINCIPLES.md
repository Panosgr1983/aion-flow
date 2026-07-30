# AION Flow — Engineering Principles

**Status:** Ενεργό (2026-07-29)  
**Source:** Derived from production experience across multiple releases and incidents.

---

### 0. Architecture follows evidence, not speculation.

Every significant architectural change must be justified by a real problem, measurable friction, or clear business need — not by hypothetical future scenarios.

### 1. Fix the system, not only the bug.

Every production incident must leave the system stronger than before: better tests, better automation, better documentation, or better architecture.

### 2. One source of truth.

Every data type has one canonical representation and one official processing pipeline. Feature-specific parsers and ad-hoc renderers are technical debt.

### 3. Evidence before abstraction.

Do not generalize a solution until at least two real cases require it. Premature abstraction creates complexity without proven benefit.

### 4. Automate repeated verification.

Anything that must be checked every release should be automated — test, health check, or smoke test. Manual checklists are a bridge, not a destination.

### 5. Protect user content first.

In every incident, priority order:
1. Protect data (no destructive actions before backup)
2. Verify integrity (confirm no data loss)
3. Restore (recover client content)
4. Fix (address root cause)
5. Refactor (improve system only after the above are complete)

### 6. Documentation is an existing system, not a blank canvas.

Every documentation change starts with inventory, respects the existing structure, and extends the canonical source before creating new documents. Audit first, edit second.

See `DOCUMENTATION_METHODOLOGY.md` for the full process.

---

### Derived Rules

| Rule | Applies To |
|------|------------|
| Rich-content fields use shared pipeline: `extractPlainText()` for cards/previews, `renderTipContent()` for full content | All CMS modules |
| No direct rendering of raw DB values for rich-content fields | All routes/components |
| Every deploy runs automated tests + manual smoke checklist | Release process |
| Content Health Check after every production deploy | CI/CD pipeline |
