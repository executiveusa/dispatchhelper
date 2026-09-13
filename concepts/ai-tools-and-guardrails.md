# AI Tools and Guardrails Concept

## Core Principle: Guardrails, Not Vibes

AI automation must be **explainable, debuggable, and controllable** at all times.

## Two-Mode Operation

Every AI tool MUST support two modes:

### Mode A: suggest_only (Default)
- AI returns proposed actions
- Does NOT commit changes to database
- Dispatcher must explicitly approve
- Safe for initial rollout

### Mode B: auto_act (Opt-in)
- AI actually writes to database
- Only enabled after testing in suggest_only mode
- Must have clear override mechanisms
- Can be paused via kill switch

## Implementation Pattern

```typescript
interface AIToolConfig {
  mode: 'suggest_only' | 'auto_act';
  tenant_id: string;
  user_id: string;
}

async function createLoad(config: AIToolConfig, loadData: LoadInput) {
  // 1. Validate tenant membership
  await validateTenantMembership(config.tenant_id, config.user_id);
  
  if (config.mode === 'suggest_only') {
    // 2a. Return suggestion without writing
    return {
      action: 'create_load',
      proposed: loadData,
      reasoning: 'AI explanation here',
      requires_approval: true
    };
  } else {
    // 2b. Execute action
    const result = await supabase.from('loads').insert({
      ...loadData,
      tenant_id: config.tenant_id,
      created_by: config.user_id
    });
    
    // 3. Log the action
    await logAIAction({
      tenant_id: config.tenant_id,
      user_id: config.user_id,
      action: 'create_load',
      inputs: loadData,
      outputs: result,
      timestamp: new Date()
    });
    
    return result;
  }
}
```

## Logging Requirements

For EVERY AI action, log:

1. `tenant_id` - Which organization
2. `user_id` - Which dispatcher (or system)
3. `tool_name` - Which AI tool was called
4. `inputs` - What parameters were provided
5. `outputs` - What was the result
6. `timestamp` - When it happened
7. `reasoning` - Human-readable explanation

Store in `events` table with type `ai_action`:

```typescript
await supabase.from('events').insert({
  tenant_id,
  event_type: 'ai_action',
  description: 'AI reassigned Load L123 from Driver Ana to Driver Maya',
  metadata: {
    tool_name: 'assign_driver',
    inputs: { load_id: 'L123', driver_id: 'D456' },
    outputs: { success: true },
    reasoning: 'Driver Maya is closer to pickup location and has available HOS'
  },
  created_at: new Date()
});
```

## Kill Switch

The dispatcher dashboard MUST display:

1. **Automation Status Widget** - Always visible
2. **Pause All Automations Button** - Red, prominent
3. **Visual Indicator** - Green = active, Red = paused

When paused:
- Edge functions MUST check automation status
- NO auto-write operations allowed
- AI can only log suggestions
- Clear message: "Automation paused by [dispatcher name]"

## Explainability

Every AI action must include:

- **What** - Clear description of action taken
- **Why** - Reasoning in plain language
- **When** - Timestamp
- **Who** - Which AI tool, triggered by whom
- **Impact** - What changed

## Security Requirements

1. **Tenant Isolation** - AI tools must never cross tenants
2. **Prompt Injection Protection** - Sanitize user inputs
3. **Tool Whitelisting** - Only approved tools, no arbitrary code execution
4. **Rate Limiting** - Prevent abuse and runaway costs
5. **Token Limits** - Per-tenant and global caps

## Cost Controls

Add guardrails:

```typescript
interface TenantLimits {
  max_ai_calls_per_day: number;
  max_tokens_per_day: number;
  hard_timeout_seconds: number;
}

// Check before AI call
const usage = await checkTenantUsage(tenant_id);
if (usage.calls_today >= limits.max_ai_calls_per_day) {
  throw new Error('Daily AI call limit reached');
}
```

## Testing Requirements

Before production:

1. AI tool MUST NOT affect other tenants
2. suggest_only mode MUST NOT write to database
3. auto_act mode MUST log all actions
4. Kill switch MUST prevent all auto-writes
5. Cost limits MUST be enforced

## Debugging

If you cannot easily describe:
- What the AI did
- Why it did it
- What data it touched

Then the design is wrong. Make it debuggable.
