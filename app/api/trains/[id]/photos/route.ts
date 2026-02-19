import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { trainService } from '@/lib/services/trainService';
import { StatusCodes } from 'http-status-codes';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/trains/[id]/photos
 * 
 * Public endpoint to get photos for a train
 * No authentication required
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if train exists
    const train = await trainService.getTrain(params.id);
    if (!train) {
      return NextResponse.json(
        {
          success: false,
          error: 'Train not found',
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }
    
    // Get photos
    const photos = await prisma.trainPhoto.findMany({
      where: {
        trainId: params.id,
        isActive: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        url: true,
        thumbnailUrl: true,
        caption: true,
        location: true,
        dateTaken: true,
        isPrimary: true,
        createdAt: true,
        uploadedBy: {
          select: {
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: photos,
    });
    
  } catch (error) {
    console.error('Get train photos error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch photos',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}