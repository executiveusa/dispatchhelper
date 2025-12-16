# Tenancy Concept

## Critical Rule: Tenant Isolation is Non-Negotiable

Every database operation MUST enforce tenant isolation. This is the foundational security principle of Spatchy AI.

## Requirements

### 1. Explicit tenant_id in All Queries

**NEVER** run a "naked" query on multi-tenant tables:

```typescript
// ❌ WRONG - No tenant filter
supabase.from('loads').select('*')

// ✅ CORRECT - Always filter by tenant
supabase.from('loads').select('*').eq('tenant_id', tenantId)
```

### 2. Service Layer Convention

All database helper functions MUST require `tenantId` as an argument:

```typescript
// ❌ WRONG - Optional tenantId
export async function getLoads(tenantId?: string) { ... }

// ✅ CORRECT - Required tenantId
export async function getLoads(tenantId: string) { ... }
```

### 3. Edge Function Validation

Every edge function MUST:

1. Extract and validate `tenant_id` from request
2. Verify the acting user belongs to that tenant
3. Include `tenant_id` in all database operations
4. Refuse to act if validation fails

```typescript
// Validate user belongs to tenant
const { data: membership } = await supabase
  .from('tenant_users')
  .select('*')
  .eq('tenant_id', tenantId)
  .eq('user_id', userId)
  .single();

if (!membership) {
  throw new Error('User does not belong to this tenant');
}
```

### 4. AI Tool Tenant Enforcement

When AI calls tools like `create_load`, `assign_driver`:

- Tool implementation MUST accept `tenant_id` as argument
- Tool MUST assert the acting `user_id` belongs to that tenant
- Tool MUST refuse to act if the join fails

## RLS as Primary Defense

Row-Level Security policies are the primary defense mechanism. However:

- **DO NOT** rely on RLS alone
- Always filter by `tenant_id` in application code
- Treat RLS as defense-in-depth, not the only layer

## Testing Requirements

Before any production deployment:

1. **Cross-tenant read test**: Tenant A user tries to read Tenant B data → must fail
2. **Cross-tenant write test**: Tenant A user tries to write to Tenant B → must fail
3. **Role-based access test**: Verify dispatcher vs driver vs viewer permissions
4. **AI tool isolation test**: AI action for Tenant A must never affect Tenant B

## When in Doubt

**Always choose isolation over convenience.**

If you're unsure whether a query needs tenant filtering, it does.
