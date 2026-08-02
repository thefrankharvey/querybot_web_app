import "server-only";

type RateLimitEntry = {
  count: number;
  resetsAt: number;
};

const entries = new Map<string, RateLimitEntry>();
const MAX_TRACKED_KEYS = 2_000;

function pruneExpiredEntries(now: number) {
  if (entries.size < MAX_TRACKED_KEYS) return;

  for (const [key, entry] of entries) {
    if (entry.resetsAt <= now) entries.delete(key);
  }
}

export function checkQuerySafetyRateLimit(
  key: string,
  {
    limit = 120,
    now = Date.now(),
    windowMs = 60_000,
  }: { limit?: number; now?: number; windowMs?: number } = {},
) {
  pruneExpiredEntries(now);
  const current = entries.get(key);

  if (!current || current.resetsAt <= now) {
    entries.set(key, { count: 1, resetsAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 } as const;
  }

  current.count += 1;
  if (current.count <= limit) {
    return { allowed: true, retryAfterSeconds: 0 } as const;
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetsAt - now) / 1_000)),
  } as const;
}
