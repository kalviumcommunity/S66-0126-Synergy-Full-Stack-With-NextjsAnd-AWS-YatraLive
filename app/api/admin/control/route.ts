import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis/client';
import { WORKER_KEYS } from '@/worker/config/constants';
import { StatusCodes } from 'http-status-codes';
/**
* Admin control API for worker
*
* POST /api/admin/control
* Body: { action: 'PAUSE' | 'RESUME' | 'SPEED' | 'PROBABILITIES' }
*/
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, value } = body;
        switch (action) {
            case 'PAUSE':
                await redis.set(WORKER_KEYS.CONTROL, 'PAUSED');
                return NextResponse.json({
                    success: true,
                    message: 'Worker paused'
                });
            case 'RESUME':
                await redis.del(WORKER_KEYS.CONTROL);
                return NextResponse.json({
                    success: true,
                    message: 'Worker resumed'
                });
            case 'SPEED':
                // Update interval (store for worker to read)
                await redis.hset(WORKER_KEYS.STATUS, 'interval', value * 1000);
                return NextResponse.json({
                    success: true,
                    message: `Speed set to ${value}x`
                });
            case 'PROBABILITIES':
                // Store probabilities for worker to use
                await redis.hset('worker:probabilities', value);
                return NextResponse.json({
                    success: true,
                    message: 'Probabilities updated'
                });
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: StatusCodes.BAD_REQUEST }
                );
        }
    } catch (error) {
        console.error('Admin control error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

/**
* GET /api/admin/control - Get worker status
*/
export async function GET() {
    try {
        const status = await redis.hgetall(WORKER_KEYS.STATUS);
        const heartbeat = await redis.get(WORKER_KEYS.HEARTBEAT);
        const lastRun = await redis.hgetall(WORKER_KEYS.LAST_RUN);
        const control = await redis.get(WORKER_KEYS.CONTROL);
        return NextResponse.json({
            success: true,
            data: {
                status,
                heartbeat: heartbeat ? parseInt(heartbeat) : null,
                lastRun,
                paused: control === 'PAUSED',
                isAlive: heartbeat && (Date.now() - parseInt(heartbeat)) < 60000 // 1 minute threshold
            }
        });
    } catch (error) {
        console.error('Failed to get worker status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get worker status' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
