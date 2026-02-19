/**
 * Email Subscriptions API
 * POST: Subscribe to emails
 * GET: Get subscription status
 */
import { StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { subscribeToEmails, getSubscription } from '@/lib/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email required' },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const result = await subscribeToEmails(email);

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription created. Check your email for verification link.',
        email: result.subscription.email,
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription failed',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter required' },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const subscription = await getSubscription(email);

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          email: subscription.email,
          isActive: subscription.isActive,
          isVerified: subscription.isVerified,
          preferences: subscription.preferences,
        },
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription',
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
