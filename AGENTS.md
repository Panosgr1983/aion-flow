# AION Flow — AGENTS.md

**AKES v1.0** (AION Knowledge & Engineering System)
**Updated:** 2026-07-12

---

> **⚠️ SESSION START PROTOCOL — Mandatory**
> At the beginning of EVERY active session, the agent MUST read and confirm
> the AKES entry protocol before performing any work.
>
> ```
> 1. Read AGENTS.md (this file)
> 2. Read 00_INDEX/START_HERE.md
> 3. Read 00_INDEX/CURRENT_STATE.md
> 4. Read 00_INDEX/NEXT_APPROVED_ACTION.md
> 5. Verify referenced files exist and are current
> 6. Report contradictions, blockers, or stale documentation
> 7. Present session-start summary (current state + next approved action)
> 8. Wait for instructions
> 9. Do NOT modify files, commit, push, or deploy without explicit approval
> ```
>
> This protocol is verified by reading the files in every session.
> The agent does NOT "remember" between sessions — it reads and confirms.

## Entry Protocol

Πριν από κάθε ενέργεια, ακολούθησε αυτή τη σειρά:

```
 1. Διάβασε ή δημιούργησε 00_SESSION/SESSION_OBJECTIVE.md
 2. Παρουσίασε Business Goal + Acceptance Criteria στον owner
 3. Περίμενε επιβεβαίωση πριν συνεχίσεις
 4. Εκτέλεσε Project Identity Preflight (aion-core/AGENTS.md)
 5. Διάβασε 00_INDEX/START_HERE.md (αν υπάρχει)
 6. Διάβασε 00_INDEX/CURRENT_STATE.md (αν υπάρχει)
 7. Διάβασε 00_INDEX/NEXT_APPROVED_ACTION.md (αν υπάρχει)
 8. Παρουσίασε Implementation Plan + affected files
 9. Περίμενε έγκριση
10. Build + validation
11. ΜΗΝ κάνεις push/deploy χωρίς ρητή έγκριση
12. Ενημέρωσε SESSION_OBJECTIVE.md + CURRENT_STATE.md πριν δηλώσεις Done
```

---

## Core Rules

### Golden Rules
0. **Generalize When Proven, Not When Predicted**
1. **No Docs. No Done.** — code + QA + docs + report + commit
2. **Documentation First** — architecture → database → workflow → docs → approval → code
3. **Every Commit Teaches the System** — code → docs → pattern → lesson → knowledge
4. **Every Panel Must Produce** — code + QA + docs + report + commit
5. **Every Reusable Discovery Becomes a Pattern**
6. **Every Module Owns Its Documentation**
7. **Reports Are Mandatory**
8. **Architecture Never Lives Only in Code**

### Definition of Done
- [ ] Requirements implemented
- [ ] Build: zero errors
- [ ] QA complete
- [ ] Documentation updated
- [ ] Methods updated (if new pattern emerged)
- [ ] Reports created (if panel completed)
- [ ] Changelog updated
- [ ] CURRENT_STATE.md updated
- [ ] Commit with clear message

---

## Projects & Status

| Project | Tech | Deploy | Status |
|---------|------|--------|--------|
| **aion-flow-v2** | React 18 + Vite 5 + Supabase | Vercel | Active development |
| **kolokotronis-pshychologist-main** | TanStack Start + React 19 | Cloudflare Workers | ✅ Live |
| **ktima-kareli-site** | React 19 + Vite 8 | Vercel | ✅ Live |
| **dionisis-xanthos** | Next.js 16 | Vercel | Reference project |
| **aion-cms-main** | Next.js 14 | Vercel | Legacy |
| **portfolio-main** | React 18 + Vite 6 | Netlify | Personal portfolio |

---

## Project Identity

- **Product ID:** KOL-001
- **Client:** Νικόλας Κολοκοτρώνης
- **Canonical repository:** `Panosgr1983/aion-flow` — **only this repo is writable**
- **Deprecated duplicate:** ~~`Panosgr1983/aion-flowv2`~~ (archive — do not use)
- **Legacy snapshot:** `Panosgr1983/aion-flow-public` (release/v0.2 only, stale)
- **CMS URL:** https://aion-flowv2.vercel.app
- **Supabase:** `qhbgptlklsavezxpksao`
- **Forbidden Supabase:** `idagkrwpmcnppjpnrbgv` (Kareli — NEVER use)

