export type SmartMatchProjectReference = {
  projectName: string;
  dashboardProjectId?: string;
  writerProjectId: string | null;
};

export type SmartMatchProjectOption = SmartMatchProjectReference & {
  key: string;
  label: string;
  savedAgentCount: number;
};

const nameKey = (name: string) => name.trim().toLowerCase();

export function buildSmartMatchProjectOptions(
  savedProjects: (SmartMatchProjectReference & { savedAgentCount: number })[],
): SmartMatchProjectOption[] {
  const projects = new Map<string, SmartMatchProjectOption>();

  // Only persisted dashboards are choices; searches alone never create one.
  for (const project of savedProjects) {
    const key = project.dashboardProjectId
      ? `dashboard:${project.dashboardProjectId}`
      : project.writerProjectId
        ? `writer:${project.writerProjectId}`
        : `name:${nameKey(project.projectName)}`;
    projects.set(key, {
      ...project,
      key,
      label: project.projectName,
      savedAgentCount:
        "savedAgentCount" in project &&
        typeof project.savedAgentCount === "number"
          ? project.savedAgentCount
          : 0,
    });
  }

  const options = [...projects.values()].sort(
    (a, b) =>
      a.projectName.localeCompare(b.projectName) || a.key.localeCompare(b.key),
  );
  const counts = new Map<string, number>();
  for (const option of options) {
    const key = nameKey(option.projectName);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const positions = new Map<string, number>();
  return options.map((option) => {
    const key = nameKey(option.projectName);
    if (counts.get(key) === 1) return option;
    const position = (positions.get(key) ?? 0) + 1;
    positions.set(key, position);
    return {
      ...option,
      label: `${option.projectName} (${position}, ${option.savedAgentCount} saved agents)`,
    };
  });
}

export function resolveSmartMatchProject(
  projectName: string,
  selectedProject: SmartMatchProjectReference | null,
  projects: SmartMatchProjectReference[],
): SmartMatchProjectReference {
  const trimmedName = projectName.trim();
  const key = nameKey(trimmedName);

  const matches = projects.filter(
    (project) => nameKey(project.projectName) === key,
  );
  if (
    selectedProject &&
    nameKey(selectedProject.projectName) === key &&
    (matches.length === 0 ||
      matches.some(
        (project) =>
          project.writerProjectId === selectedProject.writerProjectId,
      ))
  ) {
    const selectedMatch = matches.find(
      (project) => project.writerProjectId === selectedProject.writerProjectId,
    );
    return {
      ...(selectedMatch?.dashboardProjectId
        ? { dashboardProjectId: selectedMatch.dashboardProjectId }
        : {}),
      projectName: selectedMatch?.projectName ?? trimmedName,
      writerProjectId: selectedProject.writerProjectId,
    };
  }

  const ids = new Set(matches.map((project) => project.writerProjectId));
  if (ids.size > 1) {
    throw new Error(
      "More than one project has this name. Choose the existing project you want to use.",
    );
  }

  return {
    ...(matches[0]?.dashboardProjectId
      ? { dashboardProjectId: matches[0].dashboardProjectId }
      : {}),
    projectName: matches[0]?.projectName ?? trimmedName,
    writerProjectId:
      matches.find((project) => project.writerProjectId)?.writerProjectId ??
      null,
  };
}

// Search history and the saved dashboard can have different identities for older
// projects. Preserve an explicit null ID so saves stay in the legacy dashboard.
export function getSmartMatchSaveProjectId(
  form: { save_project?: SmartMatchProjectReference },
  searchWriterProjectId: string | null,
) {
  return form.save_project
    ? form.save_project.writerProjectId
    : searchWriterProjectId;
}
