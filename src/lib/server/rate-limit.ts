import "server-only";

/**
 * Small in-memory sliding-window rate limiter.
 *
 * It protects a single server instance. On multi-instance or serverless
 * deployments, add a shared limiter (for example at the edge or with a Redis
 * store) — see README.
 */

const buckets = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { allowed: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > MAX_KEYS) {
    // Drop the oldest keys to bound memory use.
    for (const k of Array.from(buckets.keys()).slice(0, buckets.size - MAX_KEYS)) buckets.delete(k);
  }
  return { allowed: true, retryAfter: 0 };
}

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
