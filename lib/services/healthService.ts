import { redis } from '../redis/client';
import { RedisHealth } from '../../types/redis/client';

export class HealthService {
  /**
   * Check Redis health
   * Measures connection status and latency
   */
  async checkRedisHealth(): Promise<RedisHealth> {
    const start = Date.now();
    try {
      const result = await redis.ping();
      const latency = Date.now() - start;
      return {
        status: result === 'PONG' ? 'ready' : 'error',
        latency,
        lastPing: Date.now(),
      };
    } catch (error: any) {
      return {
        status: 'error',
        latency: Date.now() - start,
        lastPing: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get Redis info (memory, connections, etc.)
   */
  async getRedisInfo(): Promise<Record<string, string>> {
    try {
      const info = await redis.info();
      const lines = info.split('\n');
      const parsed: Record<string, string> = {};
      for (const line of lines) {
        const l = line.trim();
        if (!l || l.startsWith('#') || !l.includes(':')) continue;
        const [key, ...rest] = l.split(':');
        parsed[key] = rest.join(':').trim();
      }
      return parsed;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to get Redis info:', error);
      return {};
    }
  }

  /**
   * Get system health summary
   */
  async getSystemHealth() {
    const redisHealth = await this.checkRedisHealth();
    const redisInfo = await this.getRedisInfo();
    const trainCounts = await redis.scard('trains');
    return {
      redis: {
        ...redisHealth,
        info: {
          usedMemory: redisInfo.used_memory_human,
          connectedClients: redisInfo.connected_clients,
          uptime: redisInfo.uptime_in_seconds,
        },
      },
      stats: {
        totalTrains: trainCounts,
        timestamp: Date.now(),
      },
    };
  }
}

export const healthService = new HealthService();
