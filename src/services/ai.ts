/**
 * AI Service
 *
 * Handles communication with the AI dispatch edge function
 */

import { supabase } from '../lib/supabase';
import type { AISession, Message } from '../types';

interface SendMessageInput {
  sessionId: string;
  message: string;
  tenantId?: string;
  userId?: string;
}

interface AIResponse {
  success: boolean;
  response: string;
  tool_results?: any[];
}

/**
 * Call the AI dispatch edge function
 */
export async function sendMessage(input: SendMessageInput): Promise<AIResponse> {
  const { data: session, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-dispatch`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: input.message,
          },
        ],
        session_id: input.sessionId,
        tenant_id: input.tenantId,
        user_id: input.userId,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get AI response');
  }

  return await response.json();
}

/**
 * Create a new AI session
 */
export async function createSession(
  title: string,
  tenantId?: string,
  userId?: string
): Promise<AISession> {
  const { data, error } = await supabase
    .from('ai_sessions')
    .insert({
      title,
      tenant_id: tenantId || null,
      user_id: userId || null,
      model: 'claude-3-5-sonnet',
    })
    .select()
    .single();

  if (error) throw error;
  return data as AISession;
}

/**
 * Get all sessions for a user
 */
export async function getSessions(tenantId?: string, userId?: string) {
  let query = supabase
    .from('ai_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as AISession[];
}

/**
 * Get a single session
 */
export async function getSession(id: string): Promise<AISession> {
  const { data, error } = await supabase
    .from('ai_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as AISession;
}

/**
 * Update session title
 */
export async function updateSessionTitle(
  id: string,
  title: string
): Promise<AISession> {
  const { data, error } = await supabase
    .from('ai_sessions')
    .update({ title })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as AISession;
}

/**
 * Delete a session
 */
export async function deleteSession(id: string) {
  const { error } = await supabase.from('ai_sessions').delete().eq('id', id);

  if (error) throw error;
  return { success: true };
}

/**
 * Get messages for a session
 */
export async function getMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Message[];
}

/**
 * Add a message to a session
 */
export async function addMessage(
  sessionId: string,
  role: Message['role'],
  content: any
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      session_id: sessionId,
      role,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

/**
 * Clear all messages in a session
 */
export async function clearMessages(sessionId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('session_id', sessionId);

  if (error) throw error;
  return { success: true };
}
