# Portfolio Pattern — AION Flow

## Vision

Generic schema για οποιοδήποτε δημιουργικό επάγγελμα:
actors, musicians, painters, writers, photographers, directors, dancers, designers.

## Architecture

```
Portfolio Profile (ένας ανά καλλιτέχνη)
  └── Portfolio Sections (N, π.χ. Filmography, Discography, Exhibitions)
        └── Portfolio Entries (N, π.χ. ταινίες, albums, εκθέσεις)
              └── Portfolio Media (N, π.χ. stills, posters, photos)
```

## Database Schema

```sql
-- 1. Portfolio Profile (replaces biographies)
CREATE TABLE portfolio_profiles (
  id UUID PK,
  tenant_id UUID,
  professional_type TEXT CHECK (type IN ('actor','musician','painter','writer','photographer','director','dancer','designer','other')),
  name TEXT,
  bio TEXT,
  short_bio TEXT,
  birth_year TEXT,
  birth_place TEXT,
  pseudonyms TEXT[],
  featured_media_id UUID REFERENCES media(id),
  status TEXT DEFAULT 'draft',
  verified BOOLEAN DEFAULT false
);

-- 2. Portfolio Sections (replaces filmography/tv/theatre categories)
CREATE TABLE portfolio_sections (
  id UUID PK,
  tenant_id UUID,
  profile_id UUID REFERENCES portfolio_profiles(id),
  section_type TEXT CHECK (type IN (
    'filmography','television','theatre',     -- actor
    'discography','albums','singles','concerts', -- musician
    'exhibitions','collections','works',        -- painter
    'bibliography','publications',              -- writer
    'galleries','editorial',                     -- photographer
    'filmography','theatre','workshops'          -- director/dancer
  )),
  name TEXT,
  slug TEXT,
  sort_order INT DEFAULT 0
);

-- 3. Portfolio Entries (replaces specific entries)
CREATE TABLE portfolio_entries (
  id UUID PK,
  tenant_id UUID,
  section_id UUID REFERENCES portfolio_sections(id),
  title TEXT NOT NULL,
  title_en TEXT,
  year INT,
  description TEXT,
  role TEXT,
  metadata JSONB,       -- genre, director, channel, venue, playwright, etc.
  featured_media_id UUID REFERENCES media(id),
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'draft',
  verified BOOLEAN DEFAULT false
);

-- 4. Portfolio Media (replaces gallery_items)
CREATE TABLE portfolio_media (
  id UUID PK,
  tenant_id UUID,
  entry_id UUID REFERENCES portfolio_entries(id),
  media_id UUID REFERENCES media(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  media_type TEXT,
  photographer TEXT,
  copyright TEXT,
  sort_order INT DEFAULT 0
);
```

## Type-to-Type Mapping (Current → Portfolio)

| Current (actor-specific) | Portfolio (generic) | Section Type |
|--------------------------|---------------------|-------------|
| biographies | portfolio_profiles | — |
| filmography_entries | portfolio_entries (via filmography section) | filmography |
| television_entries | portfolio_entries (via television section) | television |
| theatre_entries | portfolio_entries (via theatre section) | theatre |
| career_timelines | portfolio_entries (via timeline section) | timeline |
| gallery_items | portfolio_media (via portfolio_entries) | — |

## Implementation Phases

| Phase | What | Status |
|-------|------|--------|
| v0.1 | Actor-specific tables (current) | ✅ Done |
| v0.15 | Generic schema design + documentation | 🔜 Current |
| v0.2 | Generic schema migration + CRUD | 🔄 Planned |
| v0.3 | Type-specific templates (musician, painter) | 🔄 Future |
