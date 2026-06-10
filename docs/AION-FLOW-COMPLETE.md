# AION Flow — Πλήρης Τεκμηρίωση Πλατφόρμας

> Έκδοση: v2.0  
> Τελευταία ενημέρωση: Ιούνιος 2026  
> Τεχνολογίες: React 19, TypeScript, Vite 7, Supabase, Vercel, Cloudflare Workers

---

## Πίνακας Περιεχομένων

1. [Αρχιτεκτονική](#1-αρχιτεκτονική)
2. [Database Schema](#2-database-schema)
3. [API & Edge Functions](#3-api--edge-functions)
4. [Modules & Features](#4-modules--features)
5. [Multi-Tenant & Access Control](#5-multi-tenant--access-control)
6. [Telemetry & Usage](#6-telemetry--usage)
7. [Deployment Guide](#7-deployment-guide)
8. [User Manual](#8-user-manual)

---

## 1. Αρχιτεκτονική

### High-Level Overview

```
┌─────────────────────────────────────────┐
│            Browser (SPA)                │
│     React 19 + TanStack Router          │
│         Vercel (CDN)                    │
├─────────────────────────────────────────┤
│              Supabase                   │
│  ┌──────┬──────┬──────┬──────────────┐  │
│  │Postg │ Auth │Storage│ Edge Funcs  │  │
│  │reSQL │      │       │             │  │
│  └──────┴──────┴──────┴──────────────┘  │
├─────────────────────────────────────────┤
│         Cloudflare Workers              │
│     (Public Site - kolokotronis-website)│
├─────────────────────────────────────────┤
│              External                   │
│   SMTP (Gmail) · Sentry · GitHub CI    │
└─────────────────────────────────────────┘
```

### Layer Architecture

```
Layer 0 — CMS Engine
  ├─ Services, Blog, Products, Pages, Media, Testimonials
  ├─ Credentials, Core Values, About, CTA, Analytics
  
Layer 1 — CRM Engine
  ├─ Inbox (split view, threading, search, filters)
  ├─ Compose (New/Reply/Forward with Drafts)
  ├─ Attachments, Signatures, Auto-save
  
Layer 2 — Pipeline Engine
  ├─ Kanban (5 stages), Drag & Drop, Value editing
  ├─ Follow-Up Tasks (per lead)
  
Layer 3 — Governance
  ├─ Roles (admin/editor/sales/viewer)
  ├─ Audit Dashboard (history, diffs, restore, CSV export)
  ├─ Multi-Tenant (isolation, feature flags, JWT hooks)
  
Layer 4 — Operations
  ├─ Automated Backups (daily/weekly/manual, retention)
  ├─ Observability (SMTP, edge functions, storage health)
  ├─ Churn Detection (active days, inactivity alerts)
  ├─ Telemetry (usage_events, 20 event types)
  
Layer 5 — Platform Services
  ├─ Documentation (architecture, schema, deployment, API, manual)
```

### Project Structure

```
aion-flow-v2/
├── src/
│   ├── components/
│   │   ├── admin/        # AdminSidebar, AdminHeader
│   │   ├── dashboard/    # Overview, Services, Blog, Products, etc.
│   │   ├── inbox/        # InboxPage, ComposeWindow, ThreadView, PipelinePage
│   │   ├── settings/     # UsersManager, BackupManager, Observability, Usage
│   ├── contexts/         # AuthContext (user, session, demo mode)
│   ├── lib/
│   │   ├── supabase.ts   # Supabase client + isSupabaseAvailable()
│   │   ├── dataHelpers.ts # CRUD helpers για όλους τους πίνακες
│   │   ├── permissions.ts # Role-based permission matrix
│   │   ├── access.ts      # Feature access (canAccess, FEATURE_MODULES)
│   │   ├── analytics.ts   # Usage telemetry (trackEvent, 20 event types)
│   │   ├── useTenant.ts   # React hook που διαβάζει tenant από JWT
│   │   ├── storage.ts     # File upload/download helpers
│   │   ├── mockData.ts    # Mock data για development
│   ├── pages/            # LandingPage, LoginPage, Dashboard
│   ├── types/            # Όλοι οι TypeScript τύποι
├── supabase/
│   ├── migrations/       # 12 SQL migrations (numbered by date)
│   ├── functions/        # 3 Edge Functions
├── docs/                  # Documentation
├── .github/workflows/    # CI/CD (backup schedule, email sync)
```

---

## 2. Database Schema

### Σχέσεις Πινάκων

```
tenants
  └── profiles (tenant_id, is_super_admin, role)
  └── tenant_features (feature flags per tenant)
  └── tenant_settings (jsonb settings)
  └── site_settings (key-value per tenant)
  
contact_conversations
  └── contact_messages (conversation_id)
  └── follow_up_tasks (conversation_id)

services, blog_posts, testimonials, credentials, core_values
  └── site_settings (meta data)

email_drafts (ανεξάρτητος πίνακας)

usage_events (τηλεμετρία)

content_history + content_backups (versioning)
backup_jobs (ιστορικό backup)
```

### Πίνακες (Σύνοψη)

| Πίνακας | Σκοπός | Βασικά Πεδία |
|----------|--------|--------------|
| `tenants` | Multi-tenant οργάνωση | id, name, slug, status, plan_name, industry |
| `profiles` | Χρήστες + roles | id, email, role, is_super_admin, tenant_id |
| `tenant_features` | Feature flags ανά tenant | tenant_id, feature, enabled |
| `contact_conversations` | Threads email/CRM | email, name, status, lead_stage, deleted_at |
| `contact_messages` | Μηνύματα (in/out) | conversation_id, direction, status, is_starred |
| `usage_events` | Τηλεμετρία | tenant_id, event_name, source, metadata |
| `content_history` | Audit log | table_name, operation, snapshot_before/after |
| `content_backups` | Snapshots | name, snapshot (jsonb), size_bytes |
| `backup_jobs` | Ιστορικό backups | type, status, backup_id |
| `email_drafts` | Προσχέδια email | to, subject, body, status, scheduled_at |

---

## 3. API & Edge Functions

### 3.1 Edge: send-contact-email

`POST /functions/v1/send-contact-email`

Αποστολή email μέσω SMTP (Gmail). Υποστηρίζει 3 τύπους:

- **new** — Νέο μήνυμα από contact form (notification στον admin)
- **reply** — Απάντηση από Inbox (BCC στον admin για Gmail sync)
- **forward** — Προώθηση μηνύματος

```
Request:  { type, name, email, to, subject, message, attachments? }
Response: { ok: true } | { error: "..." }
```

### 3.2 Edge: crm-backup

`POST /functions/v1/crm-backup`

Δημιουργεί full snapshot όλων των πινάκων (services, blog, κλπ).

```
Request:  { type: "manual" | "daily" | "weekly" }
Response: { ok: true, backup_id, size }
```

### 3.3 Edge: gmail-sync (experimental)

`GET|POST /functions/v1/gmail-sync`

Σύνδεση με Gmail API για αμφίδρομο sync. Προς το παρόν disabled.

### 3.4 Client Helpers (dataHelpers.ts)

```
conversationsHelper   → CRUD + softDelete + getTrash + getUnreadCount
contactMessagesHelper → CRUD + getByConversation + reply + markRead + archive
draftsHelper          → CRUD + getDrafts + getScheduled + save
crmHealthHelper       → getStatus (SMTP, sync, storage, edge functions)
crmMetricsHelper      → getMetrics (leads, pipeline value, conversion)
monitoringHelper      → getStatus (errors, SMTP stats, edge function runs)
```

---

## 4. Modules & Features

### 4.1 CMS (Content Management)

| Module | Περιγραφή | CRUD |
|--------|-----------|------|
| Services | Υπηρεσίες με εικόνες, περιγραφές, SEO | ✅ |
| Blog | Άρθρα με TipTap editor, κατηγορίες, publish | ✅ |
| Products | Βιβλία/Προϊόντα με τιμές, εικόνες, απόθεμα | ✅ |
| Pages | Διαχείριση σελίδων, visibility, hero images | ✅ |
| Media | Βιβλιοθήκη πολυμέσων (upload, folders) | ✅ |
| Testimonials | Κριτικές πελατών | ✅ |
| Credentials | Πιστοποιήσεις | ✅ |
| Core Values | Αξίες επιχείρησης | ✅ |
| Site Settings | Key-value ρυθμίσεις, SMTP, SEO, navigation | ✅ |

### 4.2 CRM Inbox

```
┌──────────────────────────────────────────────┐
│ Folders: Inbox │ Sent │ Drafts │ Archive │ Trash │
├────────────────┬─────────────────────────────┤
│ Conversation   │ Thread View                 │
│ List           │  ┌─ Conversation Header ──┐ │
│                │  │ Name, Email, Phone     │ │
│ [Search]       │  │ Status, Last Activity  │ │
│ [Select all]   │  └────────────────────────┘ │
│                │  Message A (incoming)       │
│ ○ Maria        │  Message B (outgoing)       │
│ ○ Giorgos      │  Message C (incoming)       │
│                │  ┌─ Reply Editor ────────┐  │
│                │  │ [Compose area]  [Send]│  │
│                │  └────────────────────────┘  │
└────────────────┴─────────────────────────────┘
```

**Λειτουργίες:**
- Split view (list + thread)
- Search (full-text Greek + English)
- Filters (All, New, Replied, Archived)
- Bulk selection + archive/delete
- Auto-save drafts (κάθε 3 sec)
- Email signature (από Site Settings)
- Rich editor (Bold/Italic/Link)
- Attachments (upload σε Supabase Storage)
- Keyboard shortcuts (j/k navigate, c compose, r reply)

### 4.3 Pipeline

```
New → Contacted → Proposal → Won → Lost
```

**Λειτουργίες:**
- Drag & Drop μεταξύ stages
- Advance button ("Μετακίνηση σε...")
- Lead value editing (inline click)
- Follow-Up Tasks (checklist per lead)
- Pipeline metrics (total, open, won, value)
- Inbox link (άνοιγμα conversation από το lead)

### 4.4 Audit Dashboard

- Timeline view με όλες τις αλλαγές
- Diff view (before/after ανά πεδίο)
- Restore από ιστορικό
- Filters (πίνακας, operation, χρήστης)
- Search (summary, entity name)
- CSV export
- Backup management (create, view history)

### 4.5 Backups

| Τύπος | Δημιουργία | Διατήρηση |
|-------|------------|-----------|
| Manual | Χειροκίνητα από UI | Forever |
| Daily | GitHub Actions @ 3AM | 30 ημέρες |
| Weekly | GitHub Actions @ Sunday 3AM | 12 εβδομάδες |

### 4.6 Observability

- Frontend errors (Sentry integration)
- SMTP metrics (emails sent/failed)
- Edge function status (last run, duration)
- Storage file count
- Overall health indicator (green/amber/red)

---

## 5. Multi-Tenant & Access Control

### Ιεραρχία

```
Super Admin (is_super_admin=true)
  ├─ Βλέπει όλους τους tenants
  ├─ Πλήρης πρόσβαση σε όλα
  └─ Platform tools: Users, Backups, Observability, Usage
  
Tenant User
  ├─ Βλέπει μόνο τον tenant του
  ├─ Feature flags: tenant_features
  └─ Role-based: admin / editor / sales / viewer
```

### JWT Claims Hook

Custom access token hook που injects στο JWT:

```json
{
  "tenant_id": "uuid",
  "role": "editor",
  "is_super_admin": false
}
```

Αυτό ξεκλειδώνει:
- RLS policies (SELECT/INSERT με `current_tenant_id()`)
- Feature checks (`is_super_admin()`)
- Ταχύτερα queries (χωρίς DB lookup)

### Permission Chain

```
is_super_admin=true → Full access
  ↓ false
tenant.status = suspended/cancelled → Block all
  ↓ active/trial
canAccess(feature) → Feature από tenant_features
  ↓ true
hasPermission(role, action) → CRUD rights
```

---

## 6. Telemetry & Usage

### Usage Events (20 types)

```
CMS:
  cms.login / cms.logout
  cms.page_updated / cms.service_created / cms.service_updated
  cms.service_deleted / cms.blog_created / cms.blog_updated
  cms.blog_published / cms.media_uploaded

CRM:
  crm.lead_created / crm.lead_stage_changed
  crm.message_sent / crm.message_received
  crm.task_created / crm.task_completed

Platform:
  platform.backup_created / platform.user_created
  platform.feature_enabled
```

### Churn Detection

```
v_churn_risk:
  last_activity → days_since_last_activity
  0-7 days:   🟢 Healthy
  7-14 days:  🟡 Attention
  14-21 days: 🟠 Warning (alert)
  21+ days:   🔴 Critical (alert)
  no data:    ⚪ Inactive
```

### Usage Dashboard (Super Admin)

- Summary cards (tenants, events, healthy, at risk)
- Churn Risk table per tenant
- Early Warning Alerts (≥14 days inactive)
- Tenant Activity (active days per month)
- Top Events (30-day ranking)

---

## 7. Deployment Guide

### Απαιτήσεις

- Node.js 20+
- Λογαριασμός Supabase (free tier)
- Λογαριασμός Vercel (hobby tier)
- SMTP credentials (Gmail App Password)
- GitHub account (για scheduled backups)

### Βήματα

```bash
# 1. Clone
git clone <repo> aion-flow && cd aion-flow
npm install

# 2. Δημιουργία .env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
TENANT_ID=00000000-0000-0000-0000-000000000001
DATABASE_PASSWORD=...

# 3. Run migrations (12 αρχεία σε σειρά)
#    Από Supabase Dashboard → SQL Editor

# 4. Deploy Edge Functions
SUPABASE_ACCESS_TOKEN=sbp_... supabase functions deploy

# 5. Deploy Frontend
npm run build && npx vercel --prod

# 6. Ρύθμιση SMTP (από CMS → Site Settings → Επικοινωνία)

# 7. Ενεργοποίηση JWT Hook
#    Supabase Dashboard → Auth → Hooks → Access Token Hook
#    URI: pg-functions://postgres/public/custom_access_token_hook
```

### GitHub Actions Secrets

| Secret | Τιμή |
|--------|------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |

---

## 8. User Manual

### 8.1 Σύνδεση

1. Πήγαινε `https://aion-flowv2.vercel.app`
2. Κάνε login με τα διαπιστευτήρια σου
3. Αν είναι demo: `demo@aionflow.gr / demo123`

### 8.2 Inbox

```
Εισερχόμενα:  Όλες οι συνομιλίες
Απεσταλμένα:  Συνομιλίες με outgoing messages
Προσχέδια:    Αποθηκευμένα drafts
Αρχείο:       Αρχειοθετημένες συνομιλίες
Κάδος:        Διαγραμμένες (soft delete, επαναφορά)

Νέο Email:   Κουμπί + πάνω αριστερά
Απάντηση:    Κουμπί r ή κλικ στο Reply μέσα στο thread
Προώθηση:    Forward με quoted original
Delete:      Hover → κάδος ή bulk selection
Archive:     Hover → archive ή bulk
Search:      Πλήρες κείμενο (όνομα, email, μήνυμα)
```

### 8.3 Pipeline

```
Βασική ροή: Νέο → Επικοινωνία → Προσφορά → Κερδισμένο / Χαμένο
Μετακίνηση: Drag & Drop ή κουμπί "Μετακίνηση σε..."
Αξία:       Κάνε κλικ στην τιμή για inline edit
Tasks:      Πρόσθεσε follow-up tasks στο card
Inbox:      Κλικ στο εικονίδιο chat → άνοιγμα συνομιλίας
```

### 8.4 Keyboard Shortcuts

| Shortcut | Ενέργεια |
|----------|----------|
| `j` / `k` | Επόμενη / Προηγούμενη συνομιλία |
| `c` | Νέο Email (Compose) |
| `r` | Απάντηση (Reply) |

### 8.5 Roles

| Role | Πρόσβαση |
|------|-----------|
| Super Admin | Όλα |
| Admin | Πλήρης πρόσβαση στον tenant τους |
| Editor | CMS content only |
| Sales | CRM, Pipeline, Tasks |
| Viewer | Read only |

### 8.6 Users

Διαχείριση στο `Settings → Χρήστες`:
- Λίστα όλων των χρηστών
- Αλλαγή role
- Toggle super admin
- Αντιστοίχηση σε tenant

### 8.7 Backups

Δημιουργία: `Settings → Backup`
- Manual backup (άμεσο)
- Ιστορικό backups με status/size/duration
- Auto-cleanup (30 days daily, 12 weeks weekly)

### 8.8 Usage & Churn

`Settings → Usage` (Super Admin only)
- Active days ανά tenant
- Churn risk levels
- Early warning alerts
- Top events

---

## Χρονολόγιο Ανάπτυξης

```
Απρ 2026  → CMS Foundation (services, blog, products, pages)
Μαϊ 2026  → CRM Inbox + Pipeline + Tasks
Μαϊ 2026  → Governance (roles, audit, history)
Ιουν 2026 → Operations (backups, observability, docs)
Ιουν 2026 → Email Workspace (compose, drafts, signatures)
Ιουν 2026 → Multi-Tenant (JWT hook, feature flags, tenant isolation)
Ιουν 2026 → Telemetry + Churn Detection (usage_events, churn risk)
Ιουν 2026 → Observation Period (60-90 days data collection)
```

---

## Τεχνικά Χρέη & Backlog

| Θέμα | Προτεραιότητα | Σημειώσεις |
|------|--------------|------------|
| Tenant Role (owner/member) | Μεσαία | Μετά observation period |
| Usage events instrumentation (wave 2) | Χαμηλή | cms.page_updated, cms.task_completed |
| Support Load Report | Μεσαία | Μέτρηση χρόνου ανά πελάτη |
| Last Human Contact field | Χαμηλή | Backlog |
| Industry-specific insights | Χαμηλή | Θέλει ≥20 tenants |
| Tenant audit log | Χαμηλή | Μετά multi-tenant stabilization |

---

> *Το AION Flow δεν είναι απλώς μια πλατφόρμα CMS/CRM.  
> Είναι ένα Customer Operating System που εξελίσσεται με κάθε νέο πελάτη.  
> Κάθε feature χτίζεται μία φορά και αποσβένεται σε όλους.  
> Αυτό είναι το πραγματικό asset.*
