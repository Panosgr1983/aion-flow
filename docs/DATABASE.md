# AION CMS — Database Schema

## Επισκόπηση

Το AION χρησιμοποιεί PostgreSQL 17 μέσω Supabase. Η βάση είναι
multi-tenant με RLS policies σε κάθε πίνακα.

## Core Tables

### Authentication (Supabase Auth)
Διαχειρίζεται από Supabase. Το `auth.users` table περιέχει τους
λογαριασμούς. Το `profiles` table (δικό μας) συνδέεται με
`auth.users(id)` και περιέχει roles, permissions, tenant assignment.

### tenants
```sql
id            uuid PRIMARY KEY
name          text              -- Επωνυμία
slug          text UNIQUE       -- URL-friendly name
domain        text              -- Custom domain (προαιρετικό)
plan          text              -- free | pro | enterprise
status        text              -- active | trial | suspended | cancelled
industry      text              -- psychology, legal, medical, κλπ.
settings      jsonb             -- default settings template
created_at    timestamptz
```

### profiles
```sql
id            uuid PK → auth.users(id)
email         text
full_name     text
role          user_role          -- admin | editor | sales | viewer
is_super_admin boolean           -- bypass RLS
tenant_id     uuid → tenants(id)
avatar_url    text
timezone      text
locale        text
is_active     boolean
created_at    timestamptz
```

### media
```sql
id            uuid PK
name          text
original_name text
url           text
public_id     text
mime_type     text
size          bigint
width         integer
height        integer
folder        text               -- general | blog | services | products | team | gallery
alt_text      text
caption       text
tags          text[]
created_by    uuid → auth.users(id)
tenant_id     uuid → tenants(id)  -- ΝΕΟ (v0.2)
category      text                -- ΝΕΟ (v0.2): service | blog | product | logo | hero | ...
source        text                -- ΝΕΟ (v0.2): editor | inline-content
metadata      jsonb               -- ΝΕΟ (v0.2)
created_at    timestamptz
updated_at    timestamptz
```

### services / blog_posts / products
Κάθε content type έχει:
```sql
id            uuid PK
tenant_id     uuid → tenants(id)
title         text
slug          text
content       jsonb              -- TipTap editor JSON
image_url     text
og_image      text
published     boolean
created_by    uuid → auth.users(id)
created_at    timestamptz
updated_at    timestamptz
```

### site_settings
```sql
id            uuid PK
key           text UNIQUE         -- hero_title, site_logo, footer_contact, κλπ.
value         jsonb
category      text                -- general | hero | footer | seo | about
description   text
tenant_id     uuid → tenants(id)
created_at    timestamptz
updated_at    timestamptz
```

## Views

### v_churn_risk
Υπολογίζει risk level (🟢🟡🟠🔴⚪) βάσει 30-day activity window.

### v_tenant_active_days
Ημέρες ενεργής χρήσης ανά tenant.

### v_tenant_top_events
Top 10 usage events ανά tenant.

## RLS Strategy

Όλοι οι πίνακες έχουν RLS enabled. Τα policies ελέγχουν:
1. Αν `is_super_admin = true` → bypass (SELECT/INSERT/UPDATE/DELETE all)
2. Αν `tenant_id` του record = `tenant_id` του user → access granted
3. Specific role checks (π.χ. `user_role = 'editor'` για CMS edit)

## Migrations

Βρίσκονται στο `supabase/migrations/` με timestamp naming:
```
YYYYMMDDHHMMSS_description.sql
```
Σειρά εφαρμογής: 18 migrations (από 20260419 έως 20260610).

## Dev Environment

Η Dev βάση βρίσκεται στο Supabase project `AION Flow Dev`:
- **Ref:** bqvjstaqqgxzjojwodwr
- **Region:** eu-north-1
- **Password:** `<DEV_DB_PASSWORD>` (set via environment variable)
