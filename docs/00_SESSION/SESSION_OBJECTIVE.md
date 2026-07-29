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

## Standard Workflow

```
1. Agent reads SESSION_OBJECTIVE.md (this file)
2. Agent formulates objective based on user request
3. User reviews and approves
4. Agent works within IN scope
5. Agent does NOT work on OUT scope
6. Agent updates SESSION_OBJECTIVE.md status when complete
```

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

## Current Objective

**Status:** <PENDING / APPROVED / COMPLETED>

| Field | Value |
|-------|-------|
| **Business Goal** | |
| **User Request** | |
| **In Scope** | |
| **Out of Scope** | |
| **Acceptance Criteria** | |
| **Affected Tenants** | |
| **Affected Projects** | |
| **Affected Modules** | |
| **Planned Files** | |
| **Database Impact** | |
| **Deployment Impact** | |
| **Rollback Plan** | |
| **Documentation Impact** | |
| **Approval Status** | |
