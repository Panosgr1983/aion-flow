# Timeline Pattern — AION Flow

## Vision

Reusable timeline component για οπτικοποίηση χρονολογικών γεγονότων.

## Usage

```tsx
<Timeline
  events={careerEvents}
  iconMap={{
    film: Film,
    tv: Monitor,
    theatre: Theater,
    award: Award,
    personal: User,
  }}
  categoryLabels={{
    film: 'Κινηματογράφος',
    tv: 'Τηλεόραση',
    theatre: 'Θέατρο',
    award: 'Βραβείο',
    personal: 'Προσωπικό',
  }}
/>
```

## States

| State | Behavior |
|-------|----------|
| Loading | Skeleton |
| Empty | Returns null (hidden section) |
| Single event | Full timeline with one entry |
| Multiple events | Timeline with vertical line + icons |
| Media present | Optional thumbnail per event |

## Responsive

- Single column (always)
- Vertical line on left
- Icon circle + content on right
- No alternate left/right layout

## Reuse

Timeline μπορεί να χρησιμοποιηθεί από:
- Portfolio Module (career milestones)
- Business Module (company history)
- Medical Module (clinic timeline)
- Any module with chronological events
