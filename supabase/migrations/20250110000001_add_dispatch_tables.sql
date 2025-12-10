-- Spatchy AI: Additional Dispatch Tables Migration
-- Adds trucks, brokers, loads, automation_rules, and events tables
-- following the architectural specification

-- =====================================================
-- TRUCKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  identifier TEXT NOT NULL, -- Truck number/name
  equipment_type TEXT, -- e.g., 'dry van', 'reefer', 'flatbed'
  plate TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BROKERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mc_number TEXT,
  contact JSONB DEFAULT '{}', -- {email, phone, address, etc}
  trust_score NUMERIC DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LOADS TABLE
-- =====================================================
-- Enhanced version of requests table with additional dispatch fields
CREATE TABLE IF NOT EXISTS public.loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Relations
  broker_id UUID REFERENCES public.brokers(id) ON DELETE SET NULL,
  truck_id UUID REFERENCES public.trucks(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  
  -- Load Details
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_time TIMESTAMPTZ,
  dropoff_time TIMESTAMPTZ,
  
  -- Status & Workflow
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'quoted', 'booked', 'in_transit', 'delivered', 'cancelled', 'problem')),
  
  -- Pricing
  rate NUMERIC,
  currency TEXT DEFAULT 'USD',
  
  -- Load Metadata
  reference TEXT, -- Load/BOL number
  lane_key TEXT, -- For lane analytics (e.g., 'ATL-CHI')
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUTOMATION_RULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- e.g., 'load.status_change', 'driver.location_update'
  config JSONB NOT NULL DEFAULT '{}', -- Rule configuration and conditions
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENTS TABLE
-- =====================================================
-- Audit trail and workflow event log
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  entity_table TEXT, -- e.g., 'loads', 'drivers'
  entity_id UUID,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Trucks
CREATE INDEX idx_trucks_tenant ON public.trucks(tenant_id);
CREATE INDEX idx_trucks_identifier ON public.trucks(identifier);

-- Brokers
CREATE INDEX idx_brokers_tenant ON public.brokers(tenant_id);
CREATE INDEX idx_brokers_mc_number ON public.brokers(mc_number);
CREATE INDEX idx_brokers_trust_score ON public.brokers(trust_score);

-- Loads
CREATE INDEX idx_loads_tenant ON public.loads(tenant_id);
CREATE INDEX idx_loads_status ON public.loads(status);
CREATE INDEX idx_loads_broker ON public.loads(broker_id);
CREATE INDEX idx_loads_truck ON public.loads(truck_id);
CREATE INDEX idx_loads_driver ON public.loads(driver_id);
CREATE INDEX idx_loads_lane_key ON public.loads(lane_key);
CREATE INDEX idx_loads_created ON public.loads(created_at DESC);
CREATE INDEX idx_loads_pickup_time ON public.loads(pickup_time);

-- Automation Rules
CREATE INDEX idx_automation_rules_tenant ON public.automation_rules(tenant_id);
CREATE INDEX idx_automation_rules_event_type ON public.automation_rules(event_type);
CREATE INDEX idx_automation_rules_enabled ON public.automation_rules(enabled);

-- Events
CREATE INDEX idx_events_tenant ON public.events(tenant_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_entity ON public.events(entity_table, entity_id);
CREATE INDEX idx_events_created ON public.events(created_at DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER set_updated_at_trucks BEFORE UPDATE ON public.trucks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_brokers BEFORE UPDATE ON public.brokers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_loads BEFORE UPDATE ON public.loads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_automation_rules BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
