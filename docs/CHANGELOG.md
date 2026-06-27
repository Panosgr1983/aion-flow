# AION CMS — Changelog

## v0.1.0 (2026-06-27)

### Added
- **Authentication**: Supabase Auth + Custom JWT Hook
- **Multi-Tenant**: JWT hook with `user_role` + `is_super_admin` claims
- **CMS**: Services, Blog, Products, Pages editors
- **Media Library**: Upload, gallery, folder filter
- **Site Settings**: Hero, colors, footer (branding + contact + nav), logo, SEO
- **About Panel**: Hero, portrait, books
- **CRM Inbox**: Split view, threading, search, compose/reply/forward, drafts/sent/trash/archive
- **Pipeline**: 5-stage Kanban, drag & drop, inline editing, follow-ups
- **Email Workspace**: Unified ComposeWindow, signatures, attachments, auto-save
- **Usage Dashboard**: Churn risk, active days, top events per tenant
- **Audit Dashboard**: Timeline, search, CSV export, restore
- **Backup System**: Edge function, manual/daily/weekly, 30d retention
- **Roles**: admin, editor, sales, viewer + is_super_admin bypass
- **Telemetry**: 20 event types via `analytics.ts`

### Fixed
- **CRITICAL**: JWT hook was overriding `role: "authenticated"` with custom role
  → Renamed to `user_role` (migration `20260610000014_fix_jwt_role_claim.sql`)
- Auto-create profiles on signup (trigger `handle_new_user`)
- useTenant hook: JWT fallback + DB fetch + auto-upsert

### Changed
- SiteSettings: Dedicated Footer tab (branding, contact, navigation)
- SiteHeader/Footer: Logo image support (fallback to monogram)
- Email display in public site footer
- Migration `20260610000013_auto_create_profiles.sql`: seed profiles + site_logo setting

### Infrastructure
- Cloudflare Worker deployment for public sites
- Dual Supabase environment (Production + Dev)
- Feature branch development flow
