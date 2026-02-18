# Redis Client Architecture

## Design Principles

1. **Singleton Pattern**: One Redis client instance shared across the entire app
   - Prevents connection exhaustion
   - Consistent connection management
   - Single point for health monitoring
2. **Connection Pooling**: Reuse connections instead of creating new ones
   - Reduces latency
   - Efficient resource usage
   - Handles concurrent requests
3. **Graceful Degradation**: App works (with limitations) even if Redis is down
   - Fallback to mock data in development
   - Clear error messages
   - Automatic reconnection
4. **Type Safety**: All Redis operations wrapped with TypeScript types
   - Compile-time safety
   - Autocomplete in IDE
   - Runtime validation

---

## Singleton Pattern Explained

Why singleton? Imagine if every API request opened a NEW connection to Redis:

```typescript
// ❌ BAD - Creates new connection for EVERY request
export async function GET() {
  const redis = new Redis(); // New connection!
  const train = await redis.get('train:101');
  redis.quit(); // Have to close it!
  return Response.json(train);
}
```

If 1000 requests come in simultaneously:
- 1000 connections open!
- Redis struggles to handle them all
- Your app slows to a crawl
- Eventually, "MAX CONNECTIONS REACHED" error 💥

```typescript
// ✅ GOOD - Single connection reused
const redis = new Redis(); // One connection at app startup
export async function GET() {
  const train = await redis.get('train:101'); // Reuse connection!
  return Response.json(train);
}
```

With 1000 requests:
- ONE connection handles all requests
- Redis is happy
- Your app scales beautifully

---

## Connection Pooling Explained

Connection pooling concept:
Instead of 1 connection for everything, maintain a pool of connections — like having multiple ticket counters instead of just one.

Example options used in `lib/redis/client.ts`:

```typescript
import Redis from 'ioredis';
const redis = new Redis({
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  keepAlive: 10000,
  lazyConnect: true,
  connectionName: 'train-tracker-app',
});
```

Notes:
- `ioredis` manages internal socket reuse; true connection pools can be implemented with helper libraries if needed.
- Use `lazyConnect` to avoid making the connection until the first command runs (useful in serverless environments).

---

## Operational Considerations

- Expose a health endpoint that calls `PING` on Redis.
- On startup, try to connect but allow the app to continue if Redis isn't available (graceful degradation).
- In development, consider a simple in-memory fallback for cached data.
