import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';

import { fallbackTrains } from '@/lib/dev/fallbackTrains';
import { trainService } from '@/lib/services/trainService';
import type { TrainStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TrainStatus | null;
    const station = searchParams.get('station') ?? undefined;
    const limit = Number.parseInt(searchParams.get('limit') ?? '100', 10);
    const page = Number.parseInt(searchParams.get('page') ?? '1', 10);
    const offset = Math.max(0, (page - 1) * limit);

    const items = await trainService.getAllTrains({
      status: status ?? undefined,
      station,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: items.length,
        page,
        pageSize: limit,
        totalPages: 1,
        hasNext: false,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error('Failed to fetch trains from Redis, using fallback data:', error);

    return NextResponse.json({
      success: true,
      data: {
        items: fallbackTrains,
        total: fallbackTrains.length,
        page: 1,
        pageSize: fallbackTrains.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
      meta: {
        source: 'fallback',
      },
    });
  }
}
