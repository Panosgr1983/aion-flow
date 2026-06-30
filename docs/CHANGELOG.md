# AION CMS — Changelog

## v0.3.1 (2026-06-29)

### Added
- **site_logo_footer**: Ξεχωριστό πεδίο για το logo του footer (ανεξάρτητο από header)
- **site_favicon**: Νέο πεδίο για favicon, με `keepFormat: true` (PNG χωρίς compression)
- **site-images bucket migration**: Δημιουργία bucket + RLS policies για storage.objects
- **Media table columns**: Προστέθηκαν `category`, `source`, `metadata`, `path`, `storage_bucket` στην production (έλειπαν από προηγούμενο migration)
- **beforeLoad prefetch**: Site_settings φορτώνονται στο SSR μέσω `queryClient.prefetchQuery` — όλα τα settings (όνομα, λογότυπο, hero κλπ) διαθέσιμα από τον server

### Changed
- **Upload system**: Αφαιρέθηκε το auto PNG→JPEG conversion για logos (site_logo, site_logo_footer, site_favicon). Οι υπόλοιπες εικόνες συνεχίζουν κανονικά.
- **Auto-save μετά από image upload**: Το logo αποθηκεύεται αμέσως μετά το upload — δε χρειάζεται ξεχωριστό Save
- **dirtyKeys tracking**: Το Save αποθηκεύει ΜΟΝΟ τις ρυθμίσεις που άλλαξαν (όχι και τα 40+ settings)
- **Parallel save**: `Promise.all` αντί για sequential loop στο handleSave

### Fixed
- **site_settings category column**: Έλειπε από production DB — το uploadCmsAsset αποτύγχανε με "Could not find the 'category' column of 'media'"
- **New settings (site_logo_footer, site_favicon)**: Δημιουργούνται INSERT αντί για UPDATE όταν δεν υπάρχουν ακόμα στη DB
- **setValue για νέα keys**: Προσθέτει entry στο local settings array ακόμα κι αν δεν υπάρχει στη DB

## v0.3.0 (2026-06-28)

### Added
- **System Health Cockpit**: `/dashboard/settings/system` — debug dashboard with Supabase, JWT, RLS, telemetry status, event count, live analytics source, one-click `trackEvent()` test
- **Platform Overview**: `/dashboard/platform` — mission control for super admin: active tenants, events today, leads, health, system status
- **Platform Events**: 6 new event types — `tenant_created`, `tenant_archived`, `tenant_upgraded`, `backup_restored`, `module_installed`, `role_changed`
- **Capability Guard**: `can()` permission layer above roles — `platform.*` capabilities blocked for non-super-admins
- **PlatformGuard**: route-level protection for all platform pages (Observability, Usage, System)
- **Platform → Workspace separation**: sidebar divided into Platform (super admin), Επιχείρηση (tenant workspace), Λογαριασμός (account settings)
- **Version bump**: 0.0.0 → 0.3.0

### Fixed
- **TrackEvent tenant_id**: auto-detected from JWT session when not explicitly provided — all CMS/CRM events now store correct tenant_id
- **AnalyticsDashboard**: hardcoded `TENANT_ID` replaced with `selectedTenantId` from tenant context
- **UsageDashboard**: now tenant-aware — filters churn risk, activity, top events by selected tenant
- **analyticsHelper.getDashboardData()**: queries real `orders`, `customers`, `order_items`, `products`, `categories`, `pageviews` instead of `mockAnalytics`
- **Sidebar**: Usage and System pages now gated to super-admin only (were accessible to any user with `users.manage`)

### Changed
- **Data Principle #1**: No production dashboard reads mock data. Mock data allowed only for demo mode, local dev, empty state placeholders, and tests.
- **Permission model**: New `can(permission, role, isSuperAdmin)` function — platform capabilities (`platform.*`) are super-admin-only; business permissions checked by role matrix

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
