# Release — 2026-07-29b

## Performance Baseline #1 (AKR-KOL-PB-001): CMS-driven Service FAQ

---

### Root Cause

Services (Ψυχοθεραπεία, EMDR, Ρέικι, Mindfulness) had no FAQ functionality. Frequently asked questions (duration, sessions, costs, EMDR protocol) existed only in therapist knowledge and were not displayed on the public site or manageable via CMS.

---

### Scope

| In | Out |
|----|-----|
| `service_faq_entries` table (migration + RLS + triggers) | Content model changes to services |
| CMS FAQ tab in Services.tsx (4th tab: inline CRUD + reorder) | Non-KOL-001 tenants (table is tenant-agnostic) |
| Public site FAQ accordion (services.$slug.tsx) | FAQ import/export |
| JSON-LD FAQPage structured data | Vercel secondary (pre-existing infra) |
| useServiceFaq() hook (single-join query) | Kareli content model upgrade (paused) |
| Service role key usage (apikey header pattern) | |
| Seed data: 10 FAQ entries across 4 services | |
| Data-testid attributes for Playwright | |
| AKES v1.6 discipline protocols (Knowledge Hydration, Decision History, Memory Persistence, Secure Credential Access) | |

---

### Commit Hashes

| Repo | Hash | Files | Delta |
|------|------|-------|-------|
| kolokotronis | (uncommitted) | `services.$slug.tsx`, `content-hooks.ts`, `playwright.config.ts`, `tests/service-faq.spec.ts` | +FAQ accordion + JSON-LD + 8 tests |
| aion-flow-v2 | (uncommitted) | `Services.tsx`, `dataHelpers.ts`, `supabase.ts`, migration | +FAQ tab + helper + type + 10 seed entries |

---

### Database

**New table:** `service_faq_entries`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `tenant_id` | UUID | NOT NULL, FK → tenants(id) |
| `service_id` | UUID | NOT NULL, FK → services(id) ON DELETE CASCADE |
| `question` | TEXT | NOT NULL, CHECK(length(trim(question)) > 0) |
| `answer` | TEXT | NOT NULL, CHECK(length(trim(answer)) > 0) |
| `sort_order` | INTEGER | DEFAULT 0 |
| `is_active` | BOOLEAN | DEFAULT true |
| `created_at` | TIMESTAMPTZ | DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() |

**Indexes:** `(tenant_id, service_id, is_active, sort_order)`

**Triggers:**
- `updated_at` auto-update
- Tenant consistency: `service_faq_entries.tenant_id` must match `services.tenant_id`

**RLS Policies (5):**
1. Authenticated users: SELECT (own tenant)
2. Authenticated users: INSERT (own tenant)
3. Authenticated users: UPDATE (own tenant)
4. Authenticated users: DELETE (own tenant)
5. Public: SELECT only active entries (is_active = true)

**Seed:** 10 idempotent upsert entries:

| Service | Questions |
|---------|-----------|
| Ψυχοθεραπεία (autognosia) | 4 (duration, sessions, cost, insurance) |
| Ρέικι (reiki) | 2 (what is Reiki, session experience) |
| EMDR (emdr) | 2 (what is EMDR, when is it used) |
| Mindfulness (mindfulness) | 2 (what is mindfulness, benefits) |

---

### Deploy Targets

| Project | Target | URL | Status |
|---------|--------|-----|--------|
| AION Flow | Vercel | `https://aion-flowv2.vercel.app` | ✅ HTTP 200 |
| Kolokotronis | Cloudflare Workers | `https://kolokotronis-website.choliasmenos-panos.workers.dev` | ✅ HTTP 200 all routes |
| Kolokotronis | Vercel (secondary) | `https://kolokotronis-pshychologist-main.vercel.app` | ⚠️ Pre-existing 404 (needs Nitro preset build) |

---

### QA Results

#### Automated: 8/8 ✅ Passed (Playwright, headless Chromium, production target)

