import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis/client';
import { LogEntry } from '@/types/admin';
import { StatusCodes } from 'http-status-codes';
import { v7 as uuidv7 } from 'uuid';

const logStore: LogEntry[] = [];
const MAX_LOGS = 1000;

export async function POST(request: Request) {
  try {
    const { level, source, message, data } = await request.json();
    const log: LogEntry = { id: uuidv7(), timestamp: Date.now(), level, source, message, data };
    logStore.unshift(log);
    if (logStore.length > MAX_LOGS) logStore.pop();
    await redis.lpush('system:logs', JSON.stringify(log));
    await redis.ltrim('system:logs', 0, MAX_LOGS - 1);
    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    console.error('Failed to store log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store log', status: StatusCodes.INTERNAL_SERVER_ERROR },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const level = searchParams.get('level');
  const source = searchParams.get('source');
  try {
    let logs: LogEntry[] = [];
    const redisLogs = await redis.lrange('system:logs', 0, limit - 1);
    logs = redisLogs.map((log) => JSON.parse(log));
    if (level) logs = logs.filter((l) => l.level === level);
    if (source) logs = logs.filter((l) => l.source === source);
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('Failed to get logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get logs', status: StatusCodes.INTERNAL_SERVER_ERROR },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
