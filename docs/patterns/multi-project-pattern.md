# Multi-Project Pattern — AION Flow

## Vision

Το AION Flow μπορεί να διαχειρίζεται πολλαπλά ανεξάρτητα projects (sites), όχι μόνο tenants.

## Architecture

```
AION Flow (CMS — aion-flow-v2)
  ├── Tenant A: kolokotronis-pshychologist-main
  │     └── External project (Cloudflare Workers)
  ├── Tenant B: dionisis-xanthos
  │     └── Reference project (Vercel)
  └── Tenant C: (future)
        └── External project (any platform)
```

## External Project Connection

```typescript
interface ExternalProject {
  name: string;
  type: 'cloudflare-worker' | 'vercel' | 'custom';
  connection_url: string;
  api_key?: string;
  worker_url?: string;
  supabase_url?: string;
  supabase_anon_key?: string;
  notes?: string;
}
```

Stored in `tenants.external_project` JSONB field.

## Shared Supabase Model

- Μία shared Supabase instance: `qhbgptlklsavezxpksao.supabase.co`
- Table isolation via `tenant_id` on every table
- External projects can use same or different Supabase instances
- `multiProjectClient.ts` provides connection management
