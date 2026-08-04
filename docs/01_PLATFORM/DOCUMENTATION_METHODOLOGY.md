# AION Flow — Documentation Change Methodology

**Status:** Active (2026-07-29)  
**Governs:** All changes to AKES documentation  
**Principle:** *Documentation is an existing system, not a blank canvas.* (Engineering Principle #6)

---

## Core Principle

> Audit first. Preserve structure. Extend canonical sources. Create only for verified gaps.

Every documentation task follows 14 stages. No stage is optional.

---

## The 14 Stages

### 1. Define the Change

Before editing, identify:
- Why is this documentation change needed?
- Does it record current state, history, architecture, process, or future work?
- Which audience needs it?
- Is the information verified, planned, or historical?
- Which repository/project does it apply to?

Do not begin by choosing a filename.

### 2. Inventory Existing Documentation

Inspect:
- Documentation tree (all `.md` files)
- Indexes (START_HERE, MASTER_INDEX, SEARCH_INDEX)
- Related documents covering similar topics
- Cross-references pointing to the area of change
- Historical records for the same topic
- Naming conventions and folder structure
- Existing ownership of the topic

Do not create, rename, move, or delete files during inventory.

### 3. Identify the Canonical Owner

Every topic must have one canonical source.

| Topic | Canonical Document |
|-------|-------------------|
| Engineering Principles | `01_PLATFORM/ENGINEERING_PRINCIPLES.md` |
| Current production state | `00_INDEX/CURRENT_STATE.md` |
| Future work | `01_PLATFORM/ROADMAP.md` |
| Architecture decisions | `01_PLATFORM/DECISIONS.md` or `01_PLATFORM/ADR/` |
| Release verification | `QA_CHECKLIST.md` |
| Release process | `RELEASE_PROCESS.md` |
| Incident evidence | `INCIDENTS/<date>-<description>.md` |
| Historical change | `01_PLATFORM/CHANGELOG.md` |
| Module documentation | `03_MODULES/<Module>/` |
| Tenant documentation | `02_TENANTS/<tenant>/` |
| Session records | `09_AI_MEMORY/SESSION_LOGS/` |
| Documentation methodology | This document |

Other documents may summarize and link, but must not duplicate the full canonical source.

### 4. Classify the Required Action

| Class | Action | Preference |
|-------|--------|------------|
| A | No action required | Highest |
| B | Extend an existing section | |
| C | Correct outdated information | |
| D | Consolidate duplicate information | |
| E | Add a cross-reference | |
| F | Create a new document | |
| G | Deprecate or archive an obsolete document | |
| H | Rename or move a document | Lowest |

Prefer A–E. Use F–H only when justified by audit.

### 5. Update Before Creating

Update an existing document when:
- It already owns the topic
- The addition fits its scope
- It remains readable after the addition
- A new file would create overlap

Create a new document only when:
- No existing document owns the topic
- The topic has an independent lifecycle (maintained separately)
- It needs substantial detail that would bloat the existing owner
- It will serve as a long-term reference
- Embedding it elsewhere would damage clarity

### 6. Preserve History

Do not overwrite historical truth with current truth.

- Historical commit hashes remain in incident and version records
- Current baselines go in Current State
- Completed roadmap work is marked complete or archived
- Incidents are never silently rewritten
- Superseded decisions remain traceable
- Corrections explain what changed and why when necessary

### 7. Distinguish Status Clearly

Every item must be identifiable as one of:

`Implemented` | `In Production` | `Verified` | `Planned` | `Proposed` | `Approved (not implemented)` | `Deprecated` | `Historical`

Never describe roadmap functionality as already implemented. Never present an unverified assumption as current architecture.

### 8. Avoid Duplicate Sources of Truth

When duplication is found:
1. Select the canonical source
2. Preserve the complete explanation there
3. Replace duplicates with concise summaries and links
4. Preserve useful historical context
5. Remove contradictions

Do not copy the same large section into multiple documents.

### 9. Protect the Documentation Structure

Unless explicitly approved:
- Do not redesign the documentation tree
- Do not change numbering conventions
- Do not rename major folders
- Do not mass-move documents
- Do not delete historical files
- Do not introduce a new taxonomy
- Do not create many small documents without clear ownership

The existing documentation is a maintained system, not an empty space.

### 10. Update Discoverability

For each new or materially changed document:
- Update the appropriate index
- Add relevant cross-references
- Verify the document can be found from the root documentation path
- Avoid duplicate index entries
- Preserve logical ordering

A document that exists but cannot be discovered is considered incomplete.

### 11. Validate Links and Consistency

After editing, verify:
- Relative links resolve
- Heading anchors still exist (if linked)
- Index references are correct
- Current commit baselines match production
- Test counts are up to date
- Incident status is consistent
- Roadmap status matches reality
- Project/repository names are correct
- Terminology is consistent

Historical differences are allowed only when explicitly labeled.

### 12. Review the Diff

Before committing, review for:
- Accidental broad rewrites
- Deleted historical information
- Duplicate sections
- Formatting churn
- Unrelated changes
- Broken tables
- Changed heading anchors
- Speculative statements
- Stale references

Documentation changes should be minimal, intentional, and traceable.

### 13. Record the Change

The commit message or final report must state:
- Documents reviewed
- Documents updated
- Documents created
- Documents moved or renamed
- Documents intentionally left unchanged
- Canonical owners selected
- Duplicates consolidated
- Links and indexes validated
- Remaining gaps
- Commit hash

### 14. Periodic Documentation Health Review

Review documentation when:
- After a production incident
- After a major architectural decision
- After a platform-wide refactor
- Before a major release
- When onboarding a new developer
- When multiple documents begin contradicting each other

The review must remain evidence-driven. Do not restructure merely because another structure appears cleaner in theory.

---

## Related

- Engineering Principle #6 — `01_PLATFORM/ENGINEERING_PRINCIPLES.md`
- Documentation-First Development — `docs/patterns/documentation-process.md`
- ADR-016 (Content Pipeline) — `01_PLATFORM/ADR/ADR-016-content-pipeline.md`
