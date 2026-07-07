# AION CMS — Contributing Guide

## Prerequisites
- Node.js 20+
- npm / yarn
- Supabase CLI (Homebrew: `brew install supabase/tap/supabase`)

## Setup

```bash
git clone https://github.com/Panosgr1983/aion-flow.git
cd aion-flow
npm install
npm run dev
```

### Local Supabase (για migrations & local development)

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Link to Dev project
supabase link --project-ref bqvjstaqqgxzjojwodwr

# 3. Set DATABASE_PASSWORD via environment (not hardcoded)
export DATABASE_PASSWORD=<your_dev_db_password>

# 4. Pull latest migrations
supabase db pull

# 5. Apply migrations locally
supabase db push --linked --password "$DATABASE_PASSWORD"
```

> **Σημείωση:** Το AION έχει built-in mock data (`mockData.ts`).  
> Η εφαρμογή τρέχει χωρίς Supabase connection — χρήσιμο για UI development.  
> Για full testing, link to the Dev Supabase project (όχι Production).

## Development Flow

1. Κάνε fork ή checkout feature branch από `develop`
2. Γράψε migration (αν χρειάζεται schema change)
3. Υλοποίησε το feature
4. Test σε dev environment
5. Δημιούργησε PR στο `develop`

## Code Review Checklist

- [ ] Tests pass
- [ ] TypeScript compiles (`tsc --noEmit`)
- [ ] No console.log or debug code
- [ ] ErrorBoundary added
- [ ] Feature flagged if risky
- [ ] Migration testable (up + down)
- [ ] Greek comments added
- [ ] Telemetry event added (αν νέο user-facing action)
- [ ] CHANGELOG updated

## Architecture Decision

Αν η αλλαγή σου επηρεάζει την αρχιτεκτονική, γράψε ADR στο
`docs/DECISIONS.md`. Δες τα υπάρχοντα ADRs για παράδειγμα.

## Deployment

Δες `docs/DEPLOYMENT.md` για το release flow.
