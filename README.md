# AION CMS

> Multi-tenant CMS πλατφόρμα με CRM, Pipeline, Email Workspace & Analytics

## Documentation

> **Ξεκίνα από `docs/README.md`** για το 30-min developer onboarding path.

| Αρχείο | Περιεχόμενο |
|--------|------------|
| [docs/README.md](./docs/README.md) | **Entry point** — onboarding path & δομή docs |
| [MASTER/ARCHITECTURE_MAP.md](./docs/MASTER/ARCHITECTURE_MAP.md) | High-level architecture & data flow |
| [MASTER/PERMISSIONS_MATRIX.md](./docs/MASTER/PERMISSIONS_MATRIX.md) | Permission matrix per role |
| [MASTER/CURRENT_STATE.md](./docs/MASTER/CURRENT_STATE.md) | Project status (completed/in-progress/backlog) |
| [MASTER/PROJECT_MEMORY.md](./docs/MASTER/PROJECT_MEMORY.md) | Evolution, decisions, lessons learned |
| [PRODUCT_PHILOSOPHY.md](./docs/PRODUCT_PHILOSOPHY.md) | Product principles (δεν αλλάζουν) |
| [MANIFESTO.md](./docs/MANIFESTO.md) | Engineering philosophy & αρχές |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture overview |
| [DECISIONS.md](./docs/DECISIONS.md) | Architecture Decision Records (ADRs) |
| [PERMISSIONS.md](./docs/PERMISSIONS.md) | Permissions & access control |
| [TELEMETRY.md](./docs/TELEMETRY.md) | Telemetry & usage events |
| [ROADMAP.md](./docs/ROADMAP.md) | v0.1 → v1.0 milestones |
| [VERSIONS.md](./docs/VERSIONS.md) | Version history & conventions |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Per-release changes |
| [DATABASE.md](./docs/DATABASE.md) | Database schema & RLS |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment & release flow |
| [BACKUP.md](./docs/BACKUP.md) | Backup & disaster recovery |
| [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md) | Code conventions |
| [FEATURES.md](./docs/FEATURES.md) | Feature status (Stable/Beta/Planned) |
| [MODULES.md](./docs/MODULES.md) | Module architecture & dependency graph |
| [KNOWN_ISSUES.md](./docs/KNOWN_ISSUES.md) | Known bugs & workarounds |
| [TECH_DEBT.md](./docs/TECH_DEBT.md) | Technical debt registry |
| [DESIGN_PRINCIPLES.md](./docs/DESIGN_PRINCIPLES.md) | Architectural design principles |
| [COPYWRITING.md](./docs/COPYWRITING.md) | Copywriting rules (AI-consumable) |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | How to contribute |

## Quick Start

```bash
npm install
npm run dev
```

## Current Version

**v0.3.2** — Tenant System: effectiveTenantId, SA auto-assign, docs overhaul.

## Architecture Highlights

- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Frontend:** React 18.3 + Vite + TypeScript + Tailwind CSS
- **Multi-Tenant:** JWT Hook + RLS + `withTenant()` helper
- **Deploy:** Vercel (CMS) + Cloudflare Workers (public sites)
