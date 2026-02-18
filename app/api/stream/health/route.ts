import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis/client';
import { getActiveConnectionCount } from '../route';
import { StatusCodes } from 'http-status-codes';

/**
 * SSE Health Check
 * 
 * Returns information about the SSE stream status
 */
export async function GET() {
  try {
    // Check Redis Pub/Sub
    const pubSubEnabled = await redis.ping();
    
    // Get active connection count (if implemented)
    const activeConnections = await getActiveConnectionCount();
    
    // Check if we can publish test message
    const testEvent = {
      id: 'health-check',
      type: 'heartbeat',
      timestamp: Date.now(),
      message: 'Health check'
    };
    
    await redis.publish('train-updates', JSON.stringify(testEvent));
    
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        activeConnections,
        pubSub: pubSubEnabled === 'PONG',
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('SSE health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'SSE stream unhealthy',
        status: StatusCodes.SERVICE_UNAVAILABLE
      },
      { status: StatusCodes.SERVICE_UNAVAILABLE }
    );
  }
}