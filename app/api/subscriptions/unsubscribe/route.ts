/**
 * Email Unsubscribe API
 * GET: Unsubscribe from emails with token
 */
import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { unsubscribeFromEmails } from '@/lib/services/emailService';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unsubscribe token required' },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const result = await unsubscribeFromEmails(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Unsubscribed successfully',
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unsubscribe failed',
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}
