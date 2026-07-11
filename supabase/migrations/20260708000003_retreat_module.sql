-- Retreat Module v0.1 — Additive migration
-- Creates retreat-specific tables

CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_experiences_tenant ON experiences(tenant_id);

CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_workshops_tenant ON workshops(tenant_id);

CREATE TABLE IF NOT EXISTS retreat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_events_tenant ON retreat_events(tenant_id);

CREATE TABLE IF NOT EXISTS faq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  locale TEXT DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faq_tenant ON faq_entries(tenant_id);

CREATE TABLE IF NOT EXISTS booking_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON booking_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON booking_submissions(status);
