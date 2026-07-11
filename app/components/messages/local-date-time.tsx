"use client";

import { useEffect, useState } from "react";

type LocalDateTimeVariant = "date" | "dateTime" | "shortDate";

const FORMAT_OPTIONS: Record<LocalDateTimeVariant, Intl.DateTimeFormatOptions> =
  {
    date: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
    dateTime: {
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      timeZoneName: "short",
      year: "numeric",
    },
    shortDate: {
      day: "numeric",
      month: "short",
    },
  };

export function LocalDateTime({
  className,
  fallback = "Date unavailable",
  value,
  variant = "dateTime",
}: {
  className?: string;
  fallback?: string;
  value?: string | null;
  variant?: LocalDateTimeVariant;
}) {
  const [formattedValue, setFormattedValue] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setFormattedValue(fallback);
      return;
    }

    const date = new Date(value);
    setFormattedValue(
      Number.isNaN(date.getTime())
        ? fallback
        : new Intl.DateTimeFormat(undefined, FORMAT_OPTIONS[variant]).format(
            date,
          ),
    );
  }, [fallback, value, variant]);

  return (
    <time className={className} dateTime={value ?? undefined}>
      {formattedValue ?? "\u00a0"}
    </time>
  );
}
