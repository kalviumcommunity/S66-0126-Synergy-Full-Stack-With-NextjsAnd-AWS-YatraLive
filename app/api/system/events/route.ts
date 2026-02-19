import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { eventLogger } from '@/lib/services/eventLogger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') ?? '100', 10);
    const level = searchParams.get('level');
    const source = searchParams.get('source');

    let events =
      level === 'ERROR'
        ? await eventLogger.getErrorsSince(new Date(Date.now() - 24 * 60 * 60 * 1000))
        : await eventLogger.getRecentEvents(limit);

    if (source) {
      events = events.filter((event: { source: string }) => event.source === source);
    }

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Failed to fetch system events:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch system events',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await eventLogger.log({
      type: body.type ?? 'MANUAL_EVENT',
      level: body.level ?? 'INFO',
      source: body.source ?? 'api',
      message: body.message ?? 'Manual event logged',
      details: body.details,
    });

    return NextResponse.json({
      success: true,
      message: 'Event logged',
    });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create event',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
