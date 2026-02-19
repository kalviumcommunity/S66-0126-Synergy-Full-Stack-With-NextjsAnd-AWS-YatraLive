import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { uploadService } from '@/lib/services/uploadService';
import { hasPermission, Role } from '@/lib/auth/rbac';
import { StatusCodes } from 'http-status-codes';

interface RouteParams {
  params: {
    id: string;
  };
}

// DELETE /api/upload/photos/[id] - Delete a photo
export const DELETE = withAuth(async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    if (!hasPermission(req.admin!.role as Role, 'delete', 'train')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions',
        },
        { status: StatusCodes.FORBIDDEN }
      );
    }
    
    await uploadService.deletePhoto(params.id, req.admin!.id);
    
    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    });
    
  } catch (error) {
    console.error('Delete photo error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete photo',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}, { requireAuth: true });

// PATCH /api/upload/photos/[id] - Update photo metadata
export const PATCH = withAuth(async (
  req: AuthenticatedRequest,
  { params }: RouteParams
) => {
  try {
    if (!hasPermission(req.admin!.role as Role, 'update', 'train')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions',
        },
        { status: StatusCodes.FORBIDDEN }
      );
    }
    
    const body = await req.json();
    const { caption, location, dateTaken } = body;
    
    const photo = await uploadService.updatePhotoMetadata(
      params.id,
      { caption, location, dateTaken: dateTaken ? new Date(dateTaken) : undefined },
      req.admin!.id
    );
    
    return NextResponse.json({
      success: true,
      data: photo,
    });
    
  } catch (error) {
    console.error('Update photo error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update photo',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}, { requireAuth: true });