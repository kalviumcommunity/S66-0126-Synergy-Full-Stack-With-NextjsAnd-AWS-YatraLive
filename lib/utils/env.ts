export function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && (value === undefined || value === '')) {
    throw new Error(
      `🚨 Environment variable ${key} is missing!\nCheck your .env.local file or add it to .env.example for other developers.`
    );
  }
  return value || '';
}

export function getNumericEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`⚠️ Environment variable ${key} is not a valid number, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

export const env = {
  redis: {
    url: getEnvVar('REDIS_URL'),
    token: getEnvVar('REDIS_TOKEN', false),
  },
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL'),
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
  simulation: {
    workerInterval: getNumericEnvVar('WORKER_UPDATE_INTERVAL', 8),
    maxDelay: getNumericEnvVar('MAX_DELAY_MINUTES', 30),
    delayProbability: getNumericEnvVar('DELAY_PROBABILITY', 30),
  }
} as const;
