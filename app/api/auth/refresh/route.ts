import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import {
    getTokensFromCookies,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from '@/lib/auth/cookies';
import { StatusCodes } from 'http-status-codes';

export async function POST(request: NextRequest) {
    try {
        const { refreshToken } = getTokensFromCookies(request);

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No refresh token',
                },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        // Refresh tokens
        const result = await authService.refreshToken(refreshToken);

        const response = NextResponse.json(
            {
                success: true,
                data: {
                    admin: result.admin,
                },
            },
            { status: StatusCodes.OK }
        );

        // Set new cookies
        response.headers.append(
            'Set-Cookie',
            setAccessTokenCookie(result.accessToken)
        );

        response.headers.append(
            'Set-Cookie',
            setRefreshTokenCookie(result.refreshToken, true)
        );

        return response;
    } catch (error) {
        console.error('Refresh error:', error);
        // Clear cookies on refresh failure
        const response = NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Refresh failed',
            },
            { status: StatusCodes.UNAUTHORIZED }
        );

        // Clear cookies
        const { clearAuthCookies } = await import('@/lib/auth/cookies');
        clearAuthCookies().forEach(cookie => {
            response.headers.append('Set-Cookie', cookie);
        });

        return response;
    }
}
