# SESSION OBJECTIVE Protocol

**Part of AKES v1.5 — Governance Engine**
**Status:** Standard — applies to ALL development sessions
**Canonical source:** `aion-core/standards/SESSION_OBJECTIVE_STANDARD.md` (when aion-core exists)

---

## Purpose

Every AION development session must begin with a clear, written Session Objective. This document defines the protocol for creating, approving, and completing session objectives.

The protocol ensures:
- The agent and the user agree on what will be done
- Scope boundaries are explicit (what is IN, what is OUT)
- Acceptance criteria are measurable
- Rollback, documentation and deployment impacts are considered before any code is written

---

## Required Fields

| Field | Description | Required |
|-------|-------------|----------|
| **Business Goal** | Why this matters to the product or tenant | ✅ Always |
| **User Request** | The original ask, verbatim or summarized | ✅ Always |
| **In Scope** | Explicit list of what will be done | ✅ Always |
| **Out of Scope** | Explicit list of what will NOT be done | ✅ Always |
| **Acceptance Criteria** | Measurable conditions for success | ✅ Always |
| **Affected Tenants** | Which tenants are impacted | ✅ Always |
| **Affected Projects** | Which repositories are touched | ✅ Always |
| **Affected Modules** | Which modules/panels are impacted | ✅ Always |
| **Planned Files** | Files expected to be created or modified | 🔷 Recommended |
| **Database Impact** | New tables, columns, migrations, data seeding | ✅ Always |
| **Deployment Impact** | Which environments need redeploy | ✅ Always |
| **Rollback Plan** | How to revert if something goes wrong | ✅ Always |
| **Documentation Impact** | Which AKES docs need updating | ✅ Always |
| **Approval Status** | PENDING / APPROVED / COMPLETED / REJECTED | ✅ Always |

---

## Prerequisites (Step 0 — Knowledge Hydration)

Before formulating the objective, the agent MUST complete the AKES Knowledge Hydration protocol:

1. Read `00_INDEX/START_HERE.md`, `00_INDEX/CURRENT_STATE.md`, `00_INDEX/NEXT_APPROVED_ACTION.md`
2. Search `00_INDEX/MASTER_INDEX.md` and `00_INDEX/SEARCH_INDEX.md`
3. Read all docs relevant to: active project, affected tenant, affected modules, prior ADRs, known issues/tech debt, previous releases and session logs
4. Confirm the active plan does not contradict existing documentation, decisions, or tenant constraints

> See AGENTS.md → **Mandatory Knowledge Hydration** for full protocol.

## Standard Workflow

```
0. Hydrate knowledge from AKES (see Prerequisites above)
1. Agent reads SESSION_OBJECTIVE.md (this file)
2. Agent formulates objective based on user request
3. User reviews and approves
4. Agent works within IN scope
5. Agent does NOT work on OUT scope
6. Agent updates documentation: CURRENT_STATE.md, NEXT_APPROVED_ACTION.md,
   session log, project/tenant history, content mapping, ADRs, module docs,
   known issues, release record, agent performance, indexes
7. Agent updates SESSION_OBJECTIVE.md status when complete
```

> **Session close rule:** A session is not complete until documentation persistence is verified (see AGENTS.md → **Mandatory Memory Persistence**).

---

## Deviations

If during implementation the agent discovers that:
- The IN scope is insufficient → ask the user before expanding
- The OUT scope is needed → ask the user before changing
- A decision invalidates an acceptance criterion → flag before proceeding

No scope changes without explicit user approval.

---

## Status Values

| Status | Meaning |
|--------|---------|
| PENDING | Objective written, awaiting approval |
| APPROVED | User approved, work can begin |
| COMPLETED | All acceptance criteria met |
| REJECTED | User rejected the objective |
| CANCELLED | Session ended without completion |

---

## Current Objective (Session 2026-07-29c)

**Status:** COMPLETED

| Field | Value |
|-------|-------|
| **Business Goal** | Unify rich content editing across Blog/About/Services with TipTap, resolve all client-reported refinements (category normalization, editor UX, dynamic labels, FAQ visibility) |
| **User Request** | Multiple iterative requests: fix seminar dates, add biography editor, add service editors, fix editor spacing/list markers, change blog eyebrow, fix slugs, remove title constraint, add FAQ toggle |
| **In Scope** | All 10+ client-driven refinements documented in session log |
| **Out of Scope** | FAQ ownership architecture, Content Engine consolidation (Phases 1-6), Kareli upgrade, Vercel secondary |
| **Acceptance Criteria** | 20/20 tests pass, both deployments live, no regression in existing content |
| **Affected Tenants** | KOL-001 |
| **Affected Projects** | aion-flow-v2, kolokotronis-pshychologist-main |
| **Affected Modules** | Blog, Services, About, SiteSettings |
| **Planned Files** | ~18 files across both projects |
| **Database Impact** | 3 new site_settings keys, 3 slug fixes via API |
| **Deployment Impact** | aion-flow-v2 (Vercel), kolokotronis (Cloudflare) |
| **Rollback Plan** | Vercel rollback to `059eda9`, CF rollback to `0e5eda74` |
| **Documentation Impact** | Session log, release record, CURRENT_STATE, AGENT_PERFORMANCE, MODULE_MATURITY, indexes |
| **Approval Status** | ✅ COMPLETED — all docs updated |
