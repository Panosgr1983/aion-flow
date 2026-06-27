# AION CMS — Deployment Guide

## Environments

### Production
| Service | URL | Branch |
|---------|-----|--------|
| CMS | https://aion-flowv2.vercel.app | `main` |
| Supabase | https://supabase.com/dashboard/project/qhbgptlklsavezxpksao | — |

### Development
| Service | URL | Branch |
|---------|-----|--------|
| CMS | Vercel Preview | feature/release branches |
| Supabase | https://supabase.com/dashboard/project/bqvjstaqqgxzjojwodwr | — |

## Deploy Flow

```
Feature → Develop → Preview → QA → Production
```

### 1. Feature Development
```bash
git checkout develop
git checkout -b feature/my-feature
# work, commit, push
```

### 2. Preview Deploy
```bash
# Vercel auto-deploys preview for PRs
# Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to DEV values
```

### 3. QA
- Verify in preview URL
- Test media upload, content CRUD, tenant switching
- Check console for errors

### 4. Merge to Release
```bash
git checkout release/v0.2
git merge feature/my-feature
# Deploy release branch to Vercel preview
# Run migrations on DEV Supabase
```

### 5. Production
```bash
git checkout main
git merge release/v0.2
# Deploy main to Vercel production
# Run migrations on PROD Supabase (with backup first)
```

## Supabase Migrations

### Apply migrations to DEV
```bash
supabase db push --linked --password "DevPass123!"
```

### Apply migrations to PROD
```bash
supabase link --project-ref PROD_REF
supabase db push --linked --password "ProdPass!"
```

## Environment Variables

```
VITE_SUPABASE_URL=<project_url>
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_ENABLE_MEDIA_MANAGER=false   # Feature flag
```

## Rollback

1. `git revert <commit>` (code)
2. `supabase db push --linked` (reverse migration — γραπτό rollback SQL)
3. Ενημέρωση CHANGELOG
