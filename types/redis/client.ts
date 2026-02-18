import { Redis } from 'ioredis';

/**
 * Redis client status
 */
export type RedisConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'ready'
  | 'closing'
  | 'closed'
  | 'error';

/**
 * Redis health check result
 */
export interface RedisHealth {
  status: RedisConnectionStatus;
  latency: number; // milliseconds
  lastPing: number; // timestamp
  error?: string;
}

/**
 * Redis command response wrapper
 */
export interface RedisResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  latency: number;
}
