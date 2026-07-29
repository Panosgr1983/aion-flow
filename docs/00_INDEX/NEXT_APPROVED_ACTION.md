# NEXT APPROVED ACTION

**Updated:** 2026-07-29
**Status:** Approved and in progress

---

## Current Priority: AKES v1.6 Discipline Protocols

Complete the AKES documentation discipline: Knowledge Hydration, Decision History, Memory Persistence, Secure Credential Access. Then resume Kareli (AKR-KAR-001) content model upgrade.

### Sequence

| Order | Task | Status |
|-------|------|--------|
| 1 | ✅ AGENTS.md created | Done |
| 2 | ✅ AKES folder structure (00-09) | Done |
| 3 | ✅ CREDENTIALS sanitized → CREDENTIALS_REGISTRY.md | Done |
| 4 | ✅ START_HERE.md + CURRENT_STATE.md + NEXT_APPROVED_ACTION.md | Done |
| 5 | ✅ Platform docs → 01_PLATFORM/ | Done |
| 6 | ✅ Tenant docs → 02_TENANTS/ (Kolokotronis + Kareli) | Done |
| 7 | ✅ Module docs → 03_MODULES/ | Done |
| 8 | ✅ First validated methods → 04_METHODS/ | Done |
| 9 | ✅ AI_MEMORY.md + METHOD_TEMPLATE.md | Done |
| 10 | ✅ SESSION_LOG_TEMPLATE.md | Done (Jul 2026) |
| 11 | ✅ MEMORY_UPDATE_PROTOCOL.md | Done (Jul 2026) |
| 12 | ✅ SESSION_OBJECTIVE.md | Done (Jul 2026) |
| 13 | ✅ AGENT_PERFORMANCE.md + metrics schema | Done (Jul 2026) |
| 14 | ✅ Release 2026-07-29 (Process Baseline) | Done (47/47 QA) |
| 15 | ✅ AKES v1.6 discipline protocols | Done (Jul 2026) |
| 16 | 🔄 docs:index + docs:validate scripts | Next |
| 17 | ❌ Kareli (AKR-KAR-001) content model migration | Paused |

---

## Not Approved Yet

| Proposal | Reason |
|----------|--------|
| New vertical module (Medical, Hotel, etc.) | Premature — Kareli migration first |
| Platform Hardening (v0.8) | Postponed — AKES v1.5 in progress |
| Blueprint Engine | Future — needs more proven verticals first |
| aion-core repository | Architectural decision — needs documentation inventory |

---

## Session Memory (Current Session)

### Last Completed Session (2026-07-29)
1. Service FAQ (Performance Baseline #1): migration, CMS UI, public rendering, JSON-LD, seed data
2. 8/8 Playwright tests for Service FAQ with data-testid pattern
3. AKES v1.6 discipline protocols formalized:
   - Mandatory Knowledge Hydration (read before act)
   - Decision History Preservation (not every sentence)
   - Source/Confidence Classification (✅🟡🔷❓ provenance)
   - Existing Memory & History Update Rule (append before duplicate)
   - Mandatory Memory Persistence (DoD = impl + test + doc + mem + index)
   - Secure Credential Access (three-tier: docs / vault / runtime)
   - AKES Core Principle (Read → Search → Reuse → Verify → Append → Persist)
4. CREDENTIAL_ABSTRACTION_LAYER.md promoted from Πρόταση → Ενεργό Standard
5. CREDENTIALS_REGISTRY.md updated with three-tier architecture
6. START_HERE.md, SESSION_OBJECTIVE.md, CURRENT_STATE.md updated to v1.6

**Next priority:** docs:index + docs:validate scripts → Kareli content model migration  
**Deploy allowed:** ✅ Allowed for documentation commits
