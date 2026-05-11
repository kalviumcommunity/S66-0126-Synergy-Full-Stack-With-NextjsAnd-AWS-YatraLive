import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { journeyService } from '@/lib/services/journeyService';
import { trainService } from '@/lib/services/trainService';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Number.parseInt(searchParams.get('days') ?? '30', 10);
    const parsedParams = await context.params;

    const train = await trainService.getTrain(parsedParams.id);
    if (!train) {
      return NextResponse.json(
        {
          success: false,
          error: 'Train not found',
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const history = await journeyService.getTrainHistory(parsedParams.id, days);
    const averageDelay = await journeyService.getAverageDelay(parsedParams.id, days);
    const onTimePerformance = await journeyService.getOnTimePerformance(parsedParams.id, days);

    return NextResponse.json({
      success: true,
      data: {
        train: {
          id: train.id,
          number: train.number,
          name: train.name,
        },
        history,
        statistics: {
          averageDelay,
          onTimePerformance,
          totalJourneys: history.length,
        },
        period: `${days} days`,
      },
    });
  } catch (error) {
    console.error('Failed to fetch train history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch train history',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
