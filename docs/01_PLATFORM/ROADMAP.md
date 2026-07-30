# AION — Roadmap

> **Πού είμαστε, πού πάμε.**
> Τελευταία ενημέρωση: 2026-07-06

---

## ✅ v0.1 "Foundation" — Ολοκληρωμένο

- Authentication & User Management
- Multi-Tenant foundation (JWT hook + RLS + withTenant())
- CMS (Services, Blog, Products, Pages, Media)
- Site Settings (hero, colors, footer, logo, contact, SMTP, SEO, navigation)
- CRM Inbox (split view, threading, search, compose/reply/forward, drafts)
- Leads Pipeline (5-stage Kanban, drag & drop, inline editing)
- Email Workspace (compose, drafts, signatures, attachments, auto-save)
- Usage Dashboard (churn risk, active days, top events)
- Audit Dashboard (timeline, search, CSV export, restore)
- Backup System (manual/daily/weekly, edge function)
- Profile, Testimonials, Credentials, Core Values, About, CTA

---

## ✅ v0.2 "Media Manager" — Ολοκληρωμένο

- uploadCmsAsset() (tenant-aware, metadata, telemetry)
- Media metadata (category, source, tags, path, storage_bucket)
- Gallery with filters (by category, source, tenant)
- MediaPicker (inline selection from editors)
- Documentation overhaul
- 3-level upload pipeline (storage.ts → media.ts → uploadCmsAsset)

---

## ✅ v0.3 "Platform" — Ολοκληρωμένο (κύρια)

- [x] Platform Overview (active tenants, events today, leads, health)
- [x] super admin console (capability guard, PlatformGuard, sidebar separation)
- [x] System Health Cockpit (Supabase, JWT, RLS, telemetry)
- [x] Observability (SMTP, edge functions, storage health)
- [x] Telemetry auto-detection (tenant_id from JWT)
- [x] Churn Detection (v_churn_risk view)
- [x] Platform events (6 types)
- [x] `can()` capability guard
- [x] Single Source of Truth (no mock data in production)
- [x] `effectiveTenantId` + three-tier tenant system
- [x] Super Admin auto-assign (KNOWN_SUPER_ADMIN_EMAILS)
- [x] Clear tenant selection on login
- [x] docs MASTER overhaul + permission matrix + project memory

---

## 🔜 v0.3.3 "Tenant Content Tabs"

- [ ] Tab section per tenant με CMS content icons (Kolokotronis homepage-style)
- [ ] Gallery 2.0 (categories, filters, bulk operations)

---

## 🔄 v0.4 "Website Builder" (planned)

- Page Builder (drag & drop sections)
- Theme system (color palettes, fonts, spacing)
- SEO Manager (bulk editor, sitemap, schema)
- Form Builder (contact, booking, newsletter)
- Industry Profiles (ADR-006)
- Image optimization (auto-resize, WebP)

---

## 🔄 v0.5 "CRM Pro" (planned)

- Email campaigns (mass send, templates)
- Pipeline automation (auto-move leads, triggers)
- Reporting (pipeline velocity, win rate, forecast)
- Drag & drop media upload
- Usage detection (warn before media delete)

---

## 🔄 v0.6 "Subscriptions & Billing" (planned)

- Subscription management
- Usage-based billing
- Invoice generation
- Payment gateway (Stripe)
- Feature tiers (free, pro, enterprise)

---

## 🔄 v1.0 "Public Release" (future)

- Documentation complete
- Load testing (>1000 concurrent users)
- Performance optimization
- Security audit
- Public documentation site
- Onboarding flow

---

## ✅ v0.4 "Portfolio Module" (Completed)

- [x] Documentation Update Pass (all 10 docs)
- [x] Portfolio Module v0.1 — read-only CMS shell
- [x] Module Registry system (self-registering modules)
- [x] Module Manifest pattern (routes, sidebar, permissions in single file)
- [x] docs/patterns/ — 12 reusable architectural patterns
- [x] ADR-012: Documentation-First Architecture Rule
- [x] ADR-013: Module Registry System
- [x] New DB migrations (8 portfolio tables)
- [x] media table extension (media_type column)
- [x] Feature flag: portfolio_module (artist_module kept for backward compat)
- [x] Portfolio CMS panels (read-only, via registry)
- [x] Architecture Refactor Pass (v0.15): Artist → Portfolio

---

## 🔜 v0.5 "Portfolio CRUD" (Current — Planning Complete)

**Rule:** No panel complete without docs update.

### Sequence (one panel at a time)

- [x] **Panel 1: Biography CRUD** — RichEditor + MediaPicker + upsert + history
- [x] **Panel 2: Filmography CRUD** — entries CRUD + media + sorting + history
- [x] **Panel 3: Television CRUD** — (same pattern as Filmography)
- [x] **Panel 4: Theatre CRUD** — (same pattern as Filmography)
- [x] **Panel 5: Timeline CRUD** — categories, year/month, sort_order, history
- [x] **Panel 6: Gallery CRUD** — grid, lightbox, metadata, MediaPicker, history
- [x] **Panel 7: Press CRUD** — full fields, body, featured, MediaPicker, history
- [x] **Panel 8: Showreels CRUD** — video URL, platform, duration, thumbnail, status, history

