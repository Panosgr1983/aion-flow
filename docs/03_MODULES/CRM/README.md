# CRM Module — AION Flow

**Module Name:** crm
**Feature Flag:** `crm`
**Status:** Stable (v1.0)

---

## Overview

Το CRM Module παρέχει Inbox (contact messages), Pipeline (lead kanban) και Email Workspace.

## Sub-modules

| Sub-module | Route | Panel |
|------------|-------|-------|
| Inbox | `/dashboard/inbox` | InboxPage |
| Pipeline | `/dashboard/pipeline` | PipelinePage |
| Email Workspace | `/dashboard/inbox` (compose) | ComposeWindow |

## Database Tables

### contact_conversations

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants |
| `email` | TEXT | |
| `name` | TEXT | |
| `status` | TEXT | new, active, waiting, closed |
| `lead_stage` | TEXT | qualification, meeting, proposal, negotiation, won, lost |
| `deleted_at` | TIMESTAMPTZ | Soft delete |

### contact_messages

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `conversation_id` | UUID | FK → conversations |
| `name` | TEXT | |
| `email` | TEXT | |
| `subject` | TEXT | |
| `message` | TEXT | |
| `direction` | TEXT | incoming, outgoing |
| `status` | TEXT | new, read, replied |

## Tenant Isolation

🔴 **BLOCKED** — CRM helpers currently have NO tenant isolation. All queries return data across ALL tenants.

See `01_PLATFORM/TECH_DEBT.md` #20 and `01_PLATFORM/KNOWN_ISSUES.md` #16.

**This module CANNOT be enabled for a 2nd tenant until tenant isolation audit passes.**
