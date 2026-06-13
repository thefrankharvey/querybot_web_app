/**
 * Pure, dependency-free publish-scheduling logic for the static blog.
 *
 * Lives apart from `blog-seo` so it is safe to import from edge middleware
 * (no React, no next/navigation, no node APIs — just Date + Intl).
 *
 * A post's folder name encodes its schedule:
 *
 *     <clean-slug>-MM-DD-YYYY[-am|-pm]
 *
 *   am -> 11:30 America/New_York   (morning slot)
 *   pm -> 18:00 America/New_York   (evening slot)
 *   no slot marker -> morning (11:30)
 */

export const PUBLISH_TIMEZONE = "America/New_York";
const SLOT_TIMES = {
  am: { hour: 11, minute: 30 },
  pm: { hour: 18, minute: 0 },
} as const;

/** Trailing `-MM-DD-YYYY` with an optional `-am`/`-pm` slot. */
const DATE_SUFFIX_RE = /-(\d{2})-(\d{2})-(\d{4})(?:-(am|pm))?$/i;

export interface PublishInfo {
  publishAt: Date | null;
  slot: "am" | "pm" | null;
  cleanSlug: string;
}

/** Minimal shape needed to schedule a post. */
export interface SchedulableConfig {
  status?: "draft" | "published";
  publishedDate?: string;
}

/**
 * Offset (ms) of a named time zone at an instant. Positive east of UTC.
 * Intl makes this correct across DST without lookup tables.
 */
function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = Number(part.value);
  }
  const asUTC = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour,
    map.minute,
    map.second,
  );
  return asUTC - date.getTime();
}

/** Wall-clock time in `timeZone` -> real UTC instant (DST-correct). */
function zonedWallTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const wallAsUTC = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset = tzOffsetMs(timeZone, new Date(wallAsUTC));
  return new Date(wallAsUTC - offset);
}

export function parsePublishInfo(folderName: string): PublishInfo {
  const match = folderName.match(DATE_SUFFIX_RE);
  if (!match) return { publishAt: null, slot: null, cleanSlug: folderName };

  const [, mm, dd, yyyy, slotRaw] = match;
  const slot = (slotRaw?.toLowerCase() as "am" | "pm" | undefined) ?? "am";
  const publishAt = zonedWallTimeToUtc(
    PUBLISH_TIMEZONE,
    Number(yyyy),
    Number(mm),
    Number(dd),
    SLOT_TIMES[slot].hour,
    SLOT_TIMES[slot].minute,
  );
  return { publishAt, slot, cleanSlug: folderName.replace(DATE_SUFFIX_RE, "") };
}

/** Effective publish instant: folder-name date first, then config.publishedDate. */
export function getPublishAt(
  slug: string,
  config?: SchedulableConfig | null,
): Date | null {
  const fromName = parsePublishInfo(slug).publishAt;
  if (fromName) return fromName;
  if (config?.publishedDate) {
    const parsed = new Date(config.publishedDate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

/**
 * Local preview mode. In dev (`npm run dev`) every post — including
 * future-dated and drafts — is treated as published so you can review the whole
 * queue before pushing. Set `BLOG_PREVIEW=0` to exercise the real gate in dev.
 * Hard-disabled in production so it can never expose unpublished posts publicly.
 */
export function isBlogPreview(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.BLOG_PREVIEW !== "0";
}

export function isBlogPublished(
  slug: string,
  config?: SchedulableConfig | null,
  now: Date = new Date(),
): boolean {
  if (isBlogPreview()) return true;
  if (config?.status === "draft") return false;
  const publishAt = getPublishAt(slug, config);
  if (!publishAt) return false; // No date anywhere — fail safe (stay hidden).
  return publishAt.getTime() <= now.getTime();
}
