import jwt from 'jsonwebtoken';
import { authConfig } from './config';

/**
 * JWT Token Management
 *
 * Handles creation and verification of access and refresh tokens
 * Like issuing and verifying ID cards
 */

export interface AccessTokenPayload {
    adminId: string;
    email: string;
    role: string;
    type: 'access';
}

export interface RefreshTokenPayload {
    adminId: string;
    sessionId: string;
    type: 'refresh';
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(
    adminId: string,
    email: string,
    role: string
): string {
    const payload: AccessTokenPayload = {
        adminId,
        email,
        role,
        type: 'access',
    };

    return jwt.sign(
        payload,
        authConfig.jwt.accessToken.secret,
        { expiresIn: authConfig.jwt.accessToken.expiresIn }
    );
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(
    adminId: string,
    sessionId: string
): string {
    const payload: RefreshTokenPayload = {
        adminId,
        sessionId,
        type: 'refresh',
    };

    return jwt.sign(
        payload,
        authConfig.jwt.refreshToken.secret,
        { expiresIn: authConfig.jwt.refreshToken.expiresIn }
    );
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
        const decoded = jwt.verify(
            token,
            authConfig.jwt.accessToken.secret
        ) as AccessTokenPayload;

        // Verify it's an access token
        if (decoded.type !== 'access') {
            return null;
        }

        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
        const decoded = jwt.verify(
            token,
            authConfig.jwt.refreshToken.secret
        ) as RefreshTokenPayload;

        // Verify it's a refresh token
        if (decoded.type !== 'refresh') {
            return null;
        }

        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Extract token from Authorization header
 * Format: "Bearer <token>"
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
        return null;
    }
    return token;
}
