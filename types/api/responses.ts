import { Train } from '../domain/train';
import { Station } from '../domain/station';
import { TrainEvent } from '../events/train-events';

/**
 * Generic API response wrapper
 * All API responses follow this structure
 */
export interface ApiResponse<T> {
  /** Was the request successful? */
  success: boolean;
  
  /** Response data (if success) */
  data?: T;
  
  /** Error message (if not success) */
  error?: string;
  
  /** HTTP status code */
  status: number;
  
  /** Timestamp of response */
  timestamp: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Train list response
 */
export type TrainListResponse = ApiResponse<PaginatedResponse<Train>>;

/**
 * Single train response
 */
export type TrainResponse = ApiResponse<Train>;

/**
 * Station board response
 */
export type StationBoardResponse = ApiResponse<{
  station: Station;
  arrivals: Train[];
  departures: Train[];
}>;

/**
 * Event stream response
 * Server-Sent Events format
 */
export interface SSEEvent {
  /** Event type */
  event: 'train-update' | 'heartbeat' | 'connection-established';
  
  /** Event data */
  data: Train | TrainEvent | { message: string };
  
  /** Event ID for replay */
  id?: string;
  
  /** Retry timeout (ms) */
  retry?: number;
}

/**
 * System health response
 */
export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  redis: {
    connected: boolean;
    latency: number;
  };
  
  worker: {
    running: boolean;
    lastRun: number | null;
    updatesProcessed: number;
  };
  
  sse: {
    activeConnections: number;
  };
  
  uptime: number;
  timestamp: number;
}