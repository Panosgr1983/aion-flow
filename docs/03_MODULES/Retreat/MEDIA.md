# Retreat Module — Media

## Image Requirements

| Panel | Aspect Ratio | Min Width | Max Size |
|-------|-------------|-----------|----------|
| Experiences | 16:9 | 800px | 2MB |
| Workshops | 16:9 | 800px | 2MB |
| Events | 16:9 | 800px | 2MB |
| FAQ | — | — | — |
| Gallery | Any (responsive) | 1200px | 5MB |

## Gallery (Reused from Portfolio Module)

| Feature | Detail |
|---------|--------|
| Grid columns | `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| Card aspect | `aspect-[3/4]` for portrait, `aspect-[4/3]` for other |
| Lightbox | `max-h-[80vh]`, `object-contain` |
| First 4 items | Priority loading for LCP |

## Storage

All images stored in the shared Supabase `media` bucket.
Path: `{tenant-id}/{category}/{filename}`

## Metadata (per image)

| Field | Purpose |
|-------|---------|
| alt_text | Accessibility / SEO |
| caption | Display caption |
| photographer | Credit |
| copyright | Legal |
| media_type | `poster` / `gallery` / `portrait` / `document` |
