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
id              uuid PRIMARY KEY
name            text              -- Επωνυμία
slug            text UNIQUE       -- URL-friendly name
domain          text              -- Custom domain (προαιρετικό)
plan            text              -- free | pro | enterprise
status          text              -- active | trial | suspended | cancelled
industry        text              -- psychology, legal, medical, κλπ.
settings        jsonb             -- default settings template
external_project jsonb            -- ΝΕΟ (v0.1): { connection_url, api_key, worker_url } για εξωτερικά Supabase projects
created_at      timestamptz
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
media_type    text                -- ΝΕΟ (v0.3): image | video | document | audio
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

---

## Core Entities

### core_entities
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
entity_type     text   -- business_information | branding | seo | navigation | social | legal | analytics
data            jsonb
version         integer
UNIQUE(tenant_id, entity_type)
created_at      timestamptz
updated_at      timestamptz
```

### core_entity_versions
```sql
id              uuid PK
entity_id       uuid → core_entities(id)
version         integer
data            jsonb
created_by      uuid → auth.users(id)
created_at      timestamptz
```

## Feature Flags

### tenant_features
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
feature         text
enabled         boolean
UNIQUE(tenant_id, feature)
created_at      timestamptz
```

## Tenant Settings

### tenant_settings
```sql
id              uuid PK
tenant_id       uuid → tenants(id) UNIQUE
settings        jsonb
created_at      timestamptz
updated_at      timestamptz
```

## Planned: Artist Module Tables

### artist_biographies
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
full_name       text
birth_date      date
birth_place     text
death_date      date
death_place     text
nationality     text
occupation      text[]
biography       text
awards          jsonb
social_links    jsonb
photo_url       text
published       boolean
created_at      timestamptz
updated_at      timestamptz
```

### artist_filmography
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
artist_id       uuid → artist_biographies(id)
title           text
year            integer
director        text
role            text
description     text
poster_url      text
sort_order      integer
created_at      timestamptz
```

### artist_television
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
artist_id       uuid → artist_biographies(id)
title           text
year            integer
channel         text
role            text
episodes        integer
description     text
thumbnail_url   text
sort_order      integer
created_at      timestamptz
```

### artist_theatre
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
artist_id       uuid → artist_biographies(id)
title           text
year            integer
theatre         text
role            text
director        text
description     text
poster_url      text
sort_order      integer
created_at      timestamptz
```

### artist_timelines
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
artist_id       uuid → artist_biographies(id)
year            integer
title           text
description     text
icon            text
sort_order      integer
created_at      timestamptz
```

### artist_gallery
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
artist_id       uuid → artist_biographies(id)
image_url       text
caption         text
category        text
sort_order      integer
created_at      timestamptz
```

### artist_press
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
artist_id       uuid → artist_biographies(id)
title           text
source          text
date            date
url             text
description     text
thumbnail_url   text
sort_order      integer
created_at      timestamptz
```

### artist_showreels
```sql
id              uuid PK
tenant_id       uuid → tenants(id)
artist_id       uuid → artist_biographies(id)
title           text
video_url       text
platform        text
duration        integer
description     text
thumbnail_url   text
sort_order      integer
created_at      timestamptz
```

## Indexes

### Core Tables
- `tenants`: PK on `id`, UNIQUE on `slug`
- `profiles`: PK on `id` (FK to `auth.users`), FK on `tenant_id`
- `media`: PK on `id`, FK on `tenant_id`, FK on `created_by`
- `site_settings`: PK on `id`, UNIQUE on `key`, FK on `tenant_id`
- `core_entities`: PK on `id`, UNIQUE on `(tenant_id, entity_type)`, FK on `tenant_id`
- `core_entity_versions`: PK on `id`, FK on `entity_id`
- `tenant_features`: PK on `id`, UNIQUE on `(tenant_id, feature)`, FK on `tenant_id`
- `tenant_settings`: PK on `id`, UNIQUE on `tenant_id`, FK on `tenant_id`

### Content Tables (services, blog_posts, products)
- PK on `id` for all tables
- FK on `tenant_id` for all tables
- FK on `created_by` for all tables

### Artist Module (planned)
- PK on `id` for all tables
- FK on `tenant_id` for all tables
- FK on `artist_id` for detail tables
- FK on `created_by` where applicable
