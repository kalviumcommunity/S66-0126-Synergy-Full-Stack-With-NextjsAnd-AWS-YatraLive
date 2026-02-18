import { Train } from '../domain/train';
import { TrainEvent } from './train-events';

/**
 * SSE event types
 * 
 * ANALOGY: Different types of announcements:
 * - "train-update": A train's status changed
 * - "heartbeat": "This is your station master speaking..."
 * - "connection-established": "Welcome to our railway system"
 */
export type SSEEventType = 
  | 'train-update'      // Train data changed
  | 'batch-update'      // Multiple trains changed
  | 'heartbeat'         // Keep connection alive
  | 'connection-established' // Initial connection message
  | 'error';            // Something went wrong

/**
 * SSE message format
 * 
 * This matches the browser's EventSource expected format:
 * event: <type>\n
 * data: <JSON string>\n
 * id: <optional ID>\n
 * retry: <ms>\n\n
 */
export interface SSEMessage {
  /** Event type (maps to browser event name) */
  event: SSEEventType;
  
  /** Data payload (will be JSON.stringify'd) */
  data: any;
  
  /** Event ID for replay/resume */
  id?: string;
  
  /** Reconnection time (ms) */
  retry?: number;
}

/**
 * Train update payload
 */
export interface TrainUpdatePayload {
  type: 'full' | 'partial';
  trainId: string;
  data: Train | Partial<Train>;
  timestamp: number;
}

/**
 * Batch update payload
 */
export interface BatchUpdatePayload {
  updates: Array<{
    trainId: string;
    changes: Partial<Train>;
    timestamp: number;
  }>;
  count: number;
}

/**
 * Convert to SSE format string
 */
export function formatSSEMessage(message: SSEMessage): string {
  let sseString = '';
  
  if (message.event) {
    sseString += `event: ${message.event}\n`;
  }
  
  if (message.id) {
    sseString += `id: ${message.id}\n`;
  }
  
  if (message.retry) {
    sseString += `retry: ${message.retry}\n`;
  }
  
  sseString += `data: ${JSON.stringify(message.data)}\n\n`;
  
  return sseString;
}