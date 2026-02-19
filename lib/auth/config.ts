/**
 * Authentication Configuration
 *
 * Centralized config for all auth-related settings
 * Think of this as the security policy manual
 */
export const authConfig = {
    // JWT Settings
    jwt: {
        accessToken: {
            secret: process.env.JWT_ACCESS_SECRET!,
            expiresIn: '15m', // 15 minutes - short lived for security
        },
        refreshToken: {
            secret: process.env.JWT_REFRESH_SECRET!,
            expiresIn: '7d', // 7 days - longer lived
        },
    },
    // Password Settings
    password: {
        saltRounds: 10, // bcrypt salt rounds
        minLength: 8,
        requireSpecialChar: true,
        requireNumber: true,
        requireUppercase: true,
    },
    // Session Settings
    session: {
        maxActiveSessions: 5, // Max concurrent sessions per admin
        rememberMeDays: 30, // Days for "remember me" option
    },
    // Security Settings
    security: {
        maxLoginAttempts: 5, // Lock after 5 failed attempts
        lockoutDuration: 15 * 60 * 1000, // 15 minutes in ms
        passwordResetExpiry: 24 * 60 * 60 * 1000, // 24 hours
    },
    // Cookie Settings
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined,
    },
} as const;

// Validate required environment variables
const requiredEnvVars = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
];

requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable:${envVar}`);
    }
});
