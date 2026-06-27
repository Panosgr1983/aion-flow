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
- [ ] CHANGELOG updated

## Architecture Decision

Αν η αλλαγή σου επηρεάζει την αρχιτεκτονική, γράψε ADR στο
`docs/DECISIONS.md`. Δες τα υπάρχοντα ADRs για παράδειγμα.

## Deployment

Δες `docs/DEPLOYMENT.md` για το release flow.
