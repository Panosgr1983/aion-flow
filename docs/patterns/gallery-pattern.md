# Gallery Pattern — AION Flow

## Vision

Reusable gallery component για κάθε module που χρειάζεται image grid + lightbox.

## Component Tree

```
GalleryViewer (orchestrator)
├── GalleryFilters (category pills)
├── GalleryToolbar (count)
├── GalleryGrid (responsive grid)
│   └── GalleryCard (image card with overlay)
└── GalleryLightbox (fullscreen modal)
    ├── Close, Prev, Next buttons
    ├── Image (object-contain)
    └── Metadata (caption, photographer, copyright)
```

## States

| State | Behavior |
|-------|----------|
| Loading | Skeleton grid |
| Empty | "No images" message |
| Single item | Grid with 1 item, lightbox works |
| Multiple items | Full grid + filters |
| Filter active | Filtered grid, lightbox only shows filtered items |
| Error | Fallback UI |

## Responsive

| Breakpoint | Columns |
|------------|---------|
| < 640px | 2 |
| 640+ | 3 |
| 1024+ | 4 |

## Keyboard Navigation (Lightbox)

| Key | Action |
|-----|--------|
| Escape | Close |
| ArrowLeft | Previous |
| ArrowRight | Next |

## Reuse

Το GalleryViewer δέχεται:
```typescript
interface GalleryViewerProps {
  items: GalleryItem[];
  loading?: boolean;
  emptyMessage?: string;
}
```

Και μπορεί να χρησιμοποιηθεί από:
- Portfolio Module (actor stills, musician album art)
- Business Module (product photos, team photos)
- Medical Module (clinic photos, before/after)
- Restaurant Module (menu photos, interior)
- Hotel Module (room photos, amenities)
