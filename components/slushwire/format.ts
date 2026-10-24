const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parts(day: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(day);
  if (!m) throw new Error(`Invalid calendar day: ${day}`);
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) };
}

/**
 * Formats an inclusive YYYY-MM-DD coverage range for titles. Pure string math
 * (no Date) so a visitor's timezone can never shift the day.
 *   same day        -> "Oct 23, 2026"
 *   same month      -> "Oct 21–23, 2026"        (en dash, no spaces)
 *   same year       -> "Oct 30 – Nov 1, 2026"   (en dash, spaced)
 *   different years -> "Dec 31, 2026 – Jan 1, 2027"
 */
export function formatCoverageRange(start: string, end: string): string {
  const a = parts(start);
  const b = parts(end);
  if (a.y === b.y && a.m === b.m && a.d === b.d) return `${MONTHS[a.m]} ${a.d}, ${a.y}`;
  if (a.y === b.y && a.m === b.m) return `${MONTHS[a.m]} ${a.d}–${b.d}, ${a.y}`;
  if (a.y === b.y) return `${MONTHS[a.m]} ${a.d} – ${MONTHS[b.m]} ${b.d}, ${a.y}`;
  return `${MONTHS[a.m]} ${a.d}, ${a.y} – ${MONTHS[b.m]} ${b.d}, ${b.y}`;
}
