# Method Template

**Part of AKES v1 — 04_METHODS/**

---

```
---
id: method.<category>.<name>
title: <Method Title>
domain: methods
type: method
status: experimental | validated | standard | deprecated | rejected
maturity: experimental | validated | standard
source_of_truth: true
owner: AION Engineering
tags:
  - <tag1>
  - <tag2>
related:
  - <related doc id>
used_by:
  - <tenant1>
  - <tenant2>
last_reviewed: YYYY-MM-DD
review_after: YYYY-MM-DD
---

# Method: <Title>

## Problem
Τι πρόβλημα λύνει;

## Context
Σε ποιο project/tenant εφαρμόστηκε;

## Prerequisites
Τι χρειάζεται για να λειτουργήσει;

## Implementation
Ποια βήματα ακολουθήθηκαν;

## Files / Components
Ποια αρχεία ή modules επηρεάζει;

## Validation
Πώς δοκιμάστηκε;

### Test Cases
- [ ] Super admin
- [ ] Tenant admin
- [ ] Empty state
- [ ] Direct URL
- [ ] RLS / tenant isolation
- [ ] Refresh
- [ ] Logout/login
- [ ] Mobile
- [ ] Production build

## Results
Τι δούλεψε;
Τι δεν δούλεψε;

## Known Risks
Πιθανά προβλήματα.

## Reusable
Yes / No / Conditional

## Reuse Conditions
Πότε επιτρέπεται να χρησιμοποιηθεί ξανά;

## Projects Used
- Tenant 1
- Tenant 2

## Decision
Adopt / Revise / Reject

## Approved By
Date:
```

## Validation Pipeline

```
Experimental
  ↓
Local test (dev environment)
  ↓
Integration test (with existing modules)
  ↓
Tenant isolation test (no cross-tenant leaks)
  ↓
Regression test (existing features unaffected)
  ↓
Production-like validation
  ↓
Approval
  ↓
Validated
  ↓
Use in 2nd project/tenant
  ↓
Standard method
```

## Promotion Rules

| From | To | Requirement |
|------|----|-------------|
| Experimental | Validated | Full validation pipeline + approval |
| Validated | Standard | 2+ independent tenants OR platform-wide validation |
| Standard | Deprecated | Replacement method available |
| Deprecated | Rejected | No longer safe/relevant |

**Exception:** Platform-level methods (security, deployment, documentation) can become standard without 2 tenants IF they pass platform-wide validation.