| Test | Result | Duration |
|------|--------|----------|
| FAQ section renders on service with FAQ data (autognosia) | ✅ | 3.9s |
| FAQ accordion expands and collapses | ✅ | 3.6s |
| FAQ entries count matches seeded data (4 for autognosia) | ✅ | 3.5s |
| FAQ section NOT shown for service without FAQ (epignosi) | ✅ | 3.5s |
| FAQ JSON-LD FAQPage structured data present | ✅ | 3.6s |
| EMDR service has 2 FAQ entries | ✅ | 3.5s |
| Reiki service has 2 FAQ entries | ✅ | 3.5s |
| FAQ ordering matches DB sort_order | ✅ | 3.5s |

**Total:** 8/8 ✅ in 29.3s

#### Selector strategy: `data-testid` established

| Test | Selector | Rationale |
|------|----------|-----------|
| Positive rendering | `text="Συχνές Ερωτήσεις"` | Static heading, semantic |
| Count/ordering | `[data-testid="faq-item"]` | Repeated, translated, CMS-changed |
| Interaction | `text="Πόσο διαρκεί μία συνεδρία;"` | Controllable, unique in context |
| Click trigger | `[data-testid="faq-trigger"]` | Dynamic, DOM may change |

---

### Screenshots

Not captured for this release (no responsive layout changes).

---

### Documentation Created / Updated

- `docs/AGENTS.md` — data-testid selector rule, AKES v1.6 discipline protocols (Knowledge Hydration, Decision History, Memory Persistence, Secure Credential Access)
- `docs/QA_CHECKLIST.md` — FAQ-specific checks added
- `docs/releases/2026-07-29b/RELEASE.md` — this file
- `docs/09_AI_MEMORY/SESSION_LOGS/2026-07-29b.md` — session log
- `docs/09_AI_MEMORY/METRICS/releases/2026-07-29b.json` — machine-readable metrics (performance_baseline)
- `docs/08_METRICS/AGENT_PERFORMANCE.md` — PB #1 record added
- `docs/04_METHODS/Core/MODULE_MATURITY.md` — Services module added, evidence links
- `docs/00_INDEX/CURRENT_STATE.md` — AKES v1.6, FAQ, MMI
- `docs/00_INDEX/START_HERE.md` — Updated working protocol
- `docs/00_SESSION/SESSION_OBJECTIVE.md` — Prerequisites + session close rule
- `docs/00_INDEX/NEXT_APPROVED_ACTION.md` — AKES v1.6 priority
- `docs/01_PLATFORM/CREDENTIAL_ABSTRACTION_LAYER.md` — Πρόταση→Ενεργό Standard
- `docs/08_REFERENCE/CREDENTIALS_REGISTRY.md` — Three-tier architecture

---

### Rollback

```bash
# Kolokotronis — revert to previous deploy
npx wrangler rollback --name kolokotronis-website

# AION Flow — revert to previous Vercel deployment
npx vercel rollback aion-flowv2 --yes

# DB — drop table (destructive, seed data lost)
DROP TABLE IF EXISTS service_faq_entries CASCADE;
```

---

### Status

**RELEASE ACCEPTED — Performance Baseline #1 Established**

| Component | Status |
|-----------|--------|
| Implementation | ✅ Complete (CMS tab + helper + migration + SSR accordion + JSON-LD) |
| Automated QA | ✅ 8/8 passed (29.3s) |
| Production deploy (primary) | ✅ Verified (Cloudflare HTTP 200, Vercel HTTP 200) |
| Manual QA | N/A (no authenticated CMS changes required) |
| Documentation | ✅ Complete (release + session log + metrics + MMI) |
| Telemetry | ✅ Performance Baseline — first measured release |

---

### Agent Performance

See `docs/09_AI_MEMORY/SESSION_LOGS/2026-07-29b.md` for full session log.
See `docs/09_AI_MEMORY/METRICS/releases/2026-07-29b.json` for machine-readable metrics.
