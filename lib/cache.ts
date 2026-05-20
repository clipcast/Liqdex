// In-memory cache for Vercel serverless (persists during warm instances)
const memoryCache = new Map<string, { data: unknown; expiry: number }>();

export function getCached<T>(key: string, maxAgeMs: number): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs?: number): void {
  const ttl = ttlMs || 60_000;
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}

export function clearCache(): void {
  memoryCache.clear();
}
