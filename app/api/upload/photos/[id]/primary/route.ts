import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { uploadService } from '@/lib/services/uploadService';
import { prisma } from '@/lib/prisma/client';
import { StatusCodes } from 'http-status-codes';

interface RouteParams {
  params: {
    id: string;
  };
}

export const POST = withAuth(async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    // Get photo to find train ID
    const photo = await prisma.trainPhoto.findUnique({
      where: { id: params.id },
    });
    
    if (!photo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Photo not found',
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }
    
    const updated = await uploadService.setPrimaryPhoto(
      params.id,
      photo.trainId,
      req.admin!.id
    );
    
    return NextResponse.json({
      success: true,
      data: updated,
    });
    
  } catch (error) {
    console.error('Set primary photo error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set primary photo',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}, { requireAuth: true });