# AION CMS — Backup & Disaster Recovery

## Automated Backups

### Edge Function: `crm-backup`
- **Manual:** Trigger από Audit Dashboard
- **Daily:** Αυτόματο κάθε βράδυ (cron)
- **Weekly:** Full backup κάθε Κυριακή

### Retention
| Type | Retention |
|------|-----------|
| Daily | 30 ημέρες |
| Weekly | 12 εβδομάδες |
| Manual | Permanent (άπειρο) |

### Storage
Τα backups αποθηκεύονται στο Supabase Storage bucket `backups`.

## Supabase Built-in Backups

Το Supabase κρατάει αυτόματα:
- Daily backups (7 days retention)
- Point-in-time recovery (ανάλογα με το plan)

## Manual Backup Process

### Database
```bash
pg_dump "postgresql://postgres:pass@db.project.supabase.co:5432/postgres" \
  > backup_$(date +%Y%m%d).sql
```

### Storage Files
```bash
# Supabase Storage files — copy via API ή CLI
```

## Disaster Recovery

### Scenario 1: Bug στο deployment
1. Git revert / checkout previous version
2. Re-deploy
3. Ενημέρωση status page / πελάτες

### Scenario 2: Corrupted data
1. Restore from latest backup
2. Apply any missing migrations
3. Verify data integrity

### Scenario 3: Full database loss
1. Create new Supabase project
2. Apply all migrations
3. Restore from latest full backup
4. Update environment variables
5. Re-deploy

## Recovery Testing
- Monthly test restore σε dev environment
- Verify data integrity after restore
- Document any issues
