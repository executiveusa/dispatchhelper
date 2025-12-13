/**
 * Database TypeScript Types for Spatchy AI
 *
 * Auto-generated types matching the Supabase schema.
 * These provide full type safety when working with the database.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: 'admin' | 'dispatcher' | 'driver';
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: 'admin' | 'dispatcher' | 'driver';
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          role?: 'admin' | 'dispatcher' | 'driver';
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenant_users: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'dispatcher' | 'driver' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'dispatcher' | 'driver' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'dispatcher' | 'driver' | 'member';
          created_at?: string;
        };
      };
      drivers: {
        Row: {
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
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          name: string;
          phone?: string | null;
          email?: string | null;
          license_number?: string | null;
          truck_number?: string | null;
          status?: 'available' | 'assigned' | 'on_route' | 'off_duty' | 'inactive';
          current_location?: string | null;
          location_updated_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          name?: string;
          phone?: string | null;
          email?: string | null;
          license_number?: string | null;
          truck_number?: string | null;
          status?: 'available' | 'assigned' | 'on_route' | 'off_duty' | 'inactive';
          current_location?: string | null;
          location_updated_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      requests: {
        Row: {
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
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          created_by?: string | null;
          load_number?: string | null;
          pickup_location: string;
          pickup_datetime?: string | null;
          dropoff_location: string;
          dropoff_datetime?: string | null;
          cargo_type?: string | null;
          weight?: number | null;
          weight_unit?: string;
          rate?: number | null;
          currency?: string;
          status?: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          broker_name?: string | null;
          broker_contact?: string | null;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          created_by?: string | null;
          load_number?: string | null;
          pickup_location?: string;
          pickup_datetime?: string | null;
          dropoff_location?: string;
          dropoff_datetime?: string | null;
          cargo_type?: string | null;
          weight?: number | null;
          weight_unit?: string;
          rate?: number | null;
          currency?: string;
          status?: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          broker_name?: string | null;
          broker_contact?: string | null;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
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
        };
        Insert: {
          id?: string;
          request_id: string;
          driver_id: string;
          assigned_by?: string | null;
          assigned_at?: string;
          accepted_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          status?: 'assigned' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string | null;
        };
        Update: {
          id?: string;
          request_id?: string;
          driver_id?: string;
          assigned_by?: string | null;
          assigned_at?: string;
          accepted_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          status?: 'assigned' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string | null;
        };
      };
      ai_sessions: {
        Row: {
          id: string;
          tenant_id: string | null;
          user_id: string | null;
          title: string | null;
          model: string;
          context: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          title?: string | null;
          model?: string;
          context?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          title?: string | null;
          model?: string;
          context?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          session_id: string | null;
          role: 'user' | 'assistant' | 'system' | 'tool';
          content: Json;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          role: 'user' | 'assistant' | 'system' | 'tool';
          content: Json;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          role?: 'user' | 'assistant' | 'system' | 'tool';
          content?: Json;
          metadata?: Json;
          created_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: string;
          tenant_id: string | null;
          user_id: string | null;
          entity_type: string;
          entity_id: string | null;
          action: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          entity_type: string;
          entity_id?: string | null;
          action: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          entity_type?: string;
          entity_id?: string | null;
          action?: string;
          details?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
