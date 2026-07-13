# START HERE — AION Knowledge & Engineering System

**AKES v1.0** — This is the entry point for every AI agent and developer.

---

## 1. Read These First

| Order | File | Purpose |
|-------|------|---------|
| 1 | `../AGENTS.md` | **Entry protocol** — how to work with this system |
| 2 | `CURRENT_STATE.md` | **Where we are** — platform state, modules, tenants |
| 3 | `NEXT_APPROVED_ACTION.md` | **What's next** — approved next steps |

## 2. Navigation

| Index | Content |
|-------|---------|
| `MASTER_INDEX.md` | Full index of all docs with metadata |
| `SEARCH_INDEX.md` | Generated search index (from `npm run docs:index`) |

## 3. Documentation Structure

```
00_INDEX/         → Navigation, current state, entry points
01_PLATFORM/       → AION Platform architecture, features, decisions
02_TENANTS/        → Per-tenant mini-wikis (Kolokotronis, Kareli, etc.)
03_MODULES/        → Per-module docs (Portfolio, Retreat, Locale, etc.)
04_METHODS/        → Engineering methods (proven/experimental/rejected)
05_DECISION_MEMORY/→ ADRs and why alternatives were rejected
06_PLAYBOOKS/      → Complete procedures (new tenant, import site, etc.)
07_REUSE/          → Reusable components, hooks, patterns
08_REFERENCE/      → Credentials registry, glossary, naming
09_AI_MEMORY/      → AI working rules, memory keeper, session logs
archive/           → Legacy docs (read-only, no delete)
scripts/docs/      → Automation: index, validate, check-links, scan-secrets
```

## 4. Key Principles

- **Search before Create** — check INDEX before writing new doc
- **Reuse before Build** — check METHODS + REUSE before new code
- **No Docs, No Done** — documentation is part of the deliverable
- **Generalize When Proven** — standard methods require 2+ tenants or platform-wide validation

## 5. Working Protocol

```
AI/Developer enters
  ↓
Reads AGENTS.md → START_HERE.md → CURRENT_STATE.md → NEXT_APPROVED_ACTION.md
  ↓
Searches MASTER_INDEX.md + SEARCH_INDEX.md for existing solutions
  ↓
If solution exists: use it. If not: propose experimental method.
  ↓
Wait for approval before implementation.
  ↓
Build → Test → Update memory → Commit → Report
  ↓
No deploy without explicit approval.
```
