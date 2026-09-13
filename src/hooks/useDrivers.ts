/**
 * useDrivers Hook
 *
 * React Query hooks for managing drivers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as driverService from '../services/drivers';
import type { CreateDriverInput, UpdateDriverInput, Driver } from '../types';
import { toast } from 'sonner';

/**
 * Fetch all drivers
 */
export function useDrivers(tenantId?: string) {
  return useQuery({
    queryKey: ['drivers', tenantId],
    queryFn: () => driverService.getDrivers(tenantId),
  });
}

/**
 * Fetch a single driver
 */
export function useDriver(id: string) {
  return useQuery({
    queryKey: ['drivers', id],
    queryFn: () => driverService.getDriver(id),
    enabled: !!id,
  });
}

/**
 * Fetch available drivers
 */
export function useAvailableDrivers(tenantId?: string) {
  return useQuery({
    queryKey: ['drivers', 'available', tenantId],
    queryFn: () => driverService.getAvailableDrivers(tenantId),
  });
}

/**
 * Create a new driver
 */
export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDriverInput & { tenantId?: string }) =>
      driverService.createDriver(data, data.tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create driver');
    },
  });
}

/**
 * Update a driver
 */
export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDriverInput }) =>
      driverService.updateDriver(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers', variables.id] });
      toast.success('Driver updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update driver');
    },
  });
}

/**
 * Delete a driver
 */
export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => driverService.deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete driver');
    },
  });
}

/**
 * Update driver status
 */
export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Driver['status'] }) =>
      driverService.updateDriverStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers', variables.id] });
      toast.success('Driver status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update driver status');
    },
  });
}

/**
 * Update driver location
 */
export function useUpdateDriverLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, location }: { id: string; location: string }) =>
      driverService.updateDriverLocation(id, location),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['drivers', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update location');
    },
  });
}
