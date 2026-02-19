import { Train, TrainEvent } from './index';
import { ProbabilityConfig } from '../worker/config/probabilities';
/**
 * System health status
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  uptime: number;
  components: {
    redis: {
      status: 'connected' | 'disconnected' | 'error';
      latency: number;
      memory: string;
      connections: number;
      lastPing: number;
    };
    worker: {
      status: 'running' | 'paused' | 'stopped' | 'error';
      pid?: number;
      lastHeartbeat: number | null;
      cyclesRun: number;
      eventsProcessed: number;
      uptime?: number;
    };
    sse: {
      activeConnections: number;
      eventsSent: number;
      lastEvent?: number;
    };
    api: {
      requestsLastMinute: number;
      errorRate: number;
      averageLatency: number;
    };
  };
}

/**
 * Simulation control commands
 */
export type SimulationCommand =
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_PROBABILITIES'; probabilities: Partial<ProbabilityConfig> }
  | { type: 'RESET_SIMULATION' }
  | {
      type: 'TRIGGER_EVENT';
      event: {
        type: 'DELAY' | 'PLATFORM_CHANGE' | 'CANCELLATION';
        trainId: string;
        params?: any;
      };
    };

/**
 * Simulation status
 */
export interface SimulationStatus {
  running: boolean;
  speed: number;
  probabilities: ProbabilityConfig;
  lastUpdate: number;
  nextUpdateIn: number;
  trainsUpdated: number;
  eventsGenerated: number;
}

/**
 * System metrics over time
 */
export interface TimeSeriesMetric {
  timestamp: number;
  value: number;
}
export interface SystemMetrics {
  cpu: TimeSeriesMetric[];
  memory: TimeSeriesMetric[];
  redisLatency: TimeSeriesMetric[];
  activeConnections: TimeSeriesMetric[];
  eventsPerMinute: TimeSeriesMetric[];
  trainsByStatus: {
    ON_TIME: number;
    DELAYED: number;
    CANCELLED: number;
  };
}

/**
 * Log entry
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: 'worker' | 'api' | 'system' | 'admin';
  message: string;
  data?: any;
}

/**
 * Admin user (simplified - in production, use proper auth)
 */
export interface AdminUser {
  username: string;
  role: 'admin' | 'viewer';
  lastLogin: number;
}
