# AION — Telemetry & Usage Events

## Philosophy

Κάθε ενέργεια χρήστη στην πλατφόρμα καταγράφεται ως event στο `usage_events` table. Αυτά τα events τροφοδοτούν:

- **Usage Dashboard** — churn risk, active days, top events
- **Platform Overview** — events today, most active tenants
- **Feature adoption** — ποια modules χρησιμοποιούνται
- **Business Insights** (future) — "ενημερώσατε 14 σελίδες την τελευταία εβδομάδα"

## Core Rule

> `trackEvent()` ΠΟΤΕ δεν πετάει exception.
> Αν αποτύχει, το σφάλμα καταγράφεται στο console μόνο.

## How to Track an Event

```typescript
import { trackEvent } from '../../lib/analytics';

// Απλό event (tenant_id auto-detected from JWT)
trackEvent('cms.service_updated', { service_title: 'Reiki', fields_changed: ['description'] });

// Event με options
trackEvent('cms.login', { session_source: 'dashboard' }, {
  userId: session.user.id,
  tenantId: jwtTenantId,    // auto-detected αν δεν δοθεί
  sessionId: createSessionId(),
  source: 'dashboard',
});
```

## Auto-Detection

Από v0.3.0, όταν `options?.tenantId` ή `options?.userId` δεν παρέχονται, το `trackEvent()` διαβάζει αυτόματα:

- `tenant_id` από `session.user.tenant_id` (JWT claim)
- `user_id` από `session.user.id`

Αυτό σημαίνει ότι απλές κλήσεις όπως `trackEvent('cms.service_updated', {...})` αποθηκεύουν σωστά το tenant_id χωρίς επιπλέον παραμέτρους.

## Event Types

### CMS Events

| Event | Metadata | Trigger |
|-------|----------|---------|
| `cms.login` | `session_source?` | Είσοδος χρήστη |
| `cms.logout` | `session_duration_seconds?` | Αποσύνδεση |
| `cms.page_created` | `page_slug` | Νέα σελίδα |
| `cms.page_updated` | `page_slug`, `fields_changed[]` | Ενημέρωση σελίδας |
| `cms.page_deleted` | `page_slug` | Διαγραφή σελίδας |
| `cms.service_created` | `service_title` | Νέα υπηρεσία |
| `cms.service_updated` | `service_title`, `fields_changed[]` | Ενημέρωση υπηρεσίας |
| `cms.service_deleted` | `service_title` | Διαγραφή υπηρεσίας |
| `cms.blog_created` | `title` | Νέο άρθρο |
| `cms.blog_updated` | `title` | Ενημέρωση άρθρου |
| `cms.blog_deleted` | `title` | Διαγραφή άρθρου |
| `cms.blog_published` | `title`, `word_count` | Δημοσίευση άρθρου |
| `cms.product_created` | `name`, `category` | Νέο προϊόν |
| `cms.product_updated` | `name`, `fields_changed[]` | Ενημέρωση προϊόντος |
| `cms.product_deleted` | `name` | Διαγραφή προϊόντος |
| `cms.media_uploaded` | `file_size`, `file_type` | Ανέβασμα αρχείου |
| `cms.media_deleted` | `count` | Διαγραφή αρχείων |
| `cms.media_replaced` | `file_size`, `file_type` | Αντικατάσταση αρχείου |

### CRM Events

| Event | Metadata | Trigger |
|-------|----------|---------|
| `crm.lead_created` | `source`, `name` | Νέο lead |
| `crm.lead_updated` | `lead_id`, `fields_changed[]` | Ενημέρωση lead |
| `crm.lead_stage_changed` | `from_stage`, `to_stage` | Μετακίνηση pipeline |
| `crm.message_sent` | `channel` | Αποστολή απάντησης |
| `crm.message_received` | `channel` | Λήψη μηνύματος |
| `crm.task_created` | `due_date?` | Νέα εργασία |
| `crm.task_completed` | `days_to_complete` | Ολοκλήρωση εργασίας |

### Platform Events

| Event | Metadata | Trigger |
|-------|----------|---------|
| `platform.backup_created` | `size_mb`, `status` | Δημιουργία backup |
| `platform.backup_restored` | `backup_name`, `tenant_name` | Επαναφορά backup |
| `platform.user_created` | `role` | Νέος χρήστης |
| `platform.user_invited` | `email`, `role` | Πρόσκληση χρήστη |
| `platform.feature_enabled` | `feature_name`, `enabled_by` | Ενεργοποίηση feature |
| `platform.tenant_created` | `tenant_name`, `industry?` | Νέος tenant |
| `platform.tenant_archived` | `tenant_name`, `reason?` | Αρχειοθέτηση tenant |
| `platform.tenant_upgraded` | `tenant_name`, `old_plan`, `new_plan` | Αλλαγή plan |
| `platform.module_installed` | `module`, `tenant_name` | Εγκατάσταση module |
| `platform.role_changed` | `user_email`, `old_role`, `new_role` | Αλλαγή ρόλου |

## Database Views

Το `usage_events` table τροφοδοτεί views που χρησιμοποιούνται από το Usage Dashboard:

```sql
-- Ενεργές ημέρες ανά tenant (μηνιαία)
v_tenant_active_days

-- Top events ανά tenant (30 days)
v_tenant_top_events

-- Churn risk analysis
v_churn_risk
```

## Adding a New Event Type

1. Πρόσθεσε το event name + metadata interface στο `UsageEventMap` στο `src/lib/analytics.ts`
2. Πρόσθεσε version number στο `EVENT_VERSIONS`
3. Χρησιμοποίησε `trackEvent('your.event', { ... })` στο σημείο ενεργοποίησης

## Testing

Το System Health cockpit (`/dashboard/settings/system`) περιλαμβάνει:
- Telemetry status (events today, last event)
- "Send Test Event" button — γράφει `platform.feature_enabled` event
- Ανάλυση analytics source (live vs mock)