## Architecture Pillars

1. **Multi-Tenant** — JWT hook + RLS + three-tier tenant IDs
2. **Module Registry** — self-registering modules via manifest
3. **Feature Flags** — per-tenant gating via `tenant_features` table
4. **Supabase** — `qhbgptlklsavezxpksao.supabase.co`
5. **Documentation-First** — ADR-012, AKES v1

---

## Project Memory (Session History)

### Phase 1: Foundation (June 2026)
- Multi-tenant architecture with JWT hook + RLS
- CMS: Services, Blog, Products, Pages, Media
- CRM: Inbox, Pipeline, Email Workspace
- Platform: Backup, Usage Dashboard, Observability

### Phase 2: Portfolio Module (July 2026)
- 8 CRUD panels: Biography, Filmography, Television, Theatre, Timeline, Gallery, Press, Showreels
- Module Registry system
- 12 reusable architecture patterns
- ADR governance (13 decisions)
- Development Constitution (9 Golden Rules)

### Phase 3: Architecture Refactor (July 2026)
- Artist → Portfolio Module rename
- Module Registry + Manifest system
- Documentation-First Rule (ADR-012)
- 12 architecture patterns in `docs/patterns/`

### Phase 4: Retreat Module (July 2026)
- 5 CRUD panels: Experiences, Workshops, Events (bilingual), FAQ, Bookings
- Tenant: Ktima Kareli (a6a0e182-...)
- Public site migration to shared Supabase
- Booking pipeline with date range

### Phase 5: AKES v1 (Current)
- Knowledge Audit completed (87 docs inventoried)
- Building AION Knowledge & Engineering System
- Security cleanup (rotating exposed secrets)
- Controlled migration to indexed structure

---

## Working Rules

1. **Reuse proven methods before inventing new ones**
2. **New methods remain experimental until validated in 2+ tenants**
3. **Search before Create** — always check INDEX + SEARCH first
4. **Build blocker (warning):** new module without README + METHODS + PERMISSIONS flagged
5. **No undocumented architecture** — any undocumented feature = technical debt
6. **No deploy without explicit approval**
7. **Update CURRENT_STATE.md + indexes before marking Done**
8. **Never enable a tenant-scoped module whose isolation status is not VALIDATED or STANDARD**
9. **Every new module must pass TENANT_ISOLATION_CHECKLIST.md before feature flag activation**
10. **A multilingual feature is COMPLETE only when verified in DB, CMS authoring, AND public-site rendering, with documented fallback behavior**
11. **Every module has a Module Maturity Index (MMI) score tracked in CURRENT_STATE.md**
12. **COMPLETE ≠ VERIFIED** — a feature is not owner-approved until marked VERIFIED by product owner
13. **PROJECT IDENTITY PREFLIGHT — MANDATORY** — Before any migration, deploy, env change, or schema edit: read `aion-core/products/PRODUCT_REGISTRY.md` + `aion-core/products/KOL-001.md`, verify this is `aion-flow-v2` (NOT kareli), confirm target DB is `qhbgptlklsavezxpksao`, and state the resolved target with evidence. Never assume project identity from folder name alone.
14. **SESSION OBJECTIVE — MANDATORY** — At session start, create/read `00_SESSION/SESSION_OBJECTIVE.md`. Present Business Goal + Acceptance Criteria to owner before any code. Do not skip this step even when resuming a session.
15. **RELEASE CHECKLIST — MANDATORY** — Every production deploy must follow `docs/RELEASE_CHECKLIST.md`. All items must be checked before deploy. The checklist must be referenced in the commit message or deploy log.
16. **AKES REVIEW GATE** — No merge or production deploy without architecture review. The review covers: DB migrations, RLS/permissions, secrets, multi-project safety, documentation updates, and ADR compliance. See ADR-016.
17. **CREDENTIAL ABSTRACTION (CAL)** — No raw secrets in any context visible to agents (AGENTS.md, SESSION_OBJECTIVE, docs, git history). Use aliases only. See `docs/01_PLATFORM/CREDENTIAL_ABSTRACTION_LAYER.md`.
