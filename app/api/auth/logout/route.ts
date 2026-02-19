import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { getTokensFromCookies, clearAuthCookies } from '@/lib/auth/cookies';
import { StatusCodes } from 'http-status-codes';

export async function POST(request: NextRequest) {
    try {
        const { refreshToken } = getTokensFromCookies(request);

        if (refreshToken) {
            await authService.logout(refreshToken);
        }

        const response = NextResponse.json(
            {
                success: true,
                message: 'Logged out successfully',
            },
            { status: StatusCodes.OK }
        );

        // Clear cookies
        clearAuthCookies().forEach(cookie => {
            response.headers.append('Set-Cookie', cookie);
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear cookies even if error
        const response = NextResponse.json(
            {
                success: false,
                error: 'Logout failed',
            },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );

        clearAuthCookies().forEach(cookie => {
            response.headers.append('Set-Cookie', cookie);
        });

        return response;
    }
}
