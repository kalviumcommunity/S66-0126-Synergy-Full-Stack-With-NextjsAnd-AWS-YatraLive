import { useEffect, useRef, useState, useCallback } from 'react';
import { Train, TrainEvent } from '@/types';

/**
 * SSE Hook Configuration
 */
interface SSEOptions {
  /** Enable/disable connection */
  enabled?: boolean;
  
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean;
  
  /** Maximum reconnection attempts */
  maxReconnectAttempts?: number;
  
  /** Base delay for reconnection (ms) */
  reconnectDelay?: number;
  
  /** Event handlers */
  onTrainUpdate?: (event: TrainEvent) => void;
  onHeartbeat?: (timestamp: number) => void;
  onError?: (error: Event) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

/**
 * Connection status
 */
export type ConnectionStatus = 
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

/**
 * SSE Hook Return Value
 */
interface SSEReturn {
  /** Current connection status */
  status: ConnectionStatus;
  
  /** Last received event */
  lastEvent?: TrainEvent;
  
  /** Number of reconnection attempts */
  reconnectAttempts: number;
  
  /** Manually reconnect */
  reconnect: () => void;
  
  /** Manually disconnect */
  disconnect: () => void;
  
  /** Connection health (time since last heartbeat) */
  health: number; // ms since last heartbeat
}

/**
 * Custom hook for Server-Sent Events
 * 
 * ANALOGY: Like a radio tuned to the railway frequency -
 * it automatically reconnects if signal is lost.
 */
export function useSSE(options: SSEOptions = {}): SSEReturn {
  const {
    enabled = true,
    autoReconnect = true,
    maxReconnectAttempts = 10,
    reconnectDelay = 1000,
    onTrainUpdate,
    onHeartbeat,
    onError,
    onConnectionChange
  } = options;
  
  // State
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastEvent, setLastEvent] = useState<TrainEvent>();
  const [lastHeartbeat, setLastHeartbeat] = useState<number>(Date.now());
  // Ref to keep latest reconnect attempts in closures
  const reconnectAttemptsRef = useRef<number>(0);
  
  // Refs for cleanup
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Update connection status with callback
   */
  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    onConnectionChange?.(newStatus);
  }, [onConnectionChange]);
  
  /**
   * Connect to SSE stream
   */
  const connect = useCallback(() => {
    if (!enabled) return;
    
    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    updateStatus('connecting');
    
    // Create new EventSource connection
    const eventSource = new EventSource('/api/stream');
    eventSourceRef.current = eventSource;
    
    // Handle successful connection
    eventSource.onopen = () => {
      console.log('SSE connection established');
      updateStatus('connected');
      setReconnectAttempts(0);
      reconnectAttemptsRef.current = 0;
      
      // Start health check interval
      healthIntervalRef.current = setInterval(() => {
        setLastHeartbeat(prev => prev); // Trigger re-render
      }, 1000);
    };
    
    // Handle train updates
    eventSource.addEventListener('train-update', ((event: MessageEvent) => {
      try {
        const trainEvent = JSON.parse(event.data) as TrainEvent;
        setLastEvent(trainEvent);
        onTrainUpdate?.(trainEvent);
      } catch (error) {
        console.error('Failed to parse train update:', error);
      }
    }) as EventListener);
    
    // Handle heartbeats
    eventSource.addEventListener('heartbeat', ((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setLastHeartbeat(Date.now());
        onHeartbeat?.(data.timestamp);
      } catch (error) {
        console.error('Failed to parse heartbeat:', error);
      }
    }) as EventListener);
    
    // Handle connection established
    eventSource.addEventListener('connection-established', ((event: MessageEvent) => {
      console.log('SSE connection confirmed:', event.data);
    }) as EventListener);
    
    // Handle errors
    eventSource.onerror = (error) => {
      try {
        // Better logging: Event objects from EventSource are often empty; log readyState and attempt info
        console.error('SSE error event:', {
          error,
          readyState: eventSource.readyState,
          reconnectAttempts: reconnectAttemptsRef.current
        });
      } catch (e) {
        console.error('SSE error (logging failed):', e);
      }
      onError?.(error);

      // Close current connection and attempt reconnect if configured
      try { eventSource.close(); } catch {}

      const attempts = reconnectAttemptsRef.current;
      if (autoReconnect && attempts < maxReconnectAttempts) {
        updateStatus('reconnecting');
        const delay = Math.max(500, reconnectDelay * Math.pow(1.5, attempts));
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current = attempts + 1;
          setReconnectAttempts(attempts + 1);
          connect();
        }, delay);
      } else {
        updateStatus('error');
      }
    };
  }, [
    enabled,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    reconnectAttempts,
    onTrainUpdate,
    onHeartbeat,
    onError,
    updateStatus
  ]);
  
  /**
   * Disconnect from SSE stream
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (healthIntervalRef.current) {
      clearInterval(healthIntervalRef.current);
    }
    
    updateStatus('disconnected');
  }, [updateStatus]);
  
  /**
   * Manually reconnect
   */
  const reconnect = useCallback(() => {
    setReconnectAttempts(0);
    disconnect();
    connect();
  }, [disconnect, connect]);
  
  // Connect on mount and when enabled changes
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);
  
  // Calculate health (time since last heartbeat)
  const health = Date.now() - lastHeartbeat;
  
  return {
    status,
    lastEvent,
    reconnectAttempts,
    reconnect,
    disconnect,
    health
  };
}