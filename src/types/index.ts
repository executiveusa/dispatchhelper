/**
 * Spatchy AI - Core TypeScript Types
 *
 * Centralized type definitions for the entire application
 */

// Database types (re-export from database.types.ts)
export type { Database } from '../lib/database.types';

// Domain Models
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'dispatcher' | 'driver';
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  license_number: string | null;
  truck_number: string | null;
  status: 'available' | 'assigned' | 'on_route' | 'off_duty' | 'inactive';
  current_location: string | null;
  location_updated_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  tenant_id: string | null;
  created_by: string | null;
  load_number: string | null;
  pickup_location: string;
  pickup_datetime: string | null;
  dropoff_location: string;
  dropoff_datetime: string | null;
  cargo_type: string | null;
  weight: number | null;
  weight_unit: string;
  rate: number | null;
  currency: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  broker_name: string | null;
  broker_contact: string | null;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  request_id: string;
  driver_id: string;
  assigned_by: string | null;
  assigned_at: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  status: 'assigned' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
}

export interface AISession {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  title: string | null;
  model: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string | null;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: any;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

// Form types for creating/updating entities
export interface CreateRequestInput {
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime?: string;
  dropoff_datetime?: string;
  cargo_type?: string;
  weight?: number;
  weight_unit?: string;
  rate?: number;
  currency?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  broker_name?: string;
  broker_contact?: string;
  notes?: string;
}

export interface UpdateRequestInput {
  pickup_location?: string;
  dropoff_location?: string;
  pickup_datetime?: string;
  dropoff_datetime?: string;
  cargo_type?: string;
  weight?: number;
  rate?: number;
  status?: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  broker_name?: string;
  broker_contact?: string;
  notes?: string;
}

export interface CreateDriverInput {
  name: string;
  phone?: string;
  email?: string;
  license_number?: string;
  truck_number?: string;
  notes?: string;
}

export interface UpdateDriverInput {
  name?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  truck_number?: string;
  status?: 'available' | 'assigned' | 'on_route' | 'off_duty' | 'inactive';
  current_location?: string;
  notes?: string;
}

export interface AssignDriverInput {
  request_id: string;
  driver_id: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
