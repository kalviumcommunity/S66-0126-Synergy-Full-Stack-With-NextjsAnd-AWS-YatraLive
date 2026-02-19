import { serialize, parse } from 'cookie';
import { NextRequest } from 'next/server';
import { authConfig } from './config';

/**
 * Cookie management for authentication
 *
 * Secure HTTP-only cookies store our tokens
 * Like having secure lockers for ID cards
 */
export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'train_tracker_access',
    REFRESH_TOKEN: 'train_tracker_refresh',
    SESSION_ID: 'train_tracker_session',
} as const;

/**
 * Set access token cookie
 */
export function setAccessTokenCookie(token: string): string {
    return serialize(COOKIE_NAMES.ACCESS_TOKEN, token, {
        ...authConfig.cookie,
        maxAge: 15 * 60, // 15 minutes in seconds
    });
}

/**
 * Set refresh token cookie
 */
export function setRefreshTokenCookie(token: string, rememberMe: boolean = false): string {
    const maxAge = rememberMe
        ? authConfig.session.rememberMeDays * 24 * 60 * 60 // Days to seconds
        : 7 * 24 * 60 * 60; // 7 days default
    return serialize(COOKIE_NAMES.REFRESH_TOKEN, token, {
        ...authConfig.cookie,
        maxAge,
    });
}

/**
 * Clear auth cookies (logout)
 */
export function clearAuthCookies(): string[] {
    return [
        serialize(COOKIE_NAMES.ACCESS_TOKEN, '', {
            ...authConfig.cookie,
            maxAge: 0,
        }),
        serialize(COOKIE_NAMES.REFRESH_TOKEN, '', {
            ...authConfig.cookie,
            maxAge: 0,
        }),
        serialize(COOKIE_NAMES.SESSION_ID, '', {
            ...authConfig.cookie,
            maxAge: 0,
        }),
    ];
}

/**
 * Get tokens from request cookies
 */
export function getTokensFromCookies(request: NextRequest): {
    accessToken?: string;
    refreshToken?: string;
    sessionId?: string;
} {
    const cookies = parse(request.headers.get('cookie') || '');
    return {
        accessToken: cookies[COOKIE_NAMES.ACCESS_TOKEN],
        refreshToken: cookies[COOKIE_NAMES.REFRESH_TOKEN],
        sessionId: cookies[COOKIE_NAMES.SESSION_ID],
    };
}
