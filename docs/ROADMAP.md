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
- [ ] **Panel 5: Timeline CRUD** — category + drag & drop
- [ ] **Panel 3: Timeline CRUD** — category + drag & drop
- [ ] **Panel 4: Gallery CRUD** — media linking + metadata editor
- [ ] **Panel 5: Television CRUD** — simple CRUD (same pattern)
- [ ] **Panel 6: Theatre CRUD** — simple CRUD (same pattern)
- [ ] **Panel 7: Press CRUD** — minimal fields
- [ ] **Panel 8: Showreels CRUD** — minimal fields

### Per-panel deliverables

```
code + migration (if needed) + QA + docs update + commit
```

### v0.5 CRUD Plan documented at:
`docs/modules/portfolio/INTEGRATION_PLAN.md` — full field specs, components, validation, permissions, history logging, MediaPicker/RichEditor integration per panel.

---

## 🔄 v0.6 "Website Builder" (planned)

- Page Builder (drag & drop sections)
- Theme system (color palettes, fonts, spacing)
- SEO Manager (bulk editor, sitemap, schema)
- Form Builder (contact, booking, newsletter)
- Industry Profiles (ADR-006)
- Image optimization (auto-resize, WebP)

---

## 🔄 v0.7 "Platform Scale" (planned)

- Email campaigns (mass send, templates)
- Pipeline automation (auto-move leads, triggers)
- Reporting (pipeline velocity, win rate, forecast)
- Drag & drop media upload
- Usage detection (warn before media delete)
