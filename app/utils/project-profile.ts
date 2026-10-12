import {
  normalizeWriterProjectForSmartMatch,
  type RestoredSmartMatchForm,
  type StoredWriterProject,
} from "./smart-match-restore";

export type ProjectProfile = {
  form: RestoredSmartMatchForm;
  revision: string | null;
  writerProjectId: string | null;
  updatedAt: string | null;
};

export function toProjectProfile(
  project: StoredWriterProject | null,
  name: string,
): ProjectProfile {
  const form = normalizeWriterProjectForSmartMatch(project ?? {});
  // Keep empty author positions in the backend's alternating title/author list.
  if (
    Array.isArray(project?.comps) &&
    project.comps.every((item) => typeof item === "string")
  ) {
    const values = project.comps as string[];
    form.comps = Array.from(
      { length: Math.max(1, Math.min(5, Math.ceil(values.length / 2))) },
      (_, index) => ({
        title: values[index * 2]?.trim() ?? "",
        author: values[index * 2 + 1]?.trim() ?? "",
      }),
    );
  }
  return {
    form: { ...form, project_name: name },
    revision: typeof project?.revision === "string" ? project.revision : null,
    writerProjectId: typeof project?.id === "string" ? project.id : null,
    updatedAt:
      typeof project?.updated_at === "string" ? project.updated_at : null,
  };
}

export function profileTraits(form: RestoredSmartMatchForm) {
  return {
    genre: form.genre || null,
    subgenres: form.subgenres,
    format: form.format || null,
    target_audience: form.target_audience || null,
    themes: form.themes,
    non_fiction: form.non_fiction,
    comps: form.comps
      .filter((comp) => comp.title.trim() || comp.author.trim())
      .flatMap((comp) => [comp.title.trim(), comp.author.trim()]),
  };
}

// A saved title and the default Fiction choice do not make a manuscript profile.
export function hasProjectProfileTraits(form: RestoredSmartMatchForm) {
  return Boolean(
    form.genre.trim() ||
      form.format.trim() ||
      form.target_audience.trim() ||
      form.non_fiction ||
      form.subgenres.length ||
      form.themes.length ||
      form.comps.some((comp) => comp.title.trim() || comp.author.trim()),
  );
}
