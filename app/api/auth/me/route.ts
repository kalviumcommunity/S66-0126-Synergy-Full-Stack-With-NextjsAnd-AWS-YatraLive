import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { AuthenticatedRequest } from '@/lib/middleware/auth';
import { StatusCodes } from 'http-status-codes';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
    if (!req.admin) {
        return NextResponse.json(
            {
                success: false,
                error: 'Not authenticated',
            },
            { status: StatusCodes.UNAUTHORIZED }
        );
    }

    return NextResponse.json({
        success: true,
        data: {
            admin: req.admin,
        },
    });
});
