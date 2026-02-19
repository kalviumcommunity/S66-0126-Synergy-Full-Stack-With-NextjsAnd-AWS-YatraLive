import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis/client';
import { trainService } from '@/lib/services/trainService';
import { getActiveConnectionCount } from '@/app/api/stream/route';
import { SystemHealth } from '@/types/admin';
import { WORKER_KEYS } from '@/worker/config/constants';
import { StatusCodes } from 'http-status-codes';

export async function GET() {
  const startTime = Date.now();
  try {
    // 1. Check Redis health
    const redisStart = Date.now();
    let redisConnected = false;
    let redisLatency = 0;
    let redisMemory = 'unknown';
    let redisConnections = 0;
    try {
      const pingResult = await redis.ping();
      redisConnected = pingResult === 'PONG';
      redisLatency = Date.now() - redisStart;
      const info = await redis.info();
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      redisMemory = memoryMatch ? memoryMatch[1].trim() : 'unknown';
      const clientsMatch = info.match(/connected_clients:(\d+)/);
      redisConnections = clientsMatch ? parseInt(clientsMatch[1]) : 0;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    // 2. Check worker health
    let workerStatus: SystemHealth['components']['worker'] = {
      status: 'stopped',
      lastHeartbeat: null,
      cyclesRun: 0,
      eventsProcessed: 0,
    };
    try {
      const heartbeat = await redis.get(WORKER_KEYS.HEARTBEAT);
      const workerStats = await redis.hgetall(WORKER_KEYS.STATUS);
      const lastRun = await redis.hgetall(WORKER_KEYS.LAST_RUN);
      const heartbeatTime = heartbeat ? parseInt(heartbeat) : null;
      const isRunning = heartbeatTime && (Date.now() - heartbeatTime) < 60000;
      workerStatus = {
        status: isRunning ? 'running' : 'stopped',
        pid: workerStats.pid ? parseInt(workerStats.pid) : undefined,
        lastHeartbeat: heartbeatTime,
        cyclesRun: workerStats.totalCycles ? parseInt(workerStats.totalCycles) : 0,
        eventsProcessed: workerStats.totalEvents ? parseInt(workerStats.totalEvents) : 0,
        uptime: lastRun.timestamp ? Date.now() - parseInt(lastRun.timestamp) : undefined,
      };
    } catch (error) {
      console.error('Worker health check failed:', error);
    }

    // 3. Check SSE health
    const activeConnections = await getActiveConnectionCount();

    // 4. Get train statistics
    const trainCounts = await trainService.countTrainsByStatus();

    // Determine overall status
    let overallStatus: SystemHealth['status'] = 'healthy';
    if (!redisConnected) {
      overallStatus = 'unhealthy';
    } else if (workerStatus.status !== 'running' || activeConnections === 0) {
      overallStatus = 'degraded';
    }

    const health: SystemHealth = {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: process.uptime(),
      components: {
        redis: {
          status: redisConnected ? 'connected' : 'disconnected',
          latency: redisLatency,
          memory: redisMemory,
          connections: redisConnections,
          lastPing: Date.now(),
        },
        worker: workerStatus,
        sse: {
          activeConnections,
          eventsSent: 0,
          lastEvent: undefined,
        },
        api: {
          requestsLastMinute: 0,
          errorRate: 0,
          averageLatency: Date.now() - startTime,
        },
      },
    };
    return NextResponse.json({ success: true, data: health });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get system health', status: StatusCodes.INTERNAL_SERVER_ERROR },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
