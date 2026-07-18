# AION Release Checklist

**AKES v1.5**
**Ισχύει για:** production deployments, feature releases, hotfixes

---

## Preflight

- [ ] **Project Identity VERIFIED**
  - Product ID confirmed (π.χ. KOL-001, KAR-001)
  - Target DB confirmed
  - Forbidden DB/refs confirmed (repos must never touch)
- [ ] **Session Objective verified**
  - Στόχος του session καταγεγραμμένος
  - Scope clearly defined (what is IN and OUT)
- [ ] **ADR updated** (if architecture change)
  - Νέα ADR ή ενημέρωση υπάρχουσας

## Implementation

- [ ] **Database migration reviewed**
  - Idempotent (`CREATE IF NOT EXISTS` / `ON CONFLICT DO NOTHING`)
  - Reversible (rollback documented)
  - No secrets in migration files
  - RLS policies correct (auth.uid() pattern, tenant isolation)
- [ ] **Documentation updated**
  - CHANGELOG.md — version bump + changes summary
  - DATABASE.md — new tables/columns documented
  - FEATURES.md — features table updated
  - AGENTS.md — working rules updated if needed

## Validation

- [ ] **TypeScript typecheck** (`npm run typecheck` or equivalent)
- [ ] **Lint** (`npm run lint` or equivalent)
- [ ] **Browser tests passed** (manual regression)
  - Super Admin flow
  - Client admin flow
  - All affected modules
- [ ] **AKES Review Gate completed**
  - Architecture review
  - Security review (secrets, RLS)
  - Multi-project safety check

## Git & Version Control

- [ ] **Git clean**
  - No unstaged changes
  - No untracked secrets
  - `.gitignore` covers all sensitive files
- [ ] **GitHub synchronized**
  - `main` branch pushed to `origin`
  - No un-pushed commits
  - Remote HEAD matches local HEAD
- [ ] **Release tagged**
  - Semantic version tag (π.χ. `v0.6.0`)
  - Tag pushed to origin

## Deploy

- [ ] **Preview deployment OK** (if CI/CD connected)
- [ ] **Production deployment OK**
  - Build succeeded
  - Environment variables present
  - Correct project / target
- [ ] **Production verification complete**
  - Production URL loads
  - Login works (Super Admin + client admin)
  - All changed features visible
  - No console errors
  - No 404s or broken resources
- [ ] **Rollback path documented**
  - Previous deployment ID recorded
  - Rollback procedure known
  - Database migration reversible
