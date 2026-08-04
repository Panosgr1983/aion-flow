# Module Map — AION Flow

**Purpose:** Canonical file locations per module. Prevents duplicate implementations of the same problem.  
**Updated:** 2026-08-04

---

## Public Site (kolokotronis-pshychologist-main)

| Module | Canonical Files | Notes |
|--------|-----------------|-------|
| Routing | `src/routes/*.tsx` | TanStack Router file-based |
| Rich Content (render) | `src/lib/content-hooks.ts` → `renderTipContent()` | Single renderer |
| Rich Content (extract) | `src/lib/content-hooks.ts` → `extractPlainText()` | Cards/previews/excerpts |
| Rich Editor (client-side) | Not on public site — CMS only | — |
| Supabase client | `src/lib/supabase.ts` | Shared |
| SEO / Analytics | `src/routes/__root.tsx` (RootShell) | GA4, OG tags, canonical root |
| Blog | `src/routes/blog.tsx`, `blog.$slug.tsx` | — |
| Services | `src/routes/services.tsx`, `services.$slug.tsx` | — |
| About | `src/routes/about.tsx` | — |
| Business info | `src/lib/business-info.ts` | core_entities |

## CMS (aion-flow-v2)

| Module | Canonical Files | Notes |
|--------|-----------------|-------|
| Rich Editor | `src/components/dashboard/RichEditor.tsx` | Shared by Blog/About/Services/Portfolio |
| Data helpers | `src/lib/dataHelpers.ts` | All CRUD helpers |
| Types | `src/types/supabase.ts` | DB types |
| Tenant context | `src/lib/useTenant.ts` + `TenantContext.tsx` | effectiveTenantId |
| Services panel | `src/components/dashboard/Services.tsx` | Includes FAQ tab + extractPlainText local copy |
| About panel | `src/components/dashboard/AboutPanel.tsx` | bio_content |
| Site settings | `src/components/dashboard/SiteSettingsPanel.tsx` | All site settings |
| Blog panel | `src/components/dashboard/BlogPosts.tsx` | — |
| Media | `src/lib/media.ts`, `src/lib/storage.ts` | upload pipeline |
| Analytics events | `src/lib/analytics.ts` | trackEvent |

## Platform Docs

| Area | Canonical Files |
|------|-----------------|
| Engineering Principles | `docs/01_PLATFORM/ENGINEERING_PRINCIPLES.md` |
| ADRs | `docs/ADR/ADR_INDEX.md`, `docs/01_PLATFORM/ADR/` |
| Decision Log | `docs/DECISION_LOG.md` |
| Runbooks | `docs/RUNBOOKS/` |
| Operations | `docs/OPERATIONS/` |
| Incidents | `docs/INCIDENTS/` |
| Baselines | `docs/BASELINES/` |
| Definition of Done | `docs/PROCESS/DEFINITION_OF_DONE.md` |
