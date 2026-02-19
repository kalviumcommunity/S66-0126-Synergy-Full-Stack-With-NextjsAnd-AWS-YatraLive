import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { uploadService } from '@/lib/services/uploadService';
import { trainService } from '@/lib/services/trainService';
import { hasPermission, Role } from '@/lib/auth/rbac';
import { StatusCodes } from 'http-status-codes';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    // Check permission
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
    const { trainNumber, filename, mimeType, fileSize } = body;
    
    if (!trainNumber || !filename || !mimeType || !fileSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
    
    // Verify train exists
    const trains = await trainService.getAllTrains();
    const train = trains.find(t => t.number === trainNumber);
    
    if (!train) {
      return NextResponse.json(
        {
          success: false,
          error: 'Train not found',
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }
    
    // Generate pre-signed URL
    const presignedData = await uploadService.getPresignedUploadUrl({
      trainNumber,
      filename,
      mimeType,
      fileSize,
      adminId: req.admin!.id,
    });
    
    return NextResponse.json({
      success: true,
      data: presignedData,
    });
    
  } catch (error) {
    console.error('Presign error:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to generate upload URL';
    
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}, { requireAuth: true });