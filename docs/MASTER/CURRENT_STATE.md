# AION — Current State

> **Τι δουλεύει, τι όχι, τι έρχεται.**
> Single Source of Truth για την κατάσταση του project.

---

## ✅ Completed

### Core Infrastructure
- Authentication (Supabase Auth + email/password)
- Multi-Tenant (JWT hook + RLS + `withTenant()`)
- Supabase client + Edge Functions
- Vercel deployment (auto-deploy) + Cloudflare Workers (public sites)
- Documentation: 30+ files, MASTER overview, 30-min onboarding

### Tenant System
- `useTenant()` hook with three-tier ID system (tenantId, selectedTenantId, effectiveTenantId)
- Super Admin auto-assign (KNOWN_SUPER_ADMIN_EMAILS)
- Tenant selection screen (grid with all tenants for SA)
- TenantContext ↔ localStorage sync
- Project Switcher (TenantSelector for SA)
- Permission matrix (admin/editor/sales/viewer + SA bypass)

### CMS (Content Management)
- Services CRUD + images + icons + ordering + SEO
- Blog CRUD + featured images + categories + publish
- Products CRUD + images + categories + prices + stock
- Pages CRUD + hero images + visibility
- Media Library (upload, gallery, folder filter)
- Media Picker (inline selection from editors)
- Testimonials CRUD
- Core Values CRUD
- About Panel (hero, portrait, books)
- CTA Panel (call-to-action settings)
- Site Settings (logo, favicon, hero, colors, footer, contact, SMTP, SEO, navigation)
- SEO (meta tags, OG images, slug, `is_active` per page)

### CRM
- Inbox (split view, threading, search, compose/reply/forward)
- Pipeline (5-stage Kanban, drag & drop, inline editing, follow-ups)
- Email Workspace (Unified ComposeWindow, signatures, attachments, auto-save)
- Contact form → Edge Function → SMTP

### Platform (Super Admin)
- Platform Overview (active tenants, events today, leads, health)
- Usage Dashboard (churn risk, active days, top events)
- System Health Cockpit (Supabase, JWT, RLS, telemetry status)
- Observability (SMTP, edge functions, storage health)
- Backup System (manual/daily/weekly, edge function)
- Users Management (CRUD, roles, tenant assignment)
- Audit Dashboard (timeline, search, CSV export, restore)

### Telemetry
- 35+ event types (CMS, CRM, Platform)
- Auto-tenant detection from JWT
- `trackEvent()` never throws
- Churn detection (v_churn_risk view)
- Usage events → active days, top events, churn risk

---

## 🔄 In Progress

- Tab section for tenant content icons (per-tenant CMS overview cards)
- Gallery 2.0 (categories, filters, bulk operations)

---

## 📋 Backlog

| Feature | Priority | Target | Notes |
|---------|----------|--------|-------|
| Rich Editor inline media | Medium | v0.3 | Ενσωμάτωση MediaPicker στο TipTap |
| Bulk select/delete media | Medium | v0.3 | Gallery 2.0 |
| Image optimization (WebP, resize) | Low | v0.4 | Auto-optimize uploads |
| Usage detection for media | Low | v0.4 | Warn before delete if in-use |
| Drag & drop upload | Low | v0.4 | |
| Page Builder (drag & drop) | Low | v0.4 | |
| Theme System | Low | v0.4 | Design tokens, dark/light |
| SEO Manager (bulk, sitemap, schema) | Low | v0.4 | |
| Industry Profiles | Low | v0.4 | ADR-006 |
| Form Builder | Low | v0.4 | |
| Pipeline Automation | Low | v0.4 | Auto-move, triggers |
| Email Campaigns | Low | v0.5 | |
| Subscriptions & Billing | Low | v0.5 | Stripe |
| Public Release (v1.0) | Low | v1.0 | |

---

## 🚫 Blocked

| Item | Blocker | Notes |
|------|---------|-------|
| gmail-sync edge function | Gmail API scope | Experimental, disabled |
| SendGrid / Resend transition | SMTP limit (500/day) | Όταν χρειαστεί >500 emails/day |

---

## 🗑️ Deprecated

| Item | Αντικαταστάθηκε από | Ημερομηνία |
|------|-------------------|------------|
| `uploadImage()` (legacy) | `uploadCmsAsset()` | 2026-06-27 |
| `selectedTenantId` raw usage | `useTenant().effectiveTenantId` | 2026-07-06 |
| `refreshSession()` in useTenant | Αφαιρέθηκε | 2026-07-06 |
| Self-fix button (TenantOverview) | Auto-assign στο useTenant | 2026-07-06 |
| Mock analytics in production | Real DB queries | 2026-06-28 |
| `role` claim in JWT | `user_role` | 2026-06-10 |
