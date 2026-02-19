import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis/client';
import { trainService } from '@/lib/services/trainService';
import { SystemMetrics } from '@/types/admin';
import { StatusCodes } from 'http-status-codes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minutes = parseInt(searchParams.get('minutes') || '60');
  try {
    const trainCounts = await trainService.countTrainsByStatus();
    const recentEvents = await redis.zrevrange('events:recent', 0, 1000);
    const eventsByMinute = new Map<number, number>();
    const now = Date.now();
    for (const eventId of recentEvents) {
      const [trainId] = eventId.split(':');
      const eventKey = `events:train:${trainId}`;
      const events = await redis.lrange(eventKey, 0, 10);
      for (const eventJson of events) {
        try {
          const event = JSON.parse(eventJson);
          const minuteKey = Math.floor(event.timestamp / 60000);
          if (now - event.timestamp < minutes * 60 * 1000) {
            eventsByMinute.set(minuteKey, (eventsByMinute.get(minuteKey) || 0) + 1);
          }
        } catch (e) {
          // skip
        }
      }
    }
    const eventsPerMinute = Array.from(eventsByMinute.entries()).map(([minuteKey, count]) => ({ timestamp: minuteKey * 60000, value: count })).sort((a, b) => a.timestamp - b.timestamp);

    const latencySamples: Array<{ timestamp: number; value: number }> = [];
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await redis.ping();
      latencySamples.push({ timestamp: Date.now(), value: Date.now() - start });
    }

    const streamModule = await import('@/app/api/stream/route');
    const activeCount = await streamModule.getActiveConnectionCount();
    const activeConnections = [
      {
        timestamp: Date.now(),
        value: activeCount,
      },
    ];

    const metrics: SystemMetrics = {
      cpu: [],
      memory: [],
      redisLatency: latencySamples,
      activeConnections,
      eventsPerMinute,
      trainsByStatus: trainCounts,
    };
    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Failed to get metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get metrics', status: StatusCodes.INTERNAL_SERVER_ERROR },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