### Per-panel deliverables

```
code + migration (if needed) + QA + docs update + commit
```

### v0.5 CRUD Plan documented at:
`docs/modules/portfolio/INTEGRATION_PLAN.md` — full field specs, components, validation, permissions, history logging, MediaPicker/RichEditor integration per panel.

---

## 🔜 v0.6 "Retreat Module" (Current — Planning Phase)

- [x] **Tenant + Data Setup** — Ktima Kareli created (tenant ID a6a0e182...)
- [x] **Experiences CRUD** — activities, durations, levels, includes list, image, history
- [x] **Workshops CRUD** — group sessions (same pattern as Experiences)
- [x] **Events CRUD** — bilingual GR/EN, date, organizer, capacity, price
- [x] **FAQ CRUD** — simple Q&A management
- [x] **Bookings Manager** — submission pipeline (form → DB → email → manage)
- [ ] **Gallery reuse** — same GalleryCRUD from Portfolio
- [x] **Public site migration** — Supabase client, BookingForm, all pages read from DB with fallback
- [ ] **Label mapping** — client-facing names for all panels
- [ ] **Reports** — week-01 through week-04

---

## 🔜 v0.7 "Locale Module" (Planned)

- [ ] **locale_translations table** — key → value_el/value_en
- [ ] **Translations Editor panel** — searchable key-value CRUD
- [ ] **Public site locale toggle** — localStorage-persisted GR/EN
- [ ] **locale columns** on content tables (as needed)
- [ ] **Import 101 translation keys** from existing ktima-kareli translations.ts
- [ ] **Archive hardcoded translations** — replace with Supabase reads
- [ ] **Feature flag: locale_module** — default false, gated per tenant

---

## 🔜 v0.8 "Platform Hardening" (Planned)

- Performance optimization (bundle splitting, lazy loading)
- Security audit (RLS, permissions, JWT claims)
- Automated testing (unit, integration, E2E)
- Accessibility audit (WCAG)
- Backup & restore validation
- Error boundaries across all panels
- Accessibility: skip links, aria labels, keyboard nav
- Documentation consistency audit

---

## 🔜 AKES v1.1 — Governance Hardening (Next — Q3 2026)

### Scope
Όχι documentation expansion. Μόνο hardening και automation.

### Checklist
- [ ] `docs:check` stable (runs on every PR)
- [ ] Link validation (all cross-references verified)
- [ ] Source-of-truth validation (no duplicate SoTs)
- [ ] Secret scanning (pre-commit hook)
- [ ] TENANT_ISOLATION_CHECKLIST in PR workflow
- [ ] Session close discipline (update CURRENT_STATE + NEXT_ACTION on every close)
- [ ] Blockers enforcement (CRM + E-commerce remain locked)
- [ ] Documentation health report (coverage %, orphaned docs, stale reviews)

---

## 🔜 AKES v1.5 — CLI & Automation (Future)

- `akes validate` — run all checks in one command
- `akes check <module>` — tenant isolation report per module
- `akes score` — engineering maturity score
- CI integration for pre-merge validation
- Pre-commit hooks for documentation integrity

---

## 🔄 AKES v2 — Intelligence Layer (Future)

**Precondition:** 10-20 active tenants with validated methods data.

### Components (design only — not yet implemented)

| Component | Description |
|-----------|-------------|
| **Reuse Analytics** | Track which modules/components are used by which tenants. Calculate reuse score per module. |
| **Method Confidence** | Track how many times a method has been used vs regression count. Confidence score = (uses - regressions) / uses. |
| **Documentation Coverage** | Auto-calculated % of documented vs undocumented modules/methods. |
| **Platform Health** | Self-assessment dashboard for AKES itself. |
| **Engineering KPIs** | Reusable %, avg completion time, avg deploy time, regression rate. |
| **AI Confidence** | Agent can answer: "Have I done this before?" with confidence score and recommended approach. |

### Architecture

```
AIONCLAW (Engineering Intelligence)
  └── reads / evaluates
        AKES (Knowledge & Engineering System)
              └── documents / organizes
                    AION FLOW (Business Operating System)
```

### Prerequisites
- [ ] 10+ tenants with completed content mapping
- [ ] 20+ validated methods
- [ ] 500+ documented decisions/lessons
- [ ] Reusable components registry populated
- [ ] All panels pass TENANT_ISOLATION_CHECKLIST

---

### Next Phase (Jul 2026+)

| Priority | Track | Status |
|----------|-------|--------|
| 1 | **Content Health Check** — post-deploy safety net scanning for raw JSON, `type`/`doc`/`content` leakage. Automated after every deploy. | 📋 Planned |
| 2 | **Release Engineering** — Dev → Preview → QA → Smoke → Health Check → Production pipeline with gates | 📋 Planned |
| 3 | **Content Engine Phases 1-6** — unified content pipeline with registry, normalizer, serialization, validation | 📋 Planned (see `CONTENT_ENGINE.md`) |

**Principle:** *Architecture follows evidence, not speculation.* Each track starts only when a real production need justifies it.
