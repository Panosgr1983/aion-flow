# AION CMS

> Multi-tenant CMS πλατφόρμα με CRM, Pipeline, Email Workspace & Analytics

## Documentation

| Αρχείο | Περιεχόμενο |
|--------|------------|
| [MANIFESTO.md](./docs/MANIFESTO.md) | Engineering philosophy & αρχές |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture overview |
| [DECISIONS.md](./docs/DECISIONS.md) | Architecture Decision Records (ADRs) |
| [ROADMAP.md](./docs/ROADMAP.md) | v0.1 → v1.0 milestones |
| [VERSIONS.md](./docs/VERSIONS.md) | Version history & conventions |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Per-release changes |
| [DATABASE.md](./docs/DATABASE.md) | Database schema & RLS |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment & release flow |
| [BACKUP.md](./docs/BACKUP.md) | Backup & disaster recovery |
| [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md) | Code conventions |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | How to contribute |

## Quick Start

```bash
npm install
npm run dev
```

## Current Version

**v0.1.0** — Foundation release. 7+ ενεργοί πελάτες σε production.

## Architecture Highlights

- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Multi-Tenant:** JWT Hook + RLS + `withTenant()` helper
- **Deploy:** Vercel (CMS) + Cloudflare Workers (public sites)
