# AION CMS — Roadmap

## v0.1 "Foundation" ✅

Κατάσταση: **Σε λειτουργία**

- [x] Authentication & User Management
- [x] Multi-Tenant foundation
- [x] Basic CMS (Services, Blog, Products, Pages)
- [x] Site Settings (hero, colors, footer, logo, contact)
- [x] Media Library (βασικό upload/gallery)
- [x] CRM Inbox (split view, threading, search)
- [x] Leads Pipeline (5-stage Kanban, drag & drop)
- [x] Email Workspace (compose, drafts, signatures)
- [x] Usage Dashboard (churn risk, active days, top events)
- [x] Audit Dashboard (timeline, search, CSV export)
- [x] Backup System (manual/daily/weekly, edge function)
- [x] JWT Hook + RLS + withTenant() helper
- [x] Editor Role (full CMS access, no is_super_admin)

---

## v0.2 "Media Manager" 🔜

Επόμενο release

- [ ] Νέο media architecture (storage.ts → media.ts → uploadCmsAsset)
- [ ] Gallery με categories και filters
- [ ] Media metadata (tenant, category, source, tags)
- [ ] Inline-content filtering
- [ ] Drag & drop upload
- [ ] Bulk delete/select
- [ ] Image optimization (auto-resize, WebP)

---

## v0.3 "Website Builder"

- [ ] Page Builder (drag & drop sections)
- [ ] Theme system (color palettes, fonts, spacing)
- [ ] Custom CSS/JS per tenant
- [ ] SEO Manager (meta tags, OG images, sitemap)
- [ ] Form Builder (contact, booking, newsletter)

---

## v0.4 "CRM Pro"

- [ ] Email campaigns (mass send, templates)
- [ ] Email accounts management (IMAP sync)
- [ ] Pipeline automation (auto-move leads, triggers)
- [ ] Kanban with swimlanes
- [ ] Reporting (pipeline velocity, win rate, forecast)

---

## v0.5 "Subscriptions & Billing"

- [ ] Subscription management
- [ ] Usage-based billing
- [ ] Invoice generation
- [ ] Payment gateway integration (Stripe)
- [ ] Feature tiers (free, pro, enterprise)

---

## v1.0 "Public Release"

- [ ] Documentation complete
- [ ] Load testing (>1000 concurrent users)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Public documentation site
- [ ] Onboarding flow
