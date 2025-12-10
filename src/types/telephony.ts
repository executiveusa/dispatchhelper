/**
 * Telephony Types
 *
 * Type definitions for future telephony/voice agent integration
 */

export interface Call {
  id: string;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  status: 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer';
  startTime?: string;
  endTime?: string;
  duration?: number; // seconds
  recording_url?: string;
  metadata?: Record<string, any>;
}

export interface CallEvent {
  id: string;
  call_id: string;
  event_type: 'started' | 'answered' | 'ended' | 'recording_started' | 'recording_stopped' | 'dtmf' | 'speech';
  timestamp: string;
  data?: any;
}

export interface VoiceAgent {
  id: string;
  name: string;
  phone_number?: string;
  greeting_message?: string;
  capabilities: string[];
  active: boolean;
  config: {
    provider?: 'twilio' | 'asterisk' | 'custom';
    voice?: string;
    language?: string;
    [key: string]: any;
  };
}

export interface CallTranscript {
  id: string;
  call_id: string;
  speaker: 'agent' | 'caller';
  text: string;
  confidence: number;
  timestamp: string;
}

// Interfaces for telephony adapters
export interface TelephonyProvider {
  name: string;
  initiateCall(to: string, from: string): Promise<Call>;
  answerCall(callId: string): Promise<void>;
  endCall(callId: string): Promise<void>;
  sendDTMF(callId: string, digits: string): Promise<void>;
  startRecording(callId: string): Promise<void>;
  stopRecording(callId: string): Promise<void>;
  getCallStatus(callId: string): Promise<Call>;
}

export interface VoiceInterface {
  speak(text: string, callId: string): Promise<void>;
  listen(callId: string): Promise<string>;
  gather(options: GatherOptions, callId: string): Promise<GatherResult>;
}

export interface GatherOptions {
  numDigits?: number;
  timeout?: number;
  finishOnKey?: string;
  hints?: string[];
  speechTimeout?: number;
}

export interface GatherResult {
  type: 'digits' | 'speech';
  value: string;
  confidence?: number;
}
