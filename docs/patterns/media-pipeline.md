# Media Engine — AION Flow

## Vision

Ανεξάρτητο subsystem για upload, διαχείριση, metadata και delivery όλων των media assets στο AION Flow.

Δεν είναι Artist feature — είναι Platform feature.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    MEDIA ENGINE                            │
│                                                            │
│  Level 1: Storage Layer                                     │
│  ┌────────────────────────────────────────────────────┐   │
│  │ storage.ts — raw upload/download/delete to Supabase │   │
│  │             Storage buckets: site-images, media     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Level 2: CMS Media Layer                                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │ media.ts — uploadCmsAsset(), getAllMedia(), CRUD   │   │
│  │            tenant-aware, metadata, telemetry       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Level 3: Media Metadata Layer                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ media_type (poster|portrait|gallery|document|video) │   │
│  │ alt_text, caption, photographer, copyright          │   │
│  │ source_url, source_name, license, research_notes    │   │
│  │ width, height, file_size, mime_type                 │   │
│  │ verification_status, verified_at                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Level 4: Media Pipeline Layer                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Download → Verify → Upload → Metadata → Register   │   │
│  │ Research → Validate → Catalog → Link               │   │
│  │ Auto-dimensions, duplicate detection, hash check    │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Database (media table)

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  name TEXT,
  url TEXT,
  mime_type TEXT,
  size INT,
  width INT,
  height INT,
  media_type TEXT CHECK (media_type IN ('poster','portrait','gallery','document','video','other')),
  alt_text TEXT,
  caption TEXT,
  photographer TEXT,
  copyright TEXT,
  source_url TEXT,
  source_name TEXT,
  license TEXT,
  research_notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','archived')),
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  folder TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
);
```

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| Upload pipeline | ✅ | download → verify → upload → metadata |
| Duplicate detection | ✅ | MD5/content hash |
| Dimension backfill | ✅ | auto-detect on upload |
| Media_type taxonomy | 🔄 | v0.15 design, pending migration |
| Verification workflow | 🔄 | per-media verification status |
| Copyright management | 🟡 | source_url + source_name + license |
| Compression pipeline | 🔄 | auto-resize, WebP (future) |
| Usage detection | 🔄 | warn before delete if in-use (future) |
