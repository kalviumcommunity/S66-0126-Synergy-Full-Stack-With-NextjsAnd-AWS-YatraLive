
import { env } from '../utils/env';

export function getRedisUrl() {
  return env.redis.url;
}
