import "server-only";
// Per-process abuse protection; not a cross-instance quota. Entries expire and memory is bounded.
const windows = new Map<string, { start: number; count: number }>();
export function checkAgencyHistoryRateLimit(userId: string, now = Date.now()) {
  for (const [key, entry] of windows)
    if (now - entry.start >= 60000) windows.delete(key);
  let entry = windows.get(userId);
  if (!entry) {
    if (windows.size >= 10000) return false;
    entry = { start: now, count: 0 };
    windows.set(userId, entry);
  }
  return ++entry.count <= 60;
}
