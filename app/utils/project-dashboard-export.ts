export const PROJECT_DASHBOARD_EXPORT_COLUMNS = [
  { key: "name", header: "Name", width: 28 },
  { key: "fitRating", header: "Fit Rating", width: 18 },
  { key: "agency_url", header: "Agency website link", width: 30 },
  { key: "genres_themes", header: "Genres/Themes", width: 34 },
  { key: "query_tracker", header: "Query Tracker link", width: 30 },
  { key: "pub_marketplace", header: "PubMarketplace link", width: 30 },
  { key: "email", header: "Email", width: 30 },
  { key: "query_sent_date", header: "Query Sent", width: 16 },
  { key: "pages_requested_date", header: "Pages Requested", width: 18 },
  { key: "rejected_date", header: "Rejected", width: 16 },
  { key: "offer_date", header: "Offer", width: 16 },
  { key: "notes", header: "Notes", width: 42 },
] as const;

export const PROJECT_DASHBOARD_EXPORT_FIT_RATING_LABELS = {
  perfect: "Perfect Fit",
  great: "Great Fit",
  good: "Good Fit",
  neutral: "Neutral Fit",
} as const;

export type ProjectDashboardExportColumn =
  (typeof PROJECT_DASHBOARD_EXPORT_COLUMNS)[number];

export type ProjectDashboardExportColumnKey =
  ProjectDashboardExportColumn["key"];

export type ProjectDashboardExportFitRating =
  keyof typeof PROJECT_DASHBOARD_EXPORT_FIT_RATING_LABELS;

export type ProjectDashboardExportRow = Record<
  ProjectDashboardExportColumnKey,
  string
> & {
  fitRating: ProjectDashboardExportFitRating;
};

export const PROJECT_DASHBOARD_EXPORT_DATE_KEYS = new Set<
  ProjectDashboardExportColumnKey
>([
  "query_sent_date",
  "pages_requested_date",
  "rejected_date",
  "offer_date",
]);

export const PROJECT_DASHBOARD_EXPORT_LINK_KEYS = new Set<
  ProjectDashboardExportColumnKey
>(["agency_url", "query_tracker", "pub_marketplace"]);

export function getProjectDashboardExportColumnHeader(
  key: ProjectDashboardExportColumnKey,
) {
  return (
    PROJECT_DASHBOARD_EXPORT_COLUMNS.find((column) => column.key === key)
      ?.header ?? key
  );
}

function normalizeExportText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeProjectDashboardExportDate(value: unknown) {
  const datePart = normalizeExportText(value).split("T")[0] ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : "";
}

export function parseProjectDashboardExportDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}

export function normalizeProjectDashboardExportFitRating(
  value: unknown,
): ProjectDashboardExportFitRating {
  const normalized = normalizeExportText(value).toLocaleLowerCase();
  if (normalized in PROJECT_DASHBOARD_EXPORT_FIT_RATING_LABELS) {
    return normalized as ProjectDashboardExportFitRating;
  }

  const matchingEntry = Object.entries(
    PROJECT_DASHBOARD_EXPORT_FIT_RATING_LABELS,
  ).find(([, label]) => label.toLocaleLowerCase() === normalized);

  return matchingEntry
    ? (matchingEntry[0] as ProjectDashboardExportFitRating)
    : "neutral";
}

export function getProjectDashboardExportFitRatingLabel(
  rating: ProjectDashboardExportFitRating,
) {
  return PROJECT_DASHBOARD_EXPORT_FIT_RATING_LABELS[rating];
}

export function formatProjectDashboardExportUrl(value: unknown) {
  const rawValue = normalizeExportText(value);
  const firstUrl = rawValue.split("|")[0]?.trim() ?? "";

  if (!firstUrl.includes(".")) {
    return null;
  }

  return /^https?:\/\//i.test(firstUrl) ? firstUrl : `http://${firstUrl}`;
}

export function sanitizeProjectDashboardExportRows(
  rows: unknown,
): ProjectDashboardExportRow[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.flatMap((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      return [];
    }

    const source = row as Record<string, unknown>;
    if (source.isPlaceholder === true) {
      return [];
    }

    return [
      {
        name: normalizeExportText(source.name),
        fitRating: normalizeProjectDashboardExportFitRating(source.fitRating),
        agency_url: normalizeExportText(source.agency_url),
        genres_themes: normalizeExportText(source.genres_themes),
        query_tracker: normalizeExportText(source.query_tracker),
        pub_marketplace: normalizeExportText(source.pub_marketplace),
        email: normalizeExportText(source.email),
        query_sent_date: normalizeProjectDashboardExportDate(
          source.query_sent_date,
        ),
        pages_requested_date: normalizeProjectDashboardExportDate(
          source.pages_requested_date,
        ),
        rejected_date: normalizeProjectDashboardExportDate(source.rejected_date),
        offer_date: normalizeProjectDashboardExportDate(source.offer_date),
        notes: typeof source.notes === "string" ? source.notes : "",
      },
    ];
  });
}

export function getProjectDashboardExportFilename(projectName: unknown) {
  const rawProjectName = normalizeExportText(projectName) || "project-dashboard";
  const slug =
    rawProjectName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLocaleLowerCase()
      .slice(0, 80) || "project-dashboard";

  return `${slug}-query-dashboard.xlsx`;
}
