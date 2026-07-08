# Research Workflow — AION Flow

## Vision

Μεθοδολογία για συστηματική έρευνα, συλλογή, επαλήθευση και ενσωμάτωση περιεχομένου για κάθε νέο project ή module.

## Workflow Stages

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Research │ → │ Verify   │ → │ Validate │ → │ Editorial│ → │ Client   │ → │ CMS      │ → │ QA       │ → │ Publish  │
│          │   │ Assets   │   │ Data     │   │ Review   │   │ Approval │   │ Populate │   │          │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### Stage 1: Research

| Source | Type | Yield |
|--------|------|-------|
| retroDB.gr | Filmography, TV, theatre entries | High |
| TMDB | Posters, backdrops, metadata | High |
| IMDb | Cast, credits, trivia | High |
| ERT Archive | Theatre productions, TV series | Medium |
| Ταινιοθήκη | Film stills (high quality) | Medium |
| YouTube | Trailers, full films, interviews | Medium |
| News sites | Biography, recent photos | Medium |
| VHS80/Zartans | VHS cover art | Low |

### Stage 2: Asset Verification

- HTTP 200 check for every URL
- Dimension validation (min width/height)
- File format validation (JPEG, PNG, WebP)
- Duplicate detection (MD5 hash)
- Copyright clearance check

### Stage 3: Data Verification

- Cross-reference with 2+ sources
- Date/year verification
- Role/credit verification
- IMDb/TMDB ID validation
- Confidence scoring (high/medium/low/unverified)

### Stage 4: Editorial Review

- Content quality assessment
- Metadata completeness check
- Caption/alt text quality
- Category classification verification
- SEO metadata review

### Stage 5: Approval

- Client approval for third-party content
- Rights management decision
- Attribution finalization
- Publish date planning

## Database Integration

```sql
CREATE TABLE research_sources (
  id UUID PK,
  tenant_id UUID,
  name TEXT,           -- 'retroDB', 'TMDB', 'Ταινιοθήκη'
  url TEXT,
  type TEXT,           -- 'still', 'poster', 'portrait', 'interview'
  confidence TEXT,     -- 'high', 'medium', 'low', 'unverified'
  status TEXT,         -- 'pending', 'verified', 'rejected', 'catalogued'
  notes TEXT,
  created_at TIMESTAMPTZ
);
```

## Confidence Scoring

| Score | Meaning | Action |
|-------|---------|--------|
| High | 2+ independent sources confirm | Upload without client approval |
| Medium | 1 source, reasonable quality | Upload, flag for review |
| Low | Questionable source/quality | Flag for client decision |
| Unverified | No source found | Placeholder, document in research log |
