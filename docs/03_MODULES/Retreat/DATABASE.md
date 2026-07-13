# Retreat Module — Database

## Tables

### experiences

```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  level TEXT,
  includes TEXT[],
  image_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  locale TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_experiences_tenant ON experiences(tenant_id);
```

### workshops

```sql
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  group_size TEXT,
  includes TEXT[],
  image_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  locale TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### retreat_events (bilingual)

```sql
CREATE TABLE retreat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  date DATE,
  organizer TEXT,
  capacity INT,
  price NUMERIC(10,2),
  description TEXT,
  description_en TEXT,
  includes TEXT[],
  includes_en TEXT[],
  image_url TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  locale TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### faq_entries

```sql
CREATE TABLE faq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  locale TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_faq_tenant ON faq_entries(tenant_id);
```

### booking_submissions

```sql
CREATE TABLE booking_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  guests INT DEFAULT 1,
  arrival_date DATE,
  departure_date DATE,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','confirmed','cancelled','completed')),
  notes TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_booking_tenant ON booking_submissions(tenant_id);
CREATE INDEX idx_booking_status ON booking_submissions(status);
CREATE INDEX idx_booking_dates ON booking_submissions(arrival_date, departure_date);
```

## Relationships

```
experiences
  └── tenant_id → tenants(id)

workshops
  └── tenant_id → tenants(id)

retreat_events
  └── tenant_id → tenants(id)

faq_entries
  └── tenant_id → tenants(id)

booking_submissions
  └── tenant_id → tenants(id)
```

## Indexes

- `experiences(tenant_id)`
- `workshops(tenant_id)`
- `retreat_events(tenant_id)`
- `faq_entries(tenant_id)`
- `booking_submissions(tenant_id, status, arrival_date, departure_date)`
