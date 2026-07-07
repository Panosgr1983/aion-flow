# AION Flow — API & Edge Function Reference

## Overview

AION Flow uses Supabase as its backend. All CRUD operations go directly from the browser to Supabase REST API (via the `supabase-js` client). Edge Functions handle SMTP email delivery and automated backups.

---

## Edge Function: `send-contact-email`

**Endpoint:** `POST /functions/v1/send-contact-email`

**Authentication:** Anon key (no JWT verification)

### Payload

```json
{
  "type": "new | reply | forward",
  "name": "string (required for type=new)",
  "email": "string (required for type=new,reply)",
  "phone": "string (optional)",
  "to": "string (required for type=reply,forward)",
  "subject": "string",
  "message": "string (required)",
  "originalMessage": "string (required for type=forward)",
  "attachments": [
    {
      "name": "filename.pdf",
      "url": "https://storage.supabase.co/...",
      "size": 240000,
      "mime_type": "application/pdf"
    }
  ]
}
```

### Responses

```json
// 200 Success
{ "ok": true }

// 400 Configuration error
{ "error": "SMTP not configured" }

// 500 Internal error
{ "error": "Connection refused..." }
```

### Examples

**New contact form notification:**
```bash
curl -X POST "https://abc.supabase.co/functions/v1/send-contact-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "type": "new",
    "name": "Μαρία Παπαδοπούλου",
    "email": "maria@example.com",
    "phone": "+30 697 123 4567",
    "message": "Ενδιαφέρομαι για σεμινάριο Reiki"
  }'
```

**Reply from inbox:**
```bash
curl -X POST "https://abc.supabase.co/functions/v1/send-contact-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "type": "reply",
    "to": "maria@example.com",
    "subject": "Re: Ενδιαφέρον για σεμινάριο Reiki",
    "message": "Αγαπητή Μαρία, το επόμενο σεμινάριο ξεκινά στις 15 Ιουλίου.",
    "email": "maria@example.com"
  }'
```

---

## Edge Function: `crm-backup`

**Endpoint:** `POST /functions/v1/crm-backup`

**Authentication:** Service role key (for automated jobs) or anon key (for UI-triggered)

### Payload

```json
{
  "type": "manual | daily | weekly"
}
```

### Responses

```json
// 200 Success
{
  "ok": true,
  "backup_id": "abc-123",
  "size": 5242880
}

// 500 Error
{ "error": "Failed to save backup: ..." }
```

### Retention Policy

| Type | Retention | Auto-Cleanup |
|------|-----------|-------------|
| manual | Forever | None |
| daily | 30 days | Yes |
| weekly | 12 weeks (84 days) | Yes |

### Scheduled Execution

Backups are triggered via GitHub Actions:

```yaml
# Daily: 0 3 * * *
# Weekly: 0 3 * * 0
```

The workflow calls the edge function using `SUPABASE_SERVICE_ROLE_KEY`.

---

## Public Contact Form Submission

**Endpoint:** `POST /rest/v1/contact_submissions`

**Authentication:** Anon key (anyone can submit)

### Payload

```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (optional)",
  "message": "string (required)"
}
```

### Trigger

After insert, a database trigger copies the submission to `contact_messages` and creates/updates the associated `contact_conversation`. This is how contact form submissions appear in the Inbox automatically.

---

## Client-Side Helper Reference

### `conversationsHelper`

```typescript
getAll(): Promise<Conversation[]>
getById(id): Promise<Conversation | null>
create(data): Promise<Conversation>
update(id, data): Promise<Conversation>
delete(id): Promise<void>
getActiveByEmail(email): Promise<Conversation | null>
getUnreadCount(): Promise<number>
getLeads(): Promise<Conversation[]>
setLeadStage(id, stage): Promise<void>
setLeadValue(id, value): Promise<void>
```

### `contactMessagesHelper`

```typescript
getAll(): Promise<ContactMessage[]>
getById(id): Promise<ContactMessage | null>
create(data): Promise<ContactMessage>
update(id, data): Promise<ContactMessage>
delete(id): Promise<void>
getByConversation(conversationId): Promise<ContactMessage[]>
createIncoming(msg): Promise<ContactMessage>
reply(parentId, {message, attachments}): Promise<ContactMessage>
markRead(id): Promise<void>
archive(id): Promise<void>
```

### `crmHealthHelper`

```typescript
getStatus(): Promise<{
  smtp: { ok: boolean; lastCheck?: string }
  sync: { ok: boolean; submissions: number; messages: number }
  storage: { ok: boolean; fileCount: number }
  edgeFunction: { ok: boolean }
}>
```

### `crmMetricsHelper`

```typescript
getMetrics(): Promise<{
  newLeads30d: number
  contacted: number
  proposals: number
  won: number
  lost: number
  pipelineValue: number
  wonValue: number
  conversionRate: number
}>
```

### `monitoringHelper`

```typescript
getStatus(): Promise<{
  errors24h: number
  smtp: { sent24h: number; failed24h: number }
  edgeFunctions: Array<{ name: string; lastRun?: string; lastStatus?: string; duration?: number }>
  storage: { totalFiles: number; uploaded24h: number; totalSizeMB: number }
  frontendErrors: { critical: number; warning: number }
}>
```

---

## Permission API

```typescript
// lib/permissions.ts
hasPermission(role: UserRole, permission: Permission): boolean
getRoleLabel(role: UserRole): string

type Permission =
  | 'cms.edit' | 'cms.view'
  | 'crm.inbox' | 'crm.pipeline' | 'crm.tasks'
  | 'history.view' | 'history.restore'
  | 'settings.all' | 'users.manage'
```

---

## Storage Endpoints

### Upload attachment

```bash
curl -X POST "https://abc.supabase.co/storage/v1/object/contact-attachments/{filename}" \
  -H "Authorization: Bearer $AUTH_JWT" \
  -H "Content-Type: application/pdf" \
  --data-binary @file.pdf
```

### Public read

```bash
GET /storage/v1/object/public/contact-attachments/{filename}
```

### RLS

| Action | Auth Required |
|--------|---------------|
| Upload | Authenticated user |
| Read | Public (anon) |
| Delete | Authenticated user |
