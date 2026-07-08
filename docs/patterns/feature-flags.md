# Feature Flags — AION Flow

## Vision

Σύστημα feature flags για έλεγχο πρόσβασης ανά tenant.

## Database

```sql
CREATE TABLE tenant_features (
  id UUID PK,
  tenant_id UUID REFERENCES tenants(id),
  feature TEXT,          -- 'cms', 'crm', 'portfolio_module'
  enabled BOOLEAN,
  UNIQUE(tenant_id, feature)
);
```

## Available Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| cms | core | true | Content management |
| crm | core | true | Inbox + Pipeline |
| inbox | core | true | Contact inbox |
| pipeline | core | true | Lead pipeline |
| email_workspace | core | true | Email compose |
| eshop | optional | false | E-commerce |
| bookings | optional | false | Booking system |
| portfolio_module | optional | false | Portfolio/Artist module |

## Flow

```
User → Tenant → tenant_features table → featureMap → canAccess() → UI visibility
```

## Super Admin

Super Admin bypasses ALL feature flags. All features always visible.
