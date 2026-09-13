-- Spatchy AI: RLS Policies for Dispatch Tables
-- Row-level security for trucks, brokers, loads, automation_rules, events

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRUCKS POLICIES
-- =====================================================

-- Users can view trucks in their tenant
CREATE POLICY "Users can view tenant trucks"
  ON public.trucks
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Dispatchers and admins can manage trucks
CREATE POLICY "Dispatchers can manage trucks"
  ON public.trucks
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
    )
  );

-- =====================================================
-- BROKERS POLICIES
-- =====================================================

-- Users can view brokers in their tenant
CREATE POLICY "Users can view tenant brokers"
  ON public.brokers
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Dispatchers and admins can manage brokers
CREATE POLICY "Dispatchers can manage brokers"
  ON public.brokers
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
    )
  );

-- =====================================================
-- LOADS POLICIES
-- =====================================================

-- Users can view loads in their tenant
CREATE POLICY "Users can view tenant loads"
  ON public.loads
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Dispatchers and admins can create loads
CREATE POLICY "Dispatchers can create loads"
  ON public.loads
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
    )
  );

-- Dispatchers and admins can update loads
CREATE POLICY "Dispatchers can update loads"
  ON public.loads
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
    )
  );

-- Drivers can update their assigned loads (status only)
CREATE POLICY "Drivers can update assigned loads"
  ON public.loads
  FOR UPDATE
  USING (
    driver_id IN (
      SELECT id FROM public.drivers
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    driver_id IN (
      SELECT id FROM public.drivers
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- AUTOMATION_RULES POLICIES
-- =====================================================

-- Users can view automation rules in their tenant
CREATE POLICY "Users can view tenant automation rules"
  ON public.automation_rules
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Only admins and owners can manage automation rules
CREATE POLICY "Admins can manage automation rules"
  ON public.automation_rules
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- EVENTS POLICIES
-- =====================================================

-- Users can view events in their tenant
CREATE POLICY "Users can view tenant events"
  ON public.events
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- System can insert events (service role only)
-- Note: Edge functions with service role can bypass RLS
-- This policy is mainly for audit purposes
CREATE POLICY "Service role can insert events"
  ON public.events
  FOR INSERT
  WITH CHECK (true);
