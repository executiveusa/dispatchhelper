/**
 * useRequests Hook
 *
 * React Query hooks for managing dispatch requests
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import * as requestService from '../services/requests';
import type { CreateRequestInput, UpdateRequestInput } from '../types';
import { toast } from 'sonner';

/**
 * Fetch all requests
 */
export function useRequests(tenantId?: string) {
  return useQuery({
    queryKey: ['requests', tenantId],
    queryFn: () => requestService.getRequests(tenantId),
  });
}

/**
 * Fetch a single request
 */
export function useRequest(id: string) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: () => requestService.getRequest(id),
    enabled: !!id,
  });
}

/**
 * Fetch pending requests
 */
export function usePendingRequests(tenantId?: string) {
  return useQuery({
    queryKey: ['requests', 'pending', tenantId],
    queryFn: () => requestService.getPendingRequests(tenantId),
  });
}

/**
 * Fetch requests by status
 */
export function useRequestsByStatus(status: string, tenantId?: string) {
  return useQuery({
    queryKey: ['requests', 'status', status, tenantId],
    queryFn: () => requestService.getRequestsByStatus(status as any, tenantId),
  });
}

/**
 * Create a new request
 */
export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: CreateRequestInput & { tenantId?: string }) =>
      requestService.createRequest(data, data.tenantId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create request');
    },
  });
}

/**
 * Update a request
 */
export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRequestInput }) =>
      requestService.updateRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['requests', variables.id] });
      toast.success('Request updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update request');
    },
  });
}

/**
 * Delete a request
 */
export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => requestService.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success('Request deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete request');
    },
  });
}
