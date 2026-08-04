# ADR-016: Rich Content Pipeline

**Status:** Accepted  
**Date:** 2026-07-29  
**Trigger:** Production incident — homepage rendered raw TipTap JSON after `short_description` format changed from plain text to serialized TipTap.

---

## Context

Rich content (TipTap JSON) is now stored across multiple fields: `blog_posts.content`, `services.short_description`, `services.long_description`, `site_settings.about_bio_content`. Different modules rendered these fields inconsistently — some parsed the JSON, some rendered it raw.

## Decision

All rich content must pass through one of two canonical functions:

| Function | Used For | Behavior |
|----------|----------|----------|
| `extractPlainText()` | Cards, previews, excerpts, meta descriptions | Extracts text nodes, joins with spaces, returns plain string |
| `renderTipContent()` | Full article, service detail, about page | Renders TipTap JSON to HTML with full formatting |

## Rules

1. No direct rendering of raw DB rich-content values (`{content}`, `{short_description}`, etc.)
2. No `String(content)` for rich-content fields
3. No module-specific parsers — use shared functions
4. All consumers (Blog, About, Services, Homepage, Portfolio) must use this pipeline

## Consequences

### Positive
- Single maintenance point for rendering behavior
- New node types added once, available everywhere
- Regression tests cover all consumers

### Negative
- Existing plain-text fields need runtime format detection (handled by try/catch)

## Related

- `docs/01_PLATFORM/ENGINEERING_PRINCIPLES.md` — Principles 2 (One source of truth) and 4 (Automate repeated verification)
- `docs/01_PLATFORM/CONTENT_ENGINE.md` — Future Content Engine vision
- `docs/INCIDENTS/2026-07-29-rich-content-json-leakage.md` — Trigger incident
