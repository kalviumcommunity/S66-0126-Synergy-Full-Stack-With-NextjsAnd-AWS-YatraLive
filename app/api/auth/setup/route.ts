import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { prisma } from '@/lib/prisma/client';
import { StatusCodes } from 'http-status-codes';

/**
 * POST /api/auth/setup
 *
 * Create initial superadmin (only works when no admins exist)
 * This should be disabled in production or protected by IP whitelist
 */
export async function POST(request: NextRequest) {
    try {
        // Check if any admin exists
        const adminCount = await prisma.admin.count();
        if (adminCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Initial setup already completed',
                },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email, password, and name required',
                },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        const admin = await authService.createInitialAdmin({
            email,
            password,
            name,
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    admin,
                    message: 'Initial admin created successfully',
                },
            },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error('Setup error:', error);
        const message = error instanceof Error ? error.message : 'Setup failed';

        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            { status: StatusCodes.BAD_REQUEST }
        );
    }
}
