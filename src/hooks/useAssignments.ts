/**
 * useAssignments Hook
 *
 * React Query hooks for managing driver assignments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import * as assignmentService from '../services/assignments';
import type { AssignDriverInput, Assignment } from '../types';
import { toast } from 'sonner';

/**
 * Fetch all assignments
 */
export function useAssignments() {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentService.getAssignments(),
  });
}

/**
 * Fetch a single assignment
 */
export function useAssignment(id: string) {
  return useQuery({
    queryKey: ['assignments', id],
    queryFn: () => assignmentService.getAssignment(id),
    enabled: !!id,
  });
}

/**
 * Fetch assignments for a specific request
 */
export function useAssignmentsByRequest(requestId: string) {
  return useQuery({
    queryKey: ['assignments', 'request', requestId],
    queryFn: () => assignmentService.getAssignmentsByRequest(requestId),
    enabled: !!requestId,
  });
}

/**
 * Fetch assignments for a specific driver
 */
export function useAssignmentsByDriver(driverId: string) {
  return useQuery({
    queryKey: ['assignments', 'driver', driverId],
    queryFn: () => assignmentService.getAssignmentsByDriver(driverId),
    enabled: !!driverId,
  });
}

/**
 * Create a new assignment
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: AssignDriverInput) =>
      assignmentService.createAssignment(data, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign driver');
    },
  });
}

/**
 * Update assignment status
 */
export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Assignment['status'] }) =>
      assignmentService.updateAssignmentStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignments', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Assignment status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update assignment');
    },
  });
}

/**
 * Cancel an assignment
 */
export function useCancelAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentService.cancelAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Assignment cancelled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel assignment');
    },
  });
}
