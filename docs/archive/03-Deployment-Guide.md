# AION Flow — Deployment Guide

## Prerequisites

- Node.js 20+
- npm
- Supabase account (free tier works)
- Vercel account (Hobby tier works)
- SMTP credentials (Gmail App Password or any SMTP server)
- GitHub account (for scheduled backups)

---

## Step 1: Clone & Install

```bash
git clone <repo-url> aion-flow
cd aion-flow
npm install
```

---

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New project
2. Choose region closest to your users
3. Save your `Database Password` — you'll need it

After creation, note these from **Project Settings → API**:
- `Project URL` (e.g. `https://abc123.supabase.co`)
- `anon public key`
- `service_role key` (keep secret)

---

## Step 3: Configure Environment

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role
TENANT_ID=00000000-0000-0000-0000-000000000001
DATABASE_PASSWORD=your_db_password

# Optional — monitoring
VITE_SENTRY_DSN=https://...@sentry.io/
```

---

## Step 4: Run Database Migrations

Using the Supabase Dashboard **SQL Editor**, run each migration file in order:

```sql
-- Run files from supabase/migrations/ in this order:
1. 20260419113203_create_aion_flow_schema.sql
2. 20260606000001_create_content_schema.sql
3. 20260609000001_create_content_versioning.sql
4. 20260609000002_create_contact_submissions.sql
5. 20260610000001_create_crm_inbox.sql
6. 20260610000002_create_crm_inbox_phase_b.sql
7. 20260610000003_create_crm_leads.sql
8. 20260610000004_create_follow_up_tasks.sql
9. 20260610000005_create_fts_search.sql
10. 20260610000006_add_sales_role.sql
11. 20260610000007_create_backup_jobs.sql
```

Or use the pg connection directly:

```bash
PGPASSWORD='your_db_password' psql -h db.abc123.supabase.co -U postgres -d postgres -f supabase/migrations/20260610000001_create_crm_inbox.sql
```

---

## Step 5: Configure Storage Buckets

Run in Supabase SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-attachments',
  'contact-attachments',
  true,
  10485760,
  ARRAY['image/*','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','application/zip']
);
```

Also create:
- `blog-images` (public, for CMS media)
- `site-images` (public, for site asset uploads)

---

## Step 6: Configure SMTP

In the CMS admin panel:

1. Go to **Site Settings → Επικοινωνία → SMTP Server**
2. Fill in:
   - `SMTP Host`: e.g. `smtp.gmail.com`
   - `SMTP Port`: `587`
   - `SMTP Username`: your full email
   - `SMTP Password`: App password (not your regular password)
   - `From Email`: sender address
   - `From Name`: e.g. "Νικόλας Κολοκοτρώνης"
3. Save

For Gmail: Enable 2FA → Generate App Password at https://myaccount.google.com/apppasswords

---

## Step 7: Deploy Edge Functions

```bash
# Requires Supabase CLI + access token
# https://supabase.com/dashboard/account/tokens

export SUPABASE_ACCESS_TOKEN=sbp_xxxx

# Deploy contact email function
supabase functions deploy send-contact-email --no-verify-jwt

# Deploy backup function
supabase functions deploy crm-backup --no-verify-jwt
```

Or deploy via Management API:

```bash
curl -X POST "https://api.supabase.com/v1/projects/{ref}/functions" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"send-contact-email","name":"Send Contact Email","verify_jwt":false,"body":"import nodemailer..."}'
```

---

## Step 8: Build & Deploy to Vercel

```bash
npm run build
npx vercel --prod
```

Or connect GitHub repo to Vercel for auto-deploy:

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Deploy

---

## Step 9: Configure Backup Scheduler

1. Go to your GitHub repo → **Settings → Secrets and Variables → Actions**
2. Add:
   - `SUPABASE_URL`: your project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: your service role key
3. Push `.github/workflows/backup-schedule.yml` to trigger daily runs

To test manually: GitHub → Actions → Scheduled Backups → Run workflow

---

## Step 10: Verify Health Dashboard

1. Login to the CMS admin panel
2. Navigate to **Settings → Observability**
3. Verify:
   - Overall health shows green
   - Edge Functions report success
   - SMTP shows sent emails
   - Storage shows uploaded files
4. Send a test message via the public contact form
5. Verify it appears in **Inbox**
6. Try a Reply and confirm it sends

---

## First-Time Setup Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] All migrations run
- [ ] Storage buckets created
- [ ] SMTP configured in CMS
- [ ] Edge Functions deployed
- [ ] Vercel project deployed
- [ ] GitHub secrets configured
- [ ] First backup triggered manually
- [ ] Health Dashboard shows green

---

## Maintenance

| Task | Frequency | Command |
|------|-----------|---------|
| Daily backup | Daily @ 3AM | GitHub Actions (auto) |
| Weekly backup | Sunday @ 3AM | GitHub Actions (auto) |
| Manual backup | As needed | CMS → Settings → Backup |
| Clean old history | Monthly | CMS → Audit → Εκκαθάριση |
| Verify health | Weekly | CMS → Settings → Observability |

---

## Disaster Recovery

### Restore from backup

1. Go to **CMS → Audit Dashboard**
2. If full restore: Use SQL to replay a `content_backups.snapshot`
3. If single entity: Use the **Restore** button in Audit Dashboard

### Database rollback

```sql
-- Connect to Supabase SQL Editor
-- Restore specific table from a backup snapshot
INSERT INTO services SELECT * FROM jsonb_populate_recordset(null::services, '[{"id":"...",...}]');
```

### Data loss prevention

- Backups are retained for 30 days (daily) + 12 weeks (weekly)
- Manual backups are kept forever
- All entity changes are logged in `content_history` for 30 days
- Deleted records can be restored from history before expiration
