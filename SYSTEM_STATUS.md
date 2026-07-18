# AION FLOW — System Status

**Updated:** 2026-07-18
**Verified by:** AKES Review Gate

---

## Project Identity

| Property | Value |
|----------|-------|
| **Product** | KOL-001 — Kolokotronis |
| **Canonical repository** | `Panosgr1983/aion-flow` |
| **Production CMS** | `https://aion-flow-v2.vercel.app` |
| **Production website** | `https://kolokotronis-website.choliasmenos-panos.workers.dev` |
| **Database** | `qhbgptlklsavezxpksao.supabase.co` |
| **Branch** | `main` |
| **Deployment** | Automatic — GitHub → Vercel |
| **Current release** | v0.6.0 |
| **Architecture** | Independent Product |
| **Project Identity** | ✅ Enabled |
| **AKES Review Gate** | ✅ Enabled |

## Project Lifecycle

```yaml
project:
  id: KOL-001
phase: production
release: v0.6.0
next_milestone: Service-Level Related Articles
known_blockers: none
active_feature: Related Articles
current_priority: Medium
production_status: Stable
deployment: Automatic
```

## Repository Architecture

| Repository | Role | Status |
|------------|------|--------|
| `Panosgr1983/aion-flow` | Canonical — writable | ✅ Active |
| ~~`Panosgr1983/aion-flowv2`~~ | Deprecated duplicate | 🔒 Archived |
| ~~`Panosgr1983/aion-flow-public`~~ | Legacy snapshot | 🔒 Archived |

## ADRs in Effect

- ADR-001 through ADR-018 — see `docs/DECISIONS.md`

## Key Standards

- `docs/RELEASE_CHECKLIST.md` — mandatory before each deploy
- `docs/01_PLATFORM/CREDENTIAL_ABSTRACTION_LAYER.md` — no raw secrets in agent contexts
- `AGENTS.md` — rules 15-17: Review Gate, Release Checklist, CAL
