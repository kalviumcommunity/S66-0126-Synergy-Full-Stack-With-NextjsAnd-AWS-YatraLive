import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getTokensFromCookies, clearAuthCookies } from '@/lib/auth/cookies';
import { authService } from '@/lib/services/authService';

/**
 * Authentication middleware for API routes
 *
 * Use: protectApiRoute(handler, { requireAuth: true, roles: ['admin'] })
 */
export interface AuthOptions {
    requireAuth?: boolean;
    roles?: string[]; // Allowed roles
}

export type AuthenticatedRequest = NextRequest & {
    admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
};

/**
 * Protect API routes with authentication
 */
export function withAuth(
    handler: (
        req: AuthenticatedRequest,
        params?: any
    ) => Promise<NextResponse> | Promise<Response>,
    options: AuthOptions = { requireAuth: true }
) {
    return async (req: AuthenticatedRequest, ...args: any[]) => {
        try {
            // Get tokens from cookies
            const { accessToken } = getTokensFromCookies(req);

            // If auth required but no token
            if (options.requireAuth && !accessToken) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Authentication required',
                    },
                    { status: 401 }
                );
            }

            // Verify token if present
            if (accessToken) {
                const admin = await authService.verifyAccessToken(accessToken);

                if (!admin) {
                    // Token invalid - clear cookies
                    const response = NextResponse.json(
                        {
                            success: false,
                            error: 'Invalid or expired token',
                        },
                        { status: 401 }
                    );

                    clearAuthCookies().forEach(cookie => {
                        response.headers.append('Set-Cookie', cookie);
                    });

                    return response;
                }

                // Check role-based access
                if (options.roles && options.roles.length > 0) {
                    if (!options.roles.includes(admin.role)) {
                        return NextResponse.json(
                            {
                                success: false,
                                error: 'Insufficient permissions',
                            },
                            { status: 403 }
                        );
                    }
                }

                // Attach admin to request
                req.admin = admin;
            }

            // Call handler
            return handler(req, ...args);
        } catch (error) {
            console.error('Auth middleware error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authentication failed',
                },
                { status: 500 }
            );
        }
    };
}

/**
 * Get current admin from request (for server components)
 */
export async function getCurrentAdmin() {
    // This would need to access cookies - implementation depends on
    // whether you're in server component or API route
    // We'll implement this when needed
    return null;
}
