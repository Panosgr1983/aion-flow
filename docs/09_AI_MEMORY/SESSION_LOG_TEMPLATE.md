# Session Log Template

**Part of AKES v1.5 — AI_MEMORY**
**Purpose:** Canonical template for all AION agent session logs.
**Applies to:** Every task, release or session that modifies code, documentation, database or infrastructure.

---

## Variant Selection

| Duration | When to Use |
|----------|-------------|
| **Single-day** | Session completes within one calendar day |
| **Multi-day** | Session spans multiple days (e.g. Friday→Monday) |

Use the multi-day variant when there is a gap between work periods. Otherwise, use single-day.

## Standard Status Values

| Symbol | Meaning |
|--------|---------|
| ✅ Complete | Finished and verified |
| 🟡 Partial | Partially done, known gaps |
| 🔷 Deferred | Intentionally postponed |
| ❌ Failed | Attempted but did not succeed |
| 🔄 In Progress | Actively being worked on |
| 🔜 Next | Planned for next session |

---

# Template — Single-Day

```markdown
# Session Log: YYYY-MM-DD — <Descriptive Title>

<3-5 line summary of the session: what was accomplished, what changed, overall state.>

---

## Session Objective

<Link to SESSION_OBJECTIVE.md or inline reference.>

**Business Goal:** <one-liner>
**User Request:** <the original ask>

---

## Scope

**In Scope:**
- <item>
- <item>

**Out of Scope:**
- <item>
- <item>

---

## Context Read

<Key documents, files, or references consulted before implementation.>

---

## Key Decisions

1. **<Decision title>.** Rationale. (Per user guidance: "<quote>")
2. **<Decision title>.** Rationale.

---

## Reuse Audit

<What existing patterns, components, or methods were reused or considered.>

---

## Tenant Impact

| Tenant | Impact | Status |
|--------|--------|--------|
| <tenant> | <description> | ✅ / 🟡 / ❌ |

---

## Files Changed

- `<path>` — <reason> (NEW / Updated / Regenerated)

---

## Implementation Result

<What was built, what was fixed, key outcomes.>

| Component | Files | Status |
|-----------|-------|--------|
| <component> | <path> | ✅ |

---

## Validation and QA

| Check | Result | Details |
|-------|--------|---------|
| TypeScript | ✅ / ❌ | errors? |
| Lint | ✅ / ❌ | errors? |
| Build | ✅ / ❌ | errors? |
| Automated tests | X/X | passed/total |
| Manual tests | X/X | passed/deferred |

---

## Deployment Status

| Deploy | Target | Result | URL |
|--------|--------|--------|-----|
| <project> | <environment> | ✅ / ❌ | <url> |

---

## Agent Performance

| Metric | Value |
|--------|-------|
| run_started_at | <ISO 8601> |
| run_completed_at | <ISO 8601> |
| total_wall_clock_ms | <ms> |
| tool_calls_total | <count> |
| tool_calls_failed | <count> |
| files_changed | <count> |
| commits_created | <count> |
| automated_tests_total | <count> |
| automated_tests_passed | <count> |

First fully measured release records full metrics. Baseline releases record available metrics with `null` and a reason for missing values.

---

## Documentation Updated

- [ ] CURRENT_STATE.md
- [ ] NEXT_APPROVED_ACTION.md
- [ ] Tenant HISTORY.md
- [ ] Tenant CONTENT_MAPPING.md
- [ ] ADR created/updated
- [ ] Methods/reuse registry
- [ ] Maturity evidence updated
- [ ] Release record created
- [ ] Performance record created
- [ ] SEARCH_INDEX regenerated

---

## Known Limitations

- <deferred checks, unverified assumptions, open questions>

---

## Next Approved Action

<What the agent should do next.>
```

---

# Template — Multi-Day

Same as single-day with these additions:

```markdown
# Session Log — YYYY-MM-DD to YYYY-MM-DD

**AKES Phase:** <phase name>
**Status:** <overall status>

<Same sections as single-day, plus:>

## Session Timeline

| Date | Work Done | Duration |
|------|-----------|----------|
| YYYY-MM-DD | <summary> | <hours> |
| YYYY-MM-DD | <summary> | <hours> |

## Interruptions or Gaps

<What caused the multi-day span, if notable.>
```
