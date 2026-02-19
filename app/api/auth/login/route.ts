import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import {
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from '@/lib/auth/cookies';
import { StatusCodes } from 'http-status-codes';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, rememberMe } = body;

        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email and password required',
                },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Get client info for logging
        const ipAddress =
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Attempt login
        const result = await authService.login({
            email,
            password,
            rememberMe,
            ipAddress,
            userAgent,
        });

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                data: {
                    admin: result.admin,
                    expiresAt: result.expiresAt,
                },
            },
            { status: StatusCodes.OK }
        );

        // Set cookies
        response.headers.append(
            'Set-Cookie',
            setAccessTokenCookie(result.accessToken)
        );

        response.headers.append(
            'Set-Cookie',
            setRefreshTokenCookie(result.refreshToken, rememberMe)
        );

        return response;
    } catch (error) {
        console.error('Login error:', error);
        const message = error instanceof Error ? error.message : 'Login failed';

        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status: StatusCodes.UNAUTHORIZED }
        );
    }
}
