-- Spatchy AI Row-Level Security (RLS) Policies
-- Ensures data isolation and proper access control

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Anyone can view basic profile info (for display purposes)
CREATE POLICY "Public profiles viewable"
  ON public.profiles
  FOR SELECT
  USING (true);

-- =====================================================
-- TENANTS POLICIES
-- =====================================================

-- Users can view tenants they belong to
CREATE POLICY "Users can view their tenants"
  ON public.tenants
  FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Tenant owners can update tenant
CREATE POLICY "Owners can update tenant"
  ON public.tenants
  FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Authenticated users can create tenants
CREATE POLICY "Authenticated users can create tenants"
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- TENANT_USERS POLICIES
-- =====================================================

-- Users can view tenant memberships for their tenants
CREATE POLICY "Users can view tenant memberships"
  ON public.tenant_users
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Tenant admins can manage memberships
CREATE POLICY "Admins can manage memberships"
  ON public.tenant_users
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- DRIVERS POLICIES
-- =====================================================

-- Users can view drivers in their tenant
CREATE POLICY "Users can view tenant drivers"
  ON public.drivers
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Dispatchers and admins can create drivers
CREATE POLICY "Dispatchers can create drivers"
  ON public.drivers
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
    )
  );

-- Dispatchers and admins can update drivers
CREATE POLICY "Dispatchers can update drivers"
  ON public.drivers
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
    )
  );

-- Drivers can update their own record
CREATE POLICY "Drivers can update own record"
  ON public.drivers
  FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- REQUESTS POLICIES
-- =====================================================

-- Users can view requests in their tenant
CREATE POLICY "Users can view tenant requests"
  ON public.requests
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Dispatchers can create requests
CREATE POLICY "Dispatchers can create requests"
  ON public.requests
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
    )
  );

-- Dispatchers can update requests
CREATE POLICY "Dispatchers can update requests"
  ON public.requests
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
    )
  );

-- Request creators can update their own requests
CREATE POLICY "Creators can update own requests"
  ON public.requests
  FOR UPDATE
  USING (created_by = auth.uid());

-- =====================================================
-- ASSIGNMENTS POLICIES
-- =====================================================

-- Users can view assignments in their tenant
CREATE POLICY "Users can view tenant assignments"
  ON public.assignments
  FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM public.requests
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_users
        WHERE user_id = auth.uid()
      )
    )
  );

-- Dispatchers can create assignments
CREATE POLICY "Dispatchers can create assignments"
  ON public.assignments
  FOR INSERT
  WITH CHECK (
    request_id IN (
      SELECT id FROM public.requests
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_users
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
      )
    )
  );

-- Dispatchers can update assignments
CREATE POLICY "Dispatchers can update assignments"
  ON public.assignments
  FOR UPDATE
  USING (
    request_id IN (
      SELECT id FROM public.requests
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_users
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'dispatcher')
      )
    )
  );

-- Drivers can update their own assignments (accept/decline)
CREATE POLICY "Drivers can update own assignments"
  ON public.assignments
  FOR UPDATE
  USING (
    driver_id IN (
      SELECT id FROM public.drivers
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- AI_SESSIONS POLICIES
-- =====================================================

-- Users can view their own AI sessions
CREATE POLICY "Users can view own sessions"
  ON public.ai_sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can view sessions in their tenant
CREATE POLICY "Users can view tenant sessions"
  ON public.ai_sessions
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- Users can create AI sessions
CREATE POLICY "Users can create sessions"
  ON public.ai_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON public.ai_sessions
  FOR UPDATE
  USING (user_id = auth.uid());

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Users can view messages from their sessions
CREATE POLICY "Users can view session messages"
  ON public.messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.ai_sessions
      WHERE user_id = auth.uid()
    )
  );

-- Users can create messages in their sessions
CREATE POLICY "Users can create messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.ai_sessions
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- ACTIVITY_LOG POLICIES
-- =====================================================

-- Users can view activity logs for their tenant
CREATE POLICY "Users can view tenant activity"
  ON public.activity_log
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid()
    )
  );

-- System can insert activity logs
CREATE POLICY "System can create activity logs"
  ON public.activity_log
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
  ON public.activity_log
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_users
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
