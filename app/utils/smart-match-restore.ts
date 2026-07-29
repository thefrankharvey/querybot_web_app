export type RestoredSmartMatchComp = {
  title: string;
  author: string;
};

export type RestoredSmartMatchForm = {
  project_name: string;
  genre: string;
  subgenres: string[];
  format: string;
  target_audience: string;
  comps: RestoredSmartMatchComp[];
  themes: string[];
  enable_ai: boolean;
  non_fiction: boolean;
};

export type StoredWriterProject = {
  id?: unknown;
  name?: unknown;
  project_name?: unknown;
  project_title?: unknown;
  title?: unknown;
  genre?: unknown;
  subgenres?: unknown;
  format?: unknown;
  target_audience?: unknown;
  comps?: unknown;
  themes?: unknown;
  enable_ai?: unknown;
  non_fiction?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
  [column: string]: unknown;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getFirstString(...values: unknown[]) {
  for (const value of values) {
    const stringValue = getString(value);
    if (stringValue) return stringValue;
  }

  return "";
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => getString(item))
      .filter(Boolean);
  }

  const stringValue = getString(value);
  if (!stringValue) return [];

  const parsedValue = parseJson(stringValue);
  if (parsedValue !== undefined) {
    return normalizeStringList(parsedValue);
  }

  return stringValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSingleString(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(getString).find(Boolean) ?? "";
  }

  return getString(value);
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLocaleLowerCase();
    if (normalizedValue === "true" || normalizedValue === "1") return true;
    if (normalizedValue === "false" || normalizedValue === "0") return false;
  }

  return fallback;
}

function normalizeCompObjects(value: unknown[]) {
  const comps = value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return [];
    }

    const comp = item as Record<string, unknown>;
    const title = getString(comp.title);
    const author = getString(comp.author);

    return title || author ? [{ title, author }] : [];
  });

  return comps.slice(0, 5);
}

function normalizeFlatComps(value: unknown[]) {
  const items = value.map(getString).filter(Boolean);
  const comps: RestoredSmartMatchComp[] = [];

  for (let index = 0; index < items.length && comps.length < 5; index += 2) {
    comps.push({
      title: items[index] ?? "",
      author: items[index + 1] ?? "",
    });
  }

  return comps;
}

function normalizeComps(value: unknown): RestoredSmartMatchComp[] {
  if (typeof value === "string") {
    const parsedValue = parseJson(value.trim());
    if (parsedValue !== undefined) {
      return normalizeComps(parsedValue);
    }

    const comps = normalizeFlatComps(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );

    return comps.length > 0 ? comps : [{ title: "", author: "" }];
  }

  if (!Array.isArray(value)) {
    return [{ title: "", author: "" }];
  }

  const hasObjectComp = value.some(
    (item) => Boolean(item) && typeof item === "object" && !Array.isArray(item),
  );
  const comps = hasObjectComp
    ? normalizeCompObjects(value)
    : normalizeFlatComps(value);

  return comps.length > 0 ? comps : [{ title: "", author: "" }];
}

function getProjectTimestamp(project: StoredWriterProject) {
  for (const value of [project.updated_at, project.created_at]) {
    const dateValue = getString(value);
    if (!dateValue) continue;

    const timestamp = Date.parse(dateValue);
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  return Number.NEGATIVE_INFINITY;
}

export function selectMostRecentWriterProject(
  projects: StoredWriterProject[],
) {
  let selectedProject: StoredWriterProject | null = null;
  let selectedTimestamp = Number.NEGATIVE_INFINITY;

  for (const project of projects) {
    const timestamp = getProjectTimestamp(project);

    if (!selectedProject || timestamp > selectedTimestamp) {
      selectedProject = project;
      selectedTimestamp = timestamp;
    }
  }

  return selectedProject;
}

export function selectMostRecentNamedWriterProject(
  projects: StoredWriterProject[],
) {
  return selectMostRecentWriterProject(
    projects.filter((project) => Boolean(getStoredWriterProjectName(project))),
  );
}

export function normalizeWriterProjectForSmartMatch(
  project: StoredWriterProject,
): RestoredSmartMatchForm {
  return {
    project_name: getStoredWriterProjectName(project),
    genre: normalizeSingleString(project.genre),
    subgenres: normalizeStringList(project.subgenres),
    format: normalizeSingleString(project.format),
    target_audience: getString(project.target_audience),
    comps: normalizeComps(project.comps),
    themes: normalizeStringList(project.themes),
    enable_ai: normalizeBoolean(project.enable_ai, true),
    non_fiction: normalizeBoolean(project.non_fiction, false),
  };
}

export function getStoredWriterProjectId(project: StoredWriterProject) {
  return getString(project.id) || null;
}

export function getStoredWriterProjectName(project: StoredWriterProject) {
  return getFirstString(
    project.project_name,
    project.project_title,
    project.title,
    project.name,
  );
}

export function getStoredWriterProjectTimestamp(project: StoredWriterProject) {
  return (
    getString(project.updated_at) ||
    getString(project.created_at) ||
    null
  );
}
