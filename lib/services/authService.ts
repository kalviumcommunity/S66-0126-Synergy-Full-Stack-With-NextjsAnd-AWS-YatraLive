import { prisma } from '@/lib/prisma/client';
import { comparePassword, hashPassword, validatePassword } from '@/lib/auth/password';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
} from '@/lib/auth/jwt';
import { auditService } from './auditService';
import { authConfig } from '@/lib/auth/config';
import { randomBytes } from 'crypto';

/**
 * Authentication Service
 *
 * Handles all auth operations:
 * - Login/logout
 * - Token refresh
 * - Session management
 * - Password management
 *
 * ANALOGY: The security desk at the control room entrance
 */
export class AuthService {
    /**
     * Login admin with email and password
     */
    async login(params: {
        email: string;
        password: string;
        rememberMe?: boolean;
        ipAddress?: string;
        userAgent?: string;
    }) {
        const { email, password, rememberMe = false, ipAddress, userAgent } = params;

        // Find admin by email
        const admin = await prisma.admin.findUnique({
            where: { email: email.toLowerCase() },
        });

        // Check if admin exists
        if (!admin) {
            await this.recordFailedAttempt(email, ipAddress);
            throw new Error('Invalid email or password');
        }

        // Check if account is locked
        if (admin.lockedUntil && admin.lockedUntil > new Date()) {
            throw new Error(`Account locked. Try again after ${admin.lockedUntil.toLocaleTimeString()}`);
        }

        // Check if account is active
        if (!admin.isActive) {
            throw new Error('Account is deactivated');
        }

        // Verify password
        const isValidPassword = await comparePassword(password, admin.password);
        if (!isValidPassword) {
            await this.recordFailedAttempt(email, ipAddress);
            throw new Error('Invalid email or password');
        }

        // Check concurrent sessions limit
        const activeSessions = await prisma.adminSession.count({
            where: {
                adminId: admin.id,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
        });

        if (activeSessions >= authConfig.session.maxActiveSessions) {
            // Revoke oldest session
            const oldestSession = await prisma.adminSession.findFirst({
                where: { adminId: admin.id, revokedAt: null },
                orderBy: { lastUsedAt: 'asc' },
            });

            if (oldestSession) {
                await prisma.adminSession.update({
                    where: { id: oldestSession.id },
                    data: { revokedAt: new Date() },
                });
            }
        }

        // Create session
        const sessionId = randomBytes(32).toString('hex');
        const refreshToken = generateRefreshToken(admin.id, sessionId);
        const accessToken = generateAccessToken(admin.id, admin.email, admin.role);

        // Calculate expiry
        const expiresAt = new Date();
        expiresAt.setDate(
            expiresAt.getDate() + (rememberMe
                ? authConfig.session.rememberMeDays
                : 7
            )
        );

        // Store session in database
        await prisma.adminSession.create({
            data: {
                adminId: admin.id,
                refreshToken,
                accessToken,
                sessionId,
                userAgent,
                ipAddress,
                expiresAt,
            },
        });

        // Update admin login stats
        await prisma.admin.update({
            where: { id: admin.id },
            data: {
                lastLogin: new Date(),
                lastLoginIp: ipAddress,
                loginCount: { increment: 1 },
                failedAttempts: 0,
                lockedUntil: null,
            },
        });

        // Audit log
        await auditService.logAdminAction({
            adminId: admin.id,
            adminEmail: admin.email,
            action: 'LOGIN',
            entityType: 'AUTH',
            metadata: { ipAddress, userAgent, rememberMe },
        });

        return {
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
            accessToken,
            refreshToken,
            expiresAt,
        };
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string) {
        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new Error('Invalid refresh token');
        }

        // Find session
        const session = await prisma.adminSession.findFirst({
            where: {
                refreshToken,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: { admin: true },
        });

        if (!session || !session.admin) {
            throw new Error('Session expired or revoked');
        }

        // Check if admin is still active
        if (!session.admin.isActive) {
            throw new Error('Account deactivated');
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(
            session.admin.id,
            session.admin.email,
            session.admin.role
        );

        const newRefreshToken = generateRefreshToken(
            session.admin.id,
            session.sessionId
        );

        // Update session
        await prisma.adminSession.update({
            where: { id: session.id },
            data: {
                refreshToken: newRefreshToken,
                accessToken: newAccessToken,
                lastUsedAt: new Date(),
            },
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            admin: {
                id: session.admin.id,
                email: session.admin.email,
                name: session.admin.name,
                role: session.admin.role,
            },
        };
    }

    /**
     * Logout admin
     */
    async logout(refreshToken: string) {
        if (!refreshToken) return;

        // Find and revoke session
        const session = await prisma.adminSession.findFirst({
            where: { refreshToken },
            include: { admin: true },
        });

        if (session) {
            await prisma.adminSession.update({
                where: { id: session.id },
                data: { revokedAt: new Date() },
            });

            // Audit log
            if (session.admin) {
                await auditService.logAdminAction({
                    adminId: session.admin.id,
                    adminEmail: session.admin.email,
                    action: 'LOGOUT',
                    entityType: 'AUTH',
                });
            }
        }
    }

    /**
     * Logout from all devices
     */
    async logoutAll(adminId: string) {
        await prisma.adminSession.updateMany({
            where: {
                adminId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        const admin = await prisma.admin.findUnique({
            where: { id: adminId },
        });

        if (admin) {
            await auditService.logAdminAction({
                adminId,
                adminEmail: admin.email,
                action: 'LOGOUT_ALL',
                entityType: 'AUTH',
            });
        }
    }

    /**
     * Verify access token and return admin
     */
    async verifyAccessToken(token: string) {
        const payload = verifyAccessToken(token);
        if (!payload) return null;

        // Check if admin still exists and is active
        const admin = await prisma.admin.findUnique({
            where: { id: payload.adminId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });

        if (!admin || !admin.isActive) return null;

        return admin;
    }

    /**
     * Change password
     */
    async changePassword(
        adminId: string,
        currentPassword: string,
        newPassword: string
    ) {
        // Validate new password
        const validation = validatePassword(newPassword);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // Get admin
        const admin = await prisma.admin.findUnique({
            where: { id: adminId },
        });

        if (!admin) {
            throw new Error('Admin not found');
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, admin.password);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await prisma.admin.update({
            where: { id: adminId },
            data: { password: hashedPassword },
        });

        // Revoke all sessions except current (force re-login)
        await prisma.adminSession.updateMany({
            where: {
                adminId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        await auditService.logAdminAction({
            adminId,
            adminEmail: admin.email,
            action: 'CHANGE_PASSWORD',
            entityType: 'AUTH',
        });
    }

    /**
     * Record failed login attempt
     */
    private async recordFailedAttempt(email: string, ipAddress?: string) {
        const admin = await prisma.admin.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!admin) return;

        const newFailedAttempts = admin.failedAttempts + 1;

        // Lock account if too many failures
        if (newFailedAttempts >= authConfig.security.maxLoginAttempts) {
            const lockedUntil = new Date(Date.now() + authConfig.security.lockoutDuration);

            await prisma.admin.update({
                where: { id: admin.id },
                data: {
                    failedAttempts: newFailedAttempts,
                    lockedUntil,
                },
            });

            await auditService.logAdminAction({
                adminId: admin.id,
                adminEmail: admin.email,
                action: 'ACCOUNT_LOCKED',
                entityType: 'AUTH',
                metadata: { reason: 'Too many failed attempts', ipAddress },
            });
        } else {
            await prisma.admin.update({
                where: { id: admin.id },
                data: {
                    failedAttempts: newFailedAttempts,
                },
            });
        }
    }

    /**
     * Create initial superadmin (for setup)
     */
    async createInitialAdmin(params: {
        email: string;
        password: string;
        name: string;
    }) {
        // Check if any admin exists
        const adminCount = await prisma.admin.count();
        if (adminCount > 0) {
            throw new Error('Initial admin can only be created when no admins exist');
        }

        // Validate password
        const validation = validatePassword(params.password);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
        }

        // Hash password
        const hashedPassword = await hashPassword(params.password);

        // Create superadmin
        const admin = await prisma.admin.create({
            data: {
                email: params.email.toLowerCase(),
                password: hashedPassword,
                name: params.name,
                role: 'superadmin',
            },
        });

        return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
        };
    }
}

export const authService = new AuthService();
