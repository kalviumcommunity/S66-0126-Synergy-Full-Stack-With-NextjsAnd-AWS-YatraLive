import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';

import { getFallbackTrain } from '@/lib/dev/fallbackTrains';
import { trainService } from '@/lib/services/trainService';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const train = await trainService.getTrain(id);

    if (!train) {
      return NextResponse.json(
        {
          success: false,
          error: 'Train not found',
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json({
      success: true,
      data: train,
    });
  } catch (error) {
    console.error('Failed to fetch train from Redis, using fallback data:', error);

    const { id } = await context.params;
    const train = getFallbackTrain(id);

    if (!train) {
      return NextResponse.json(
        {
          success: false,
          error: 'Train not found',
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json({
      success: true,
      data: train,
      meta: {
        source: 'fallback',
      },
    });
  }
}
