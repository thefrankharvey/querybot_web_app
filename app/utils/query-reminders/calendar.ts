const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidLocalDate(value: string): boolean {
  const match = LOCAL_DATE_PATTERN.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function normalizeIanaTimeZone(value: string): string | null {
  const timezone = value.trim();
  if (!timezone || timezone.length > 100) return null;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(0);
    return timezone;
  } catch {
    return null;
  }
}

export function getLocalDateForInstant(
  timezone: string,
  instant: Date = new Date(),
): string {
  const normalizedTimezone = normalizeIanaTimeZone(timezone);
  if (!normalizedTimezone || Number.isNaN(instant.getTime())) {
    throw new RangeError("A valid timezone and instant are required");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: normalizedTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const year = values.get("year");
  const month = values.get("month");
  const day = values.get("day");

  if (!year || !month || !day) {
    throw new RangeError("The local calendar date could not be resolved");
  }

  return `${year}-${month}-${day}`;
}

export function addCalendarDays(localDate: string, days: number): string {
  if (!isValidLocalDate(localDate) || !Number.isInteger(days)) {
    throw new RangeError("A valid local date and integer day count are required");
  }

  const [year, month, day] = localDate.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));

  return [
    result.getUTCFullYear(),
    String(result.getUTCMonth() + 1).padStart(2, "0"),
    String(result.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function differenceInCalendarDays(
  laterDate: string,
  earlierDate: string,
): number {
  if (!isValidLocalDate(laterDate) || !isValidLocalDate(earlierDate)) {
    throw new RangeError("Valid local dates are required");
  }

  const toTimestamp = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };

  return Math.round(
    (toTimestamp(laterDate) - toTimestamp(earlierDate)) / 86_400_000,
  );
}

export function compareLocalDates(left: string, right: string): number {
  if (!isValidLocalDate(left) || !isValidLocalDate(right)) {
    throw new RangeError("Valid local dates are required");
  }

  return left === right ? 0 : left < right ? -1 : 1;
}
