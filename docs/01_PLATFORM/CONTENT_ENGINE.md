# AION Flow — Content Engine

**Status:** Vision / Planned (Phases 1-6)  
**Last updated:** 2026-07-29  
**Principle:** *Architecture follows evidence, not speculation.* This document describes the target architecture. Each phase starts only when a real production need justifies it.

---

## Vision

A single, canonical pipeline for all rich content across the AION Flow platform:

```
RichEditor (shared component)
    → TipTap JSON (storage format)
    → content.parse() / content.validate() / content.normalize() (shared pipeline)
    → content.render() (single renderer)
    → Public UI
```

## Current State (2026-07-29)

Already unified:
- `RichEditor` component shared across Blog, About, Services, Portfolio
- `renderTipContent()` in `content-hooks.ts` — single renderer for all modules
- `extractPlainText()` in `content-hooks.ts` — single extractor for cards/previews
- Engineering Principles documented (5 foundations)

## Target Architecture

```
content/
├── editor/
│   ├── RichEditor.tsx      (existing — extract to content/)
│   └── Toolbar.tsx         (future: shared toolbar)
├── parser/
│   ├── normalize.ts        (future: handle TipTap JSON, plain text, legacy HTML)
│   ├── serialize.ts        (future: TipTap JSON → DB string)
│   └── deserialize.ts      (future: DB string → TipTap JSON)
├── renderer/
│   ├── renderTipContent.ts (existing — extract to content/)
│   ├── extractPlainText.ts (existing — extract to content/)
│   └── nodes/              (future: per-node renderers)
├── schema/
│   ├── types.ts            (future: typed NormalizedContent)
│   └── validation.ts      (future: Zod schema)
└── registry/
    └── ContentNodeRegistry (future: plugin-based dispatcher)
```

## Phases

| Phase | Scope | Trigger |
|-------|-------|---------|
| 1 | Consolidation: move existing files under `content/` (preserve behavior) | Next module that needs rich content |
| 2 | Normalizer: shared `normalizeRichContent()` (TipTap, plain text, HTML) | Second format migration |
| 3 | Registry: `ContentNodeRegistry` dispatcher pattern | Third custom node type |
| 4 | Migration: existing nodes to registry plugins | Before adding tables/callouts |
| 5 | Tests: one test file per plugin | Phase 4 |
| 6 | New nodes: tables, checklists, callouts, embeds | Client request |

## ADR References

- ADR-007 (planned): Content Pipeline Architecture
- ADR-008 (planned): Content Health Check
