import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';

import { hasPermission, type Role } from '@/lib/auth/rbac';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth';
import { trainService } from '@/lib/services/trainService';
import { uploadService } from '@/lib/services/uploadService';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!hasPermission(req.admin!.role as Role, 'create', 'train')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions',
        },
        { status: StatusCodes.FORBIDDEN }
      );
    }

    const body = await req.json();
    const { key, trainNumber, caption, location, isPrimary, dateTaken } = body;

    if (!key || !trainNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const trains = await trainService.getAllTrains();
    const train = trains.find((item) => item.number === trainNumber);

    if (!train) {
      return NextResponse.json(
        {
          success: false,
          error: 'Train not found',
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const photo = await uploadService.processUploadedImage({
      key,
      trainId: train.id,
      trainNumber,
      adminId: req.admin!.id,
      caption,
      location,
      dateTaken: dateTaken ? new Date(dateTaken) : undefined,
      isPrimary: Boolean(isPrimary),
    });

    return NextResponse.json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error('Upload completion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete upload',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}, { requireAuth: true });
