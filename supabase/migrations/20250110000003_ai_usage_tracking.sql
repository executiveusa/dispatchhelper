-- AI Usage Tracking Migration
-- Tracks AI call usage per tenant for cost control and monitoring

-- =====================================================
-- AI_USAGE_LOG TABLE
-- =====================================================
-- Logs every AI API call with token usage
CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Call details
  provider TEXT NOT NULL CHECK (provider IN ('anthropic', 'openai', 'other')),
  model TEXT NOT NULL,
  function_name TEXT NOT NULL, -- Which edge function
  
  -- Usage metrics
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  
  -- Cost estimation (in cents)
  estimated_cost NUMERIC(10,4) DEFAULT 0.0,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'timeout')),
  error_message TEXT,
  
  -- Timing
  duration_ms INTEGER, -- How long the call took
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant ON public.ai_usage_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON public.ai_usage_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tenant_date ON public.ai_usage_log(tenant_id, created_at DESC);

-- =====================================================
-- TENANT LIMITS TABLE
-- =====================================================
-- Per-tenant quotas and limits
CREATE TABLE IF NOT EXISTS public.tenant_limits (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Daily limits
  max_ai_calls_per_day INTEGER DEFAULT 1000,
  max_tokens_per_day INTEGER DEFAULT 100000,
  max_cost_per_day NUMERIC(10,2) DEFAULT 50.00, -- in dollars
  
  -- Rate limits
  max_calls_per_minute INTEGER DEFAULT 10,
  max_concurrent_calls INTEGER DEFAULT 3,
  
  -- Timeouts
  ai_call_timeout_seconds INTEGER DEFAULT 60,
  
  -- Features
  ai_enabled BOOLEAN DEFAULT true,
  auto_act_allowed BOOLEAN DEFAULT false, -- Must be explicitly enabled
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HELPER FUNCTION: Check usage limits
-- =====================================================
CREATE OR REPLACE FUNCTION check_tenant_ai_limits(
  p_tenant_id UUID,
  p_estimated_tokens INTEGER DEFAULT 1000
) RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  current_calls INTEGER,
  current_tokens INTEGER,
  current_cost NUMERIC
) AS $$
DECLARE
  v_limits RECORD;
  v_today_start TIMESTAMPTZ := date_trunc('day', NOW());
  v_current_calls INTEGER;
  v_current_tokens INTEGER;
  v_current_cost NUMERIC;
BEGIN
  -- Get tenant limits
  SELECT * INTO v_limits
  FROM public.tenant_limits
  WHERE tenant_id = p_tenant_id;
  
  -- If no limits set, use defaults
  IF v_limits IS NULL THEN
    v_limits := ROW(
      p_tenant_id,
      1000, -- max_ai_calls_per_day
      100000, -- max_tokens_per_day
      50.00, -- max_cost_per_day
      10, -- max_calls_per_minute
      3, -- max_concurrent_calls
      60, -- ai_call_timeout_seconds
      true, -- ai_enabled
      false, -- auto_act_allowed
      NOW(),
      NOW()
    )::public.tenant_limits;
  END IF;
  
  -- Check if AI is enabled
  IF NOT v_limits.ai_enabled THEN
    RETURN QUERY SELECT false, 'AI is disabled for this tenant'::TEXT, 0, 0, 0.0;
    RETURN;
  END IF;
  
  -- Get today's usage
  SELECT 
    COUNT(*)::INTEGER,
    COALESCE(SUM(total_tokens), 0)::INTEGER,
    COALESCE(SUM(estimated_cost), 0)::NUMERIC
  INTO v_current_calls, v_current_tokens, v_current_cost
  FROM public.ai_usage_log
  WHERE tenant_id = p_tenant_id
    AND created_at >= v_today_start;
  
  -- Check call limit
  IF v_current_calls >= v_limits.max_ai_calls_per_day THEN
    RETURN QUERY SELECT 
      false, 
      'Daily AI call limit reached'::TEXT,
      v_current_calls,
      v_current_tokens,
      v_current_cost;
    RETURN;
  END IF;
  
  -- Check token limit
  IF v_current_tokens + p_estimated_tokens > v_limits.max_tokens_per_day THEN
    RETURN QUERY SELECT 
      false, 
      'Daily token limit would be exceeded'::TEXT,
      v_current_calls,
      v_current_tokens,
      v_current_cost;
    RETURN;
  END IF;
  
  -- Check cost limit (convert cents to dollars)
  IF v_current_cost / 100.0 >= v_limits.max_cost_per_day THEN
    RETURN QUERY SELECT 
      false, 
      'Daily cost limit reached'::TEXT,
      v_current_calls,
      v_current_tokens,
      v_current_cost;
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    true, 
    'OK'::TEXT,
    v_current_calls,
    v_current_tokens,
    v_current_cost;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- HELPER FUNCTION: Log AI usage
-- =====================================================
CREATE OR REPLACE FUNCTION log_ai_usage(
  p_tenant_id UUID,
  p_user_id UUID,
  p_provider TEXT,
  p_model TEXT,
  p_function_name TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_status TEXT,
  p_duration_ms INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_total_tokens INTEGER;
  v_estimated_cost NUMERIC;
  v_log_id UUID;
BEGIN
  v_total_tokens := p_input_tokens + p_output_tokens;
  
  -- Rough cost estimation (adjust based on actual pricing)
  -- Claude 3.5 Sonnet: ~$3/$15 per 1M tokens (input/output)
  -- Simplified: ~$9 per 1M tokens average
  v_estimated_cost := (v_total_tokens::NUMERIC / 1000000.0) * 9.0 * 100.0; -- in cents
  
  INSERT INTO public.ai_usage_log (
    tenant_id,
    user_id,
    provider,
    model,
    function_name,
    input_tokens,
    output_tokens,
    total_tokens,
    estimated_cost,
    status,
    duration_ms,
    error_message,
    metadata
  ) VALUES (
    p_tenant_id,
    p_user_id,
    p_provider,
    p_model,
    p_function_name,
    p_input_tokens,
    p_output_tokens,
    v_total_tokens,
    v_estimated_cost,
    p_status,
    p_duration_ms,
    p_error_message,
    p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_limits ENABLE ROW LEVEL SECURITY;

-- Users can view usage for their tenants
CREATE POLICY "Users can view tenant AI usage"
  ON public.ai_usage_log
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Service role can insert usage logs
CREATE POLICY "Service role can insert AI usage"
  ON public.ai_usage_log
  FOR INSERT
  WITH CHECK (true);

-- Users can view limits for their tenants
CREATE POLICY "Users can view tenant limits"
  ON public.tenant_limits
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can manage limits
CREATE POLICY "Admins can manage tenant limits"
  ON public.tenant_limits
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.ai_usage_log IS 'Logs all AI API calls with token usage for cost tracking and monitoring';
COMMENT ON TABLE public.tenant_limits IS 'Per-tenant quotas and rate limits for AI usage';
COMMENT ON FUNCTION check_tenant_ai_limits IS 'Checks if a tenant can make an AI call based on their limits';
COMMENT ON FUNCTION log_ai_usage IS 'Logs an AI usage event with automatic cost calculation';
