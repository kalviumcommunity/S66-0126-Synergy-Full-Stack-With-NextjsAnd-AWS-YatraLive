import Redis, { RedisOptions } from 'ioredis';
import { env } from '../utils/env';

// Redis Client Singleton
// Environment-aware configuration (supports Upstash and regular Redis)

const isUpstash = !!env.redis.url && env.redis.url.includes('upstash.io');

function buildOptions(): RedisOptions {
  const base: RedisOptions = {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      return Math.min(times * 50, 2000);
    },
    keepAlive: 10000,
    lazyConnect: true,
    connectionName: `train-tracker-${env.app.isDev ? 'dev' : 'prod'}`,
    connectTimeout: 10000,
    // @ts-ignore ioredis types don't include commandTimeout in older versions
    commandTimeout: 5000,
    enableOfflineQueue: true,
    reconnectOnError: (err: Error) => {
      const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET'];
      if (targetErrors.some((msg) => err.message.includes(msg))) return true;
      return false;
    },
  };

  if (isUpstash) {
    return {
      ...base,
      tls: {},
      enableTLSForSentinelMode: false,
    } as RedisOptions;
  }

  return base;
}

export const redis = new Redis(env.redis.url, buildOptions());

redis.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('[Redis] Connected successfully');
});
redis.on('ready', () => {
  // eslint-disable-next-line no-console
  console.log('[Redis] Ready to accept commands');
});
redis.on('error', (error: Error) => {
  // eslint-disable-next-line no-console
  console.error('[Redis] Error:', error.message);
});
redis.on('close', () => {
  // eslint-disable-next-line no-console
  console.log('[Redis] Connection closed');
});
redis.on('reconnecting', (delay: number) => {
  // eslint-disable-next-line no-console
  console.log(`[Redis] Reconnecting in ${delay}ms`);
});
redis.on('end', () => {
  // eslint-disable-next-line no-console
  console.log('[Redis] Connection ended');
});

export async function testRedisConnection(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Redis] Connection test failed:', error);
    return false;
  }
}

export async function closeRedisConnection(): Promise<void> {
  try {
    await redis.quit();
    // eslint-disable-next-line no-console
    console.log('[Redis] Connection closed gracefully');
  } catch (e) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (redis as any).disconnect();
    } catch {}
  }
}

process.on('SIGTERM', async () => {
  await closeRedisConnection();
  process.exit(0);
});
process.on('SIGINT', async () => {
  await closeRedisConnection();
  process.exit(0);
});

// Helpful typed wrappers
export async function getJson<T = unknown>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return (raw as unknown) as T;
  }
}

export async function setJson(key: string, value: unknown, ttlSeconds?: number): Promise<'OK' | null> {
  const payload = typeof value === 'string' ? (value as string) : JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    return redis.set(key, payload, 'EX', ttlSeconds);
  }
  return redis.set(key, payload);
}

export async function delKey(key: string): Promise<number> {
  return redis.del(key);
}

export default redis;
