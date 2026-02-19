/**
 * Email Verification API
 * GET: Verify email subscription with token
 */
import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { verifyEmailSubscription } from '@/lib/services/emailService';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token required' },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const result = await verifyEmailSubscription(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
