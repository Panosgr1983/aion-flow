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

## AKES Architecture

```
AKES v1.0 (Current)
  ├── Knowledge Engine
  │   ├── Documentation (L1) ✅
  │   ├── Validation (L2) ✅
  │   └── Memory (L3) 🟡 Growing

AKES v1.1 (Planned — next)
  └── Governance Engine
      ├── Definition of Excellence
      ├── Engineering Maturity Score
      ├── Executable Playbooks (stateful workflows)
      ├── Release Gates
      └── Coach Mode

AKES v2 (Future)
  └── Intelligence Engine
      ├── Reuse Analytics
      ├── Method Confidence
      ├── Engineering KPIs
      └── AI Confidence
```

### Level Map

| Level | Name | Engine | Status | Description |
|-------|------|--------|--------|-------------|
| L1 | Documentation | Knowledge | ✅ Complete | Architecture, modules, tenants, methods, playbooks, reference |
| L2 | Validation | Knowledge | ✅ Complete | Tenant isolation, checklists, blockers, known issues, tech debt |
| L3 | Memory | Knowledge | 🟡 Growing | Session logs, history, lessons learned, decision memory |
| L4 | Governance | Governance | 🔄 Planned (v1.1) | Rules, gates, scorecards, Definition of Excellence, coach mode |
| L5 | Intelligence | Intelligence | 🔄 Future (v2.0) | Reuse analytics, method confidence, engineering KPIs, AI confidence |

### AKES v1.1 — Governance Engine (Planned)

The AKES becomes a TEACHER, not just memory. Before any action, it coaches:
- "Did you read CREATE_MODULE.md?"
- "Did you run Reuse Audit?"
- "Did you pass Tenant Isolation?"

Pre-deployment, it enforces:
- Build ❌ Typecheck ❌ Isolation ❌ Telemetry ❌ Docs Updated → BLOCKED

**NOT yet implemented.** See `docs/01_PLATFORM/ROADMAP.md` → AKES v1.1.

## What NOT to Do

1. Don't create new doc if one already exists (Search before Create)
2. Don't invent new pattern if one is already validated
3. Don't modify AGENTS.md without approval
4. Don't push/deploy without explicit approval
5. Don't skip CURRENT_STATE.md update after completing work
6. Don't enable tenant-scoped module without passing TENANT_ISOLATION_CHECKLIST
