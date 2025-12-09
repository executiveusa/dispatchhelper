/**
 * Tenant Context
 *
 * Manages the current tenant selection for multi-tenant support
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserTenants } from '../services/tenants';
import type { Tenant } from '../types';

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  setCurrentTenant: (tenant: Tenant | null) => void;
  loading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setTenants([]);
      setCurrentTenant(null);
      setLoading(false);
      return;
    }

    loadUserTenants();
  }, [user]);

  const loadUserTenants = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const userTenants = await getUserTenants(user.id);
      setTenants(userTenants);

      // Auto-select first tenant if none selected
      if (userTenants.length > 0 && !currentTenant) {
        // Try to restore from localStorage
        const savedTenantId = localStorage.getItem('currentTenantId');
        const savedTenant = userTenants.find((t) => t.id === savedTenantId);

        setCurrentTenant(savedTenant || userTenants[0]);
      }
    } catch (err) {
      console.error('Error loading tenants:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrentTenant = (tenant: Tenant | null) => {
    setCurrentTenant(tenant);

    // Save to localStorage
    if (tenant) {
      localStorage.setItem('currentTenantId', tenant.id);
    } else {
      localStorage.removeItem('currentTenantId');
    }
  };

  const value = {
    currentTenant,
    tenants,
    setCurrentTenant: handleSetCurrentTenant,
    loading,
    error,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
