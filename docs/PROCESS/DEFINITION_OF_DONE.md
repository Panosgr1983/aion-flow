# Definition of Done — AION Flow

**Status:** Active (2026-08-04)  
**Applies to:** All features, bug fixes, and refactors.

---

## A feature is NOT complete unless:

- [ ] **Tests exist and pass** — automated tests covering the change (unit, integration, E2E where applicable)
- [ ] **Documentation updated** — canonical document updated per Documentation Change Methodology
- [ ] **Migration strategy defined** — DB migrations idempotent, reversible, with dry-run if needed
- [ ] **Rollback plan exists** — how to revert code + data
- [ ] **Smoke test executed** — pre-deploy checklist (QA_CHECKLIST.md Section 9)
- [ ] **Production verified** — post-deploy verification on live URL
- [ ] **No data regression** — existing content preserved; no silent overwrites
- [ ] **Rich content rule respected** — no direct DB rendering; `extractPlainText()` / `renderTipContent()` used correctly (ADR-016)
- [ ] **Indexes/discoverability updated** — new docs findable from root indexes
- [ ] **Baseline recorded** — production commit documented (BASELINES/)

## A bug fix is NOT complete unless:

- [ ] Root cause identified (not just symptom)
- [ ] Regression test added for the exact failure mode
- [ ] Incident record created/updated if production impact
- [ ] Fix deployed and verified in production

## A release is NOT closed unless:

- [ ] All automated tests pass
- [ ] Manual QA checklist completed
- [ ] Known issues documented
- [ ] Release record + closure record created
- [ ] Production baseline updated
- [ ] No unplanned scope in the release
- [ ] **Documentation synchronization check passed** — answered explicitly:
  - Did any architecture decision change? → ADR/DECISION_LOG updated
  - Did any canonical rule change? → ENGINEERING_PRINCIPLES updated
  - Did any runbook change? → RUNBOOKS updated
  - Did any baseline change? → BASELINES updated
  - If no → no documentation change required (documented as "no change")
