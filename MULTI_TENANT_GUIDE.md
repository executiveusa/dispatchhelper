# Multi-Tenant Architecture Guide

## Overview

Spatchy AI is designed as a multi-tenant SaaS application, allowing multiple dispatch organizations to use the platform while maintaining complete data isolation.

## Architecture

### Database Schema

The multi-tenant architecture is built on three core tables:

1. **tenants** - Organizations/companies
   - `id` - Unique tenant identifier
   - `name` - Organization name
   - `slug` - URL-friendly identifier
   - `settings` - Tenant-specific configuration (JSONB)

2. **tenant_users** - User-to-tenant memberships
   - `tenant_id` - Reference to tenant
   - `user_id` - Reference to user profile
   - `role` - User's role within the tenant (owner, admin, dispatcher, driver, member)

3. **profiles** - User profiles (extends auth.users)
   - Linked to Supabase auth.users
   - Contains user metadata and global role

### Data Isolation

All core data tables include a `tenant_id` column:
- `requests`
- `drivers`
- `ai_sessions`
- `activity_log`

Row-Level Security (RLS) policies ensure users can only access data for tenants they belong to.

## Implementation

### Frontend Context

The `TenantContext` provides:
- `currentTenant` - Currently selected tenant
- `tenants` - All tenants user belongs to
- `setCurrentTenant()` - Switch between tenants

### Tenant Switcher UI

Located in `src/components/tenant/TenantSwitcher.tsx`, allows users to:
- View all organizations they belong to
- Switch between tenants
- Create new organizations

### Service Layer

All service functions accept an optional `tenantId` parameter:

```typescript
// Example: Fetch requests for a specific tenant
const requests = await getRequests(tenantId);

// Example: Create driver in current tenant
const driver = await createDriver(driverData, tenantId);
```

### Hooks

Hooks automatically use the current tenant context:

```typescript
const { currentTenant } = useTenant();
const { data: requests } = useRequests(currentTenant?.id);
```

## Usage

### For Developers

1. **Wrap your app with TenantProvider:**

```tsx
<TenantProvider>
  <App />
</TenantProvider>
```

2. **Use tenant context in components:**

```tsx
import { useTenant } from '@/context/TenantContext';

function MyComponent() {
  const { currentTenant, tenants } = useTenant();

  // Use currentTenant.id for API calls
  const { data } = useRequests(currentTenant?.id);
}
```

3. **Always scope queries by tenant:**

```typescript
// Good
supabase.from('requests').select('*').eq('tenant_id', tenantId);

// Bad - will leak data across tenants
supabase.from('requests').select('*');
```

### For End Users

1. **Creating an Organization:**
   - New users are prompted to create their first organization
   - Organization owners can invite team members

2. **Switching Organizations:**
   - Use the tenant switcher in the navbar
   - Current selection persists in localStorage

3. **User Roles:**
   - **Owner**: Full control, can delete organization
   - **Admin**: Manage members, settings, full data access
   - **Dispatcher**: Create/manage requests and drivers
   - **Driver**: View assignments, update status
   - **Member**: Read-only access

## Security

### Row-Level Security (RLS)

All tables have RLS enabled with policies that:
- Verify user belongs to tenant
- Enforce role-based permissions
- Prevent cross-tenant data leakage

### API Security

Edge functions validate:
- User authentication (JWT)
- Tenant membership
- Role permissions

## Best Practices

1. **Always filter by tenant_id** in queries
2. **Never trust client-side tenant selection** - always validate server-side
3. **Use RLS policies** as primary security mechanism
4. **Test cross-tenant isolation** thoroughly
5. **Audit logs** should capture tenant_id for all operations

## Future Enhancements

- [ ] Tenant-specific branding (logos, colors)
- [ ] Billing integration (per-tenant subscriptions)
- [ ] Usage quotas and limits
- [ ] Tenant analytics and reporting
- [ ] Cross-tenant data sharing (controlled)
- [ ] Tenant backup and export

## Migration Path

For single-tenant to multi-tenant migration:

1. Create default tenant for existing data
2. Assign all users to default tenant
3. Update all records with default `tenant_id`
4. Enable RLS policies
5. Test data isolation
6. Allow tenant creation

## Troubleshooting

**Users can't see data:**
- Verify user is member of tenant (`tenant_users` table)
- Check RLS policies are correct
- Ensure `tenant_id` is set on queries

**Cross-tenant data leakage:**
- Review RLS policies
- Check all queries filter by `tenant_id`
- Audit edge functions for tenant validation

**Performance issues:**
- Add indexes on `tenant_id` columns
- Use `tenant_id` in all WHERE clauses
- Consider tenant sharding for very large deployments
