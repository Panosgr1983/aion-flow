# AI_MEMORY — How to Think & Work

**Part of AKES v1.0**

---

## Before Any Code

```
1. Read memory (AGENTS.md → START_HERE → CURRENT_STATE → NEXT_ACTION)
2. Search existing solutions (MASTER_INDEX + SEARCH_INDEX)
3. Perform reuse audit (METHODS + REUSE)
4. Check ADRs for prior decisions
5. Check TENANT impact
6. Check DOCUMENTATION impact
7. Present PLAN with affected files
8. Wait for APPROVAL
9. Build → Validate → Update memory → Commit
```

## Search Pattern

Before creating anything new, always ask:

1. **Does a component already exist?** Check `07_REUSE/COMPONENTS.md`
2. **Does a method already exist?** Check `04_METHODS/`
3. **Has this been rejected before?** Check `05_DECISION_MEMORY/`
4. **Is there a playbook?** Check `06_PLAYBOOKS/`
5. **Does another tenant already have this?** Check `02_TENANTS/`

## Reuse Hierarchy

```
Search existing codebase
  ↓
Search REUSE registry
  ↓
Adapt existing module/component
  ↓
Create experimental method
  ↓
Validate → Standardize
```

## Current Known Patterns (Ready to Reuse)

| Pattern | Used By | Location |
|---------|---------|----------|
| List/Edit CRUD mode toggle | Portfolio, Retreat | Each panel |
| GR/EN language tabs | Events CRUD | `/dashboard/retreat/events` |
| Includes tags (add/remove) | Experiences, Workshops | Retreat panels |
| Status badges | All panels | Common pattern |
| Gallery grid + lightbox | Portfolio, Retreat | GalleryCRUD |
| Booking form + manager | Kareli | Bookings panel |
| MediaPicker integration | All panels | Common |
| ModuleRegistry registration | Portfolio, Retreat | manifest.ts |
| feature flag gating | All modules | `access.ts` + `useTenant.ts` |
| Relationship Engine (automatic graph) | All frontmatter | `docs/04_METHODS/Core/RELATIONSHIP_ENGINE.md` |

## AKES Architecture (Current: v1.5)

```
AKES v1.5 (Current)
  ├── Knowledge Engine
  │   ├── Documentation (L1) ✅
  │   ├── Validation (L2) ✅
  │   ├── Memory (L3) ✅
  │   └── Relationship Engine (L3+) ✅ v1.5
  │       ├── by_module (dependencies + dependents)
  │       ├── by_tenant (module stacks)
  │       ├── by_method (method usage)
  │       ├── by_playbook (playbook usage)
  │       └── reusable_for (industry suggestions)
  │
  ├── Governance Engine (L4) 🔜 Next
  │   ├── Definition of Excellence
  │   ├── Engineering Maturity Score
  │   ├── Executable Playbooks (stateful workflows)
  │   ├── Release Gates
  │   └── Coach Mode
  │
  └── Intelligence Engine (L5) 🔄 Future
      ├── Reuse Analytics (at 15-20 tenants)
      ├── Method Confidence
      ├── Engineering KPIs
      └── AI Confidence
```

### Level Map

| Level | Name | Engine | Status | Description |
|-------|------|--------|--------|-------------|
| L1 | Documentation | Knowledge | ✅ Complete | Architecture, modules, tenants, methods, playbooks, reference |
| L2 | Validation | Knowledge | ✅ Complete | Tenant isolation, checklists, blockers, known issues, tech debt |
| L3 | Memory | Knowledge | ✅ Complete | Session logs, history, lessons learned, decision memory |
| L3.5 | Relationships | Knowledge | ✅ v1.5 | Metadata-first graph: modules, tenants, methods, playbooks, industries |
| L4 | Governance | Governance | 🔜 Next | Rules, gates, scorecards, Definition of Excellence, coach mode |
| L5 | Intelligence | Intelligence | 🔄 Future | Reuse analytics, method confidence, engineering KPIs, AI confidence |

### AKES Evolution Path

```
v1.0 Knowledge    ✅ Jul 2026 — documentation, memory, methods, tenants
v1.1 Governance   🔜 Next — hardening, checks, blockers, validation
v1.5 Relationship ✅ Jul 2026 — metadata-first graph from frontmatter
v2.0 Intelligence 🔄 Far future — AI confidence, analytics, KPIs, reuse (at 15-20 tenants)
```

### AKES v1.1 — Governance Hardening (Next)

No more documentation expansion. Focus:
- `docs:check` stable across the codebase
- Link validation, secret scanning, duplicate SoT detection
- Checklists in PR workflow
- Blockers enforcement (CRM + E-commerce remain locked)
- Session close discipline (update CURRENT_STATE + NEXT_ACTION)

**NOT yet implemented.** See `docs/01_PLATFORM/ROADMAP.md` → AKES v1.1.

## What NOT to Do

1. Don't create new doc if one already exists (Search before Create)
2. Don't invent new pattern if one is already validated
3. Don't modify AGENTS.md without approval
4. Don't push/deploy without explicit approval
5. Don't skip CURRENT_STATE.md update after completing work
6. Don't enable tenant-scoped module without passing TENANT_ISOLATION_CHECKLIST

## AKES Philosophy (Session 2026-07-13)

### What AKES Is

AKES is the **AION Engineering Operating System**. Not documentation, not a wiki, not a knowledge base, not a second CMS, not ChatGPT.

Like AION FLOW organizes a business, AKES organizes AION's own development. It ensures every new version of AION leverages all existing knowledge, solutions and experience instead of starting from zero.

### Two Products

- **AION FLOW** — The product clients use to manage their business
- **AKES** — The product developers use to build, evolve and maintain AION FLOW with consistency

### Three Levels of Programming

1. **Code** — What most developers do
2. **Architecture** — Design patterns, SOLID, modules, components
3. **Programming the Organization** — Conventions, culture, DNA, governance, playbooks, feedback loops

AKES is Level 3. It programs AION's own development structure and behavior.

### Core Value

**Reuse.** Not documentation. A new client comes in:
- Which modules can I use?
- Which components?
- Which migrations?
- Which methods?
- What should I avoid?
- How long will it take?

That is gold. That is the AKES value proposition.

### AI Future

Not now. Later. When AKES can answer "Build me a website for a psychologist" and instead of starting from zero, it says:

Found:
- Kolokotronis (87% reuse)
- Modules: Blog, Services, Credentials, Testimonials
- Known issues: 2
- Deployment: Cloudflare
- Estimated time: 4 hours

It didn't "think". It recognized patterns from your own experience.

### Ultimate Validation

Να ανοίγεις μια σελίδα και να βλέπεις όλο το σύστημα.

### Rule

Documentation follows software. Never the opposite.

Implement. Test. Prove. Then document as Standard Method.
