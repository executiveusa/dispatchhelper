/**
 * useAI Hooks
 *
 * React Query hooks for AI sessions and messages
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import * as aiService from '../services/ai';
import { toast } from 'sonner';

/**
 * Get all AI sessions
 */
export function useAISessions(tenantId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai_sessions', tenantId, user?.id],
    queryFn: () => aiService.getSessions(tenantId, user?.id),
    enabled: !!user,
  });
}

/**
 * Get a single session
 */
export function useAISession(sessionId: string) {
  return useQuery({
    queryKey: ['ai_sessions', sessionId],
    queryFn: () => aiService.getSession(sessionId),
    enabled: !!sessionId,
  });
}

/**
 * Get messages for a session
 */
export function useMessages(sessionId: string) {
  return useQuery({
    queryKey: ['messages', sessionId],
    queryFn: () => aiService.getMessages(sessionId),
    enabled: !!sessionId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}

/**
 * Create a new AI session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: { title: string; tenantId?: string }) =>
      aiService.createSession(data.title, data.tenantId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_sessions'] });
      toast.success('New chat session created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create session');
    },
  });
}

/**
 * Update session title
 */
export function useUpdateSessionTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      aiService.updateSessionTitle(id, title),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['ai_sessions', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update title');
    },
  });
}

/**
 * Delete a session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aiService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_sessions'] });
      toast.success('Session deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete session');
    },
  });
}

/**
 * Send a message to AI
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: {
      sessionId: string;
      message: string;
      tenantId?: string;
    }) =>
      aiService.sendMessage({
        ...data,
        userId: user?.id,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.sessionId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

/**
 * Add a message manually (for user messages)
 */
export function useAddMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      sessionId: string;
      role: 'user' | 'assistant' | 'system' | 'tool';
      content: any;
    }) => aiService.addMessage(data.sessionId, data.role, data.content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.sessionId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add message');
    },
  });
}

/**
 * Clear all messages in a session
 */
export function useClearMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => aiService.clearMessages(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', sessionId] });
      toast.success('Messages cleared');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clear messages');
    },
  });
}
