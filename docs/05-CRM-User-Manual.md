# AION Flow — CRM User Manual

## Overview

AION Flow is a unified Content Management + CRM platform. It combines website content management with a sales-oriented CRM inbox, lead pipeline, and task tracking system.

---

## 1. Inbox

**Location:** Sidebar → **Inbox**

The Inbox is the central hub for all contact form submissions, emails, and lead communications.

### Layout
```
┌──────────────────────────────────────┐
│ LEFT PANEL           │ RIGHT PANEL   │
│                      │               │
│ [Search...]          │ Conversation  │
│ [All│New│Replied│Arch│ Header        │
│                      │               │
│ ○ Maria Papadopoulou │ Thread of     │
│   maria@email.com    │ messages      │
│   πριν 2 ώρες       │               │
│                      │ [Reply...]    │
│ ○ Giorgos Alexiou    │ [Send]        │
│   giorgos@email.com  │               │
│   πριν 1 μέρα        │ Forward│Del   │
└──────────────────────────────────────┘
```

### Actions

| Action | How |
|--------|-----|
| **Read message** | Click any conversation in the left panel |
| **Reply** | Type in the reply area below the thread, click Send |
| **Forward** | Click **Forward**, enter recipient email, write message, Send |
| **Attach file** | Click paperclip icon, select file (max 10MB) |
| **Mark as read** | Clicking a conversation auto-marks new messages as read |
| **Archive** | Click **Αρχειοθέτηση** below the thread |
| **Delete** | Click **Διαγραφή** |
| **Search** | Type in the search bar above the conversation list |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` | Next conversation |
| `k` | Previous conversation |
| `r` | Focus reply box |

### Status Meanings

| Status | Meaning |
|--------|---------|
| **New** | Unread incoming message |
| **Replied** | You have replied to this message |
| **Read** | Message has been seen |
| **Archived** | Hidden from default view |

---

## 2. Leads Pipeline

**Location:** Sidebar → **Pipeline**

The Pipeline visualizes your leads in a Kanban board with 5 stages.

### Stages

```
New ──→ Contacted ──→ Proposal ──→ Won
                                    │
                                    └── Lost
```

| Stage | Meaning |
|-------|---------|
| **New** | Fresh lead from contact form |
| **Contacted** | You replied or called |
| **Proposal** | Sent a quote/proposal |
| **Won** | Deal closed |
| **Lost** | Deal lost |

### Actions

| Action | How |
|--------|-----|
| **Move stage** | Drag & drop a card to another column, or click "Μετακίνηση σε..." |
| **Edit value** | Click the value (or "Προσθήκη αξίας") on a card, type amount, Enter |
| **View conversation** | Click the chat icon on a card → opens Inbox with that conversation |
| **Add task** | Type in the "Νέα εργασία" field at the bottom of a card |

### Pipeline Metrics

The top of the page shows:
- Total leads
- Open leads (New + Contacted + Proposal)
- Won leads
- Total won revenue

---

## 3. Follow-Up Tasks

**Location:** Inside each Pipeline card (bottom)

Tasks are linked to individual leads/conversations.

### Actions

| Action | How |
|--------|-----|
| **Add task** | Type title in "Νέα εργασία..." input, press Enter |
| **Complete task** | Click the checkbox |
| **Delete task** | Hover over task, click trash icon |

Tasks show a completion counter (e.g. 1/3) per lead.

---

## 4. Content Management

**Location:** Sidebar → various CMS sections

| Section | Description |
|---------|-------------|
| **Βιβλία / Προϊόντα** | Manage books and products with cover images, prices, descriptions |
| **Υπηρεσίες** | Service listings with icons and descriptions |
| **Blog** | Blog posts with rich text editor |
| **Κριτικές** | Client testimonials |
| **Πιστοποιήσεις** | Professional credentials |
| **Αξίες** | Core values display |
| **Σχετικά** | About page content, biography, achievements |
| **Σελίδες** | Page management: visibility, hero images, titles |
| **Πολυμέσα** | Media library for images and files |

---

## 5. Search

The Inbox supports full-text search across:
- Message content
- Subject lines
- Sender name
- Sender email

Results are ranked by relevance (PostgreSQL `ts_rank`).

---

## 6. Attachments

- Supported formats: images, PDF, Word, text, ZIP
- Max file size: 10MB per file
- Upload via the paperclip icon in the reply area
- Attachments are stored in Supabase Storage (`contact-attachments` bucket)
- Download by clicking the attachment link in the message bubble

---

## 7. Audit Dashboard

**Location:** Sidebar → **Ιστορικό**

Shows a chronological log of all changes to:
- Services, Blog, Products, Pages
- Testimonials, Credentials, Core Values
- Site Settings

### Features

| Feature | How |
|---------|-----|
| **View change** | Click the expand icon (>) to see before/after diff |
| **Restore** | Click the undo icon on any UPDATE entry |
| **Search** | Filter by action type, table, user, or text search |
| **Export CSV** | Click CSV button to download filtered results |
| **Clean up** | Click Εκκαθάριση to delete expired history entries |

### Backup Snapshots

The bottom of the Audit Dashboard shows all system backups:
- **Manual** — triggered on demand, retained forever
- **Daily** — created automatically at 3 AM, retained 30 days
- **Weekly** — created Sunday at 3 AM, retained 12 weeks

Create a backup anytime by clicking **Δημιουργία Backup**.

---

## 8. Users & Roles

**Location:** Settings → **Χρήστες**

### Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to everything |
| **Editor** | Can edit CMS content + settings |
| **Sales** | Can use Inbox, Pipeline, Tasks (read-only history) |
| **Viewer** | Read-only access to CMS and history |

### Changing a User's Role

1. Go to **Settings → Χρήστες**
2. Find the user in the table
3. Click the role dropdown
4. Select the new role
5. Changes take effect immediately

---

## 9. Dashboard Metrics

**Location:** Sidebar → **Dashboard** (top section)

Shows CRM KPIs:
- New leads (last 30 days)
- Pipeline value (total open deal value)
- Won revenue
- Conversion rate
- Contacted / Proposal / Won / Lost counts

---

## 10. Observability

**Location:** Settings → **Observability** (admin only)

System health monitoring dashboard:

| Section | What it shows |
|---------|---------------|
| **Overall Health** | Green = all systems normal, Red = issues detected |
| **Frontend Errors** | Critical and warning counts from Sentry |
| **SMTP / Email** | Emails sent and failed in last 24 hours |
| **Edge Functions** | Status of `send-contact-email` and `crm-backup` |
| **Storage** | File count and recent uploads |
| **Edge Function Runs** | Log of recent function executions with duration |

---

## Common Workflows

### Handling a new contact form submission

1. Open **Inbox**
2. Click the new conversation (shows blue indicator)
3. Read the message
4. Type your reply in the text area
5. Attach any relevant files
6. Click **Send**
7. The lead is now in **Pipeline → Contacted** stage

### Moving a lead through the pipeline

1. Go to **Pipeline**
2. Find the lead card
3. Drag it to the next stage column, OR click "Μετακίνηση σε..."
4. Add a follow-up task if needed
5. When deal closes, move to **Won** — the value is locked

### Monitoring system health

1. Go to **Settings → Observability**
2. Check overall health indicator
3. Review any failed Edge Functions or SMTP errors
4. If issues found, check Sentry for detailed error logs

### Performing a manual backup

1. Go to **Settings → Backup**
2. Click **Δημιουργία Manual Backup**
3. Wait for confirmation
4. The backup appears in the history table below
