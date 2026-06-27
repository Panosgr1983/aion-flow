# AION CMS — Feature Catalog

Κατάλογος όλων των δυνατοτήτων του AION CMS με status ανάπτυξης.

## Status Labels

| Label | Meaning |
|-------|---------|
| ✅ Stable | Production-ready, fully tested |
| 🔬 Beta | Λειτουργεί, αλλά υπό παρακολούθηση |
| 🧪 Experimental | Δοκιμαστικό, μη σταθερό API |
| ⏳ Planned | Σχεδιασμένο για επόμενο release |
| 💤 Deprecated | Δεν αναπτύσσεται περαιτέρω |

---

## Core Platform

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication (Supabase Auth) | ✅ Stable | Email/password + JWT hook |
| Multi-Tenant | ✅ Stable | JWT hook + RLS + withTenant() |
| User Roles | ✅ Stable | admin, editor, sales, viewer |
| Super Admin Bypass | ✅ Stable | is_super_admin flag |
| Feature Flags | ✅ Stable | tenant_features table |
| Audit Log | ✅ Stable | content_history + restore |
| Error Boundary | ✅ Stable | Per-component error catching |
| Telemetry | ✅ Stable | 20 event types via analytics.ts |
| Usage Dashboard | ✅ Stable | Churn risk, active days, top events |

## CMS

| Feature | Status | Notes |
|---------|--------|-------|
| Services Editor | ✅ Stable | CRUD + image + SEO |
| Blog Posts Editor | ✅ Stable | TipTap editor + OG images |
| Products Editor | ✅ Stable | Image + book sync |
| Pages Editor | ✅ Stable | Hero image per page |
| About Panel | ✅ Stable | Bio, portrait, books |
| Testimonials | ✅ Stable | CRUD |
| Credentials | ✅ Stable | CRUD |
| Core Values | ✅ Stable | CRUD |
| Site Settings | ✅ Stable | Hero, colors, footer, SEO |
| Media Library | 🔬 Beta | Upload/gallery/filter — needs asset management refactor |

## CRM

| Feature | Status | Notes |
|---------|--------|-------|
| Inbox (split view) | ✅ Stable | Threading, search, filters |
| Compose Window | ✅ Stable | Reply/forward, signatures, attachments |
| Drafts | ✅ Stable | Auto-save 3s |
| Sent / Archive / Trash | ✅ Stable | Full folder system |
| Leads Pipeline | ✅ Stable | 5-stage Kanban, drag & drop |
| Follow-up Tasks | ✅ Stable | Per-lead task management |

## Email Workspace

| Feature | Status | Notes |
|---------|--------|-------|
| Unified Compose | ✅ Stable | New/reply/forward/draft |
| Attachments | ✅ Stable | Upload to contact-attachments |
| Signatures | ✅ Stable | Per-user signatures |
| Auto-save Drafts | ✅ Stable | 3-second debounce |
| Cc/Bcc | ✅ Stable | Multi-recipient |
| Email Accounts | 🔬 Beta | IMAP sync (experimental) |

## Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| Supabase Database | ✅ Stable | PostgreSQL 17 |
| Supabase Auth | ✅ Stable | JWT + RLS |
| Supabase Storage | ✅ Stable | S3-compatible |
| Edge Functions | ✅ Stable | send-contact-email, crm-backup |
| Backup System | ✅ Stable | Manual/daily/weekly, retention |
| JWT Hook | ✅ Stable | Custom claims (user_role, is_super_admin) |
| Git Flow | ✅ Stable | main → develop → release branches |
| Dev Environment | ✅ Stable | Separate Supabase project |
| Documentation | ✅ Stable | /docs directory with 14 files |

## Planned (v0.2+)

| Feature | Status | Version |
|---------|--------|---------|
| Asset Management (Media Refactor) | ⏳ Planned | v0.2 |
| Gallery + Categories | ⏳ Planned | v0.2 |
| Safe Delete (usage detection) | ⏳ Planned | v0.2 |
| Replace Asset | ⏳ Planned | v0.2 |
| Asset Search | ⏳ Planned | v0.2 |
| Image Optimization (WebP) | ⏳ Planned | v0.3 |
| AI Alt Text Generation | ⏳ Planned | v0.3 |
| Video Support | ⏳ Planned | v0.3 |
| PDF / Document Support | ⏳ Planned | v0.3 |
| Page Builder | ⏳ Planned | v0.3 |
| Theme System | ⏳ Planned | v0.3 |
| SEO Manager | ⏳ Planned | v0.3 |
| Form Builder | ⏳ Planned | v0.3 |
| Email Campaigns | ⏳ Planned | v0.4 |
| Pipeline Automation | ⏳ Planned | v0.4 |
| Subscriptions & Billing | ⏳ Planned | v0.5 |
| Public Release (v1.0) | ⏳ Planned | v1.0 |
