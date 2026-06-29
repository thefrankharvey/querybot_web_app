"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FolderKanban,
  Pencil,
  Save,
  ScanSearch,
  Sparkles,
  Tags,
  Users,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import {
  TraitMultiSelectField,
  TraitSingleSelectField,
} from "@/app/components/traits/trait-fields";
import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import { Separator } from "@/app/ui-primitives/separator";
import { Switch } from "@/app/ui-primitives/switch";
import { Textarea } from "@/app/ui-primitives/textarea";
import { QUERY_DASH_COLUMNS } from "@/app/(writer-app)/query-dashboard/components/kanban-config";
import { useProfileContext } from "@/app/(writer-app)/context/profile-context";
import { useManuscriptTraits } from "@/app/hooks/use-manuscript-traits";
import {
  buildProjectDashboardSummaries,
  getProjectDashboardHref,
  PROJECT_STATUS_CHIP_LABELS,
} from "@/app/utils/project-dashboard-summary";
import {
  getProjectProfileHrefById,
  type ProjectProfile,
} from "@/app/utils/project-profile";
import {
  formatTraitLabel,
  resolveTraitValues,
  type TraitOption,
  type TraitType,
} from "@/lib/traits";

type ProjectProfileDraft = {
  projectName: string;
  description: string;
  genre: string;
  subgenres: string[];
  format: string;
  targetAudience: string;
  comps: string;
  themes: string[];
  nonFiction: boolean;
};

type ProjectProfileSource = "writer-project-api" | "saved-agents-fallback";

type SaveProjectProfileResponse = {
  source: ProjectProfileSource;
  hasProfileMetadata: boolean;
  updatedSavedAgentRows: number;
  profile: ProjectProfile;
};

type SummaryItemProps = {
  icon: typeof BookOpen;
  label: string;
  value: string;
};

const TRAIT_SELECT_CONTENT_CLASS =
  "w-[min(42rem,calc(100vw-2rem))] md:w-[min(42rem,calc(100vw-2rem))]";
const TRAIT_SELECT_TRIGGER_CLASS = "w-full flex-none md:w-full";
const TRAIT_SELECTED_BADGE_CLASS =
  "rounded-full border-accent/10 bg-[#E2E8F1] px-3 text-accent";
const TRAIT_CUSTOM_ADD_CLASS = "md:w-full";

function resolveProjectTraitList(
  type: TraitType,
  values: string[],
  options: TraitOption[],
) {
  return resolveTraitValues(type, values, options);
}

function resolveProjectTraitValue(
  type: TraitType,
  value: string,
  options: TraitOption[],
) {
  return resolveTraitValues(type, [value], options)[0] ?? value.trim();
}

function createDraft(
  profile: ProjectProfile,
  traitOptions: Record<TraitType, TraitOption[]>,
): ProjectProfileDraft {
  return {
    projectName: profile.projectName,
    description: profile.description,
    genre: resolveProjectTraitValue("genre", profile.genre, traitOptions.genre),
    subgenres: resolveProjectTraitList(
      "subgenre",
      profile.subgenres,
      traitOptions.subgenre,
    ),
    format: resolveProjectTraitValue(
      "format",
      profile.format,
      traitOptions.format,
    ),
    targetAudience: profile.targetAudience,
    comps: profile.comps.join(", "),
    themes: resolveProjectTraitList(
      "theme",
      profile.themes,
      traitOptions.theme,
    ),
    nonFiction: profile.nonFiction,
  };
}

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listsMatch(left: string[], right: string[]) {
  if (left.length !== right.length) return false;

  return left.every((item, index) => item === right[index]);
}

function formatLabel(value: string) {
  return value ? formatTraitLabel(value) : "Info unavailable";
}

function getProjectNameKey(projectName: string) {
  return projectName.trim().toLocaleLowerCase();
}

function TraitChips({
  formatItems = true,
  items,
  title,
}: {
  formatItems?: boolean;
  items: string[];
  title: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent/58">
        {title}
      </h2>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span className="surface-tag px-3 py-1.5 text-sm" key={item}>
              {formatItems ? formatTraitLabel(item) : item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-base leading-7 text-accent/72">Info unavailable</p>
      )}
    </section>
  );
}

function SummaryItem({ icon: Icon, label, value }: SummaryItemProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/10 bg-white/72 text-accent/72">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent/52">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold leading-6 text-accent/78">
          {value}
        </p>
      </div>
    </div>
  );
}

function ProjectProfileFormField({
  children,
  id,
  label,
}: {
  children: ReactNode;
  id: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        className="text-xs font-semibold uppercase tracking-[0.16em] text-accent/58"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function ProjectProfileClient({
  hasProfileMetadata,
  initialProfile,
  source,
}: {
  hasProfileMetadata: boolean;
  initialProfile: ProjectProfile;
  source: ProjectProfileSource;
}) {
  const router = useRouter();
  const {
    createOrSelectTrait,
    isCreatingTrait,
    isLoadingTraits,
    traitOptions,
    traitsError,
  } = useManuscriptTraits();
  const [profile, setProfile] = useState(initialProfile);
  const [profileSource, setProfileSource] =
    useState<ProjectProfileSource>(source);
  const [hasSavedProfileMetadata, setHasSavedProfileMetadata] =
    useState(hasProfileMetadata);
  const [draft, setDraft] = useState<ProjectProfileDraft>(() =>
    createDraft(initialProfile, traitOptions),
  );
  const [isEditing, setIsEditing] = useState(!hasProfileMetadata);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const { agentsList, refetch } = useProfileContext();
  const activeWriterProjectId =
    profile.writerProjectId ?? profile.savedAgentWriterProjectId ?? null;
  const dashboardHref = getProjectDashboardHref(
    profile.projectName,
    activeWriterProjectId,
  );
  const projectSummary = useMemo(() => {
    const projectKey = getProjectNameKey(profile.projectName);
    return buildProjectDashboardSummaries(agentsList).find(
      (summary) =>
        (activeWriterProjectId &&
          summary.writerProjectId === activeWriterProjectId) ||
        (!summary.writerProjectId &&
          getProjectNameKey(summary.projectName) === projectKey),
    );
  }, [activeWriterProjectId, agentsList, profile.projectName]);
  const savedAgentCount = projectSummary?.savedAgentCount ?? profile.matchCount;
  const visibleStatuses = projectSummary
    ? QUERY_DASH_COLUMNS.map((column) => ({
        id: column.id,
        label: PROJECT_STATUS_CHIP_LABELS[column.id],
        count: projectSummary.countsByColumn[column.id],
      })).filter((status) => status.count > 0)
    : [];

  useEffect(() => {
    if (!isEditing) return;

    setDraft((current) => {
      const genre = resolveProjectTraitValue(
        "genre",
        current.genre,
        traitOptions.genre,
      );
      const subgenres = resolveProjectTraitList(
        "subgenre",
        current.subgenres,
        traitOptions.subgenre,
      );
      const format = resolveProjectTraitValue(
        "format",
        current.format,
        traitOptions.format,
      );
      const themes = resolveProjectTraitList(
        "theme",
        current.themes,
        traitOptions.theme,
      );

      if (
        current.genre === genre &&
        current.format === format &&
        listsMatch(current.subgenres, subgenres) &&
        listsMatch(current.themes, themes)
      ) {
        return current;
      }

      return {
        ...current,
        genre,
        subgenres,
        format,
        themes,
      };
    });
  }, [isEditing, traitOptions]);

  const updateDraft = <TKey extends keyof ProjectProfileDraft>(
    key: TKey,
    value: ProjectProfileDraft[TKey],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const startEditing = () => {
    setDraft(createDraft(profile, traitOptions));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(createDraft(profile, traitOptions));
    setIsEditing(false);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSavingProfile) return;

    const genre = resolveProjectTraitValue(
      "genre",
      draft.genre,
      traitOptions.genre,
    );
    const subgenres = resolveProjectTraitList(
      "subgenre",
      draft.subgenres,
      traitOptions.subgenre,
    );
    const format = resolveProjectTraitValue(
      "format",
      draft.format,
      traitOptions.format,
    );
    const themes = resolveProjectTraitList(
      "theme",
      draft.themes,
      traitOptions.theme,
    );
    const nextProjectName = draft.projectName.trim() || profile.projectName;

    setIsSavingProfile(true);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(profile.projectId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            writerProjectId: profile.writerProjectId,
            savedAgentWriterProjectId: profile.savedAgentWriterProjectId,
            previousProjectName: profile.projectName,
            matchCount: savedAgentCount,
            projectName: nextProjectName,
            description: draft.description.trim(),
            genre,
            subgenres,
            format,
            targetAudience: draft.targetAudience.trim(),
            comps: parseList(draft.comps),
            themes,
            enableAi: profile.enableAi,
            nonFiction: draft.nonFiction,
          }),
        },
      );
      const body = (await response.json()) as
        | SaveProjectProfileResponse
        | { error?: string };

      if (!response.ok || !("profile" in body)) {
        const errorMessage = "error" in body ? body.error : null;
        throw new Error(errorMessage || "Failed to save project profile");
      }

      setProfile(body.profile);
      setProfileSource(body.source);
      setHasSavedProfileMetadata(body.hasProfileMetadata);
      setDraft(createDraft(body.profile, traitOptions));
      setIsEditing(!body.hasProfileMetadata);
      toast.success("Project profile saved.");

      await refetch();

      if (
        profileSource === "saved-agents-fallback" ||
        profile.projectId !== body.profile.projectId
      ) {
        router.replace(getProjectProfileHrefById(body.profile.projectId));
      }
    } catch (error) {
      toast.error("Failed to save project profile", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <main className="ambient-page px-4 pb-16 pt-6 md:px-6 md:pt-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <section className="glass-panel-strong flex flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-2xl flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex w-fit items-center gap-3 rounded-[18px] border border-accent/10 bg-white/72 px-4 py-3">
                  <div className="flex items-center gap-2 text-accent/64">
                    <Users className="size-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase text-accent/54">
                      Saved Agents
                    </span>
                  </div>
                  <span className="text-2xl font-bold leading-none text-accent">
                    {savedAgentCount}
                  </span>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link href={dashboardHref}>
                    <FolderKanban data-icon="inline-start" />
                    Project Query Dashboard
                  </Link>
                </Button>
              </div>
              {visibleStatuses.length > 0 ? (
                <div
                  className="flex max-w-xl flex-wrap gap-1.5"
                  aria-label="Project status counts"
                >
                  {visibleStatuses.map((status) => (
                    <span
                      className="inline-flex min-h-8 items-center gap-1 rounded-full border border-accent/10 bg-white/86 px-2.5 text-xs font-semibold text-accent/68"
                      key={status.id}
                    >
                      <span>{status.label}</span>
                      <span className="text-accent">{status.count}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-accent/54">
                  No saved agent stages yet.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button asChild variant="outline">
                <Link href={dashboardHref}>
                  <FolderKanban data-icon="inline-start" />
                  Previous Agent Matches
                </Link>
              </Button>
              <Button asChild>
                <Link href="/smart-match">
                  <ScanSearch data-icon="inline-start" />
                  Run Smart Match
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {isEditing ? (
          <section className="glass-panel-strong p-5 md:p-10">
            <form className="flex flex-col gap-8" onSubmit={saveProfile}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent/58">
                    Project profile
                  </p>
                  <h2 className="font-serif text-3xl font-semibold leading-tight text-accent md:text-4xl">
                    {hasSavedProfileMetadata
                      ? "Edit project"
                      : draft.projectName.trim() || profile.projectName}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hasSavedProfileMetadata ? (
                    <Button
                      disabled={isSavingProfile}
                      onClick={cancelEditing}
                      type="button"
                      variant="outline"
                    >
                      <X data-icon="inline-start" />
                      Cancel
                    </Button>
                  ) : null}
                  <Button disabled={isSavingProfile} type="submit">
                    <Save data-icon="inline-start" />
                    {isSavingProfile ? "Saving" : "Save"}
                  </Button>
                </div>
              </div>

              <Separator className="bg-accent/10" />

              {isLoadingTraits ? (
                <p className="text-sm font-medium text-accent/64">
                  Loading trait options...
                </p>
              ) : null}
              {traitsError ? (
                <p className="text-sm font-medium text-destructive">
                  Trait options could not load. Using fallback options.{" "}
                  {traitsError}
                </p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <ProjectProfileFormField id="project-name" label="Project name">
                  <Input
                    id="project-name"
                    onChange={(event) =>
                      updateDraft("projectName", event.target.value)
                    }
                    value={draft.projectName}
                  />
                </ProjectProfileFormField>
                <TraitSingleSelectField
                  contentClassName={TRAIT_SELECT_CONTENT_CLASS}
                  createOrSelectTrait={createOrSelectTrait}
                  customAddClassName={TRAIT_CUSTOM_ADD_CLASS}
                  id="project-genre"
                  isCreatingTrait={isCreatingTrait}
                  label="Genre"
                  onValueChange={(value) => updateDraft("genre", value)}
                  options={traitOptions.genre}
                  optionTitle="genre"
                  triggerClassName={TRAIT_SELECT_TRIGGER_CLASS}
                  traitType="genre"
                  value={draft.genre}
                />
              </div>

              <ProjectProfileFormField
                id="project-description"
                label="Description"
              >
                <Textarea
                  id="project-description"
                  onChange={(event) =>
                    updateDraft("description", event.target.value)
                  }
                  rows={5}
                  value={draft.description}
                />
              </ProjectProfileFormField>

              <div className="grid gap-4 md:grid-cols-2">
                <TraitMultiSelectField
                  contentClassName={TRAIT_SELECT_CONTENT_CLASS}
                  createOrSelectTrait={createOrSelectTrait}
                  customAddClassName={TRAIT_CUSTOM_ADD_CLASS}
                  id="project-subgenres"
                  isCreatingTrait={isCreatingTrait}
                  label="Subgenres"
                  onValueChange={(value) => updateDraft("subgenres", value)}
                  options={traitOptions.subgenre}
                  optionTitle="subgenres"
                  selectedBadgeClassName={TRAIT_SELECTED_BADGE_CLASS}
                  triggerClassName={TRAIT_SELECT_TRIGGER_CLASS}
                  traitType="subgenre"
                  value={draft.subgenres}
                />
                <TraitSingleSelectField
                  contentClassName={TRAIT_SELECT_CONTENT_CLASS}
                  createOrSelectTrait={createOrSelectTrait}
                  customAddClassName={TRAIT_CUSTOM_ADD_CLASS}
                  id="project-format"
                  isCreatingTrait={isCreatingTrait}
                  label="Format"
                  onValueChange={(value) => updateDraft("format", value)}
                  options={traitOptions.format}
                  optionTitle="format"
                  triggerClassName={TRAIT_SELECT_TRIGGER_CLASS}
                  traitType="format"
                  value={draft.format}
                />
                <ProjectProfileFormField id="project-audience" label="Audience">
                  <Input
                    id="project-audience"
                    onChange={(event) =>
                      updateDraft("targetAudience", event.target.value)
                    }
                    value={draft.targetAudience}
                  />
                </ProjectProfileFormField>
                <TraitMultiSelectField
                  contentClassName={TRAIT_SELECT_CONTENT_CLASS}
                  createOrSelectTrait={createOrSelectTrait}
                  customAddClassName={TRAIT_CUSTOM_ADD_CLASS}
                  id="project-themes"
                  isCreatingTrait={isCreatingTrait}
                  label="Themes"
                  onValueChange={(value) => updateDraft("themes", value)}
                  options={traitOptions.theme}
                  optionTitle="themes"
                  selectedBadgeClassName={TRAIT_SELECTED_BADGE_CLASS}
                  triggerClassName={TRAIT_SELECT_TRIGGER_CLASS}
                  traitType="theme"
                  value={draft.themes}
                />
              </div>

              <ProjectProfileFormField id="project-comps" label="Comps">
                <Textarea
                  id="project-comps"
                  onChange={(event) => updateDraft("comps", event.target.value)}
                  rows={3}
                  value={draft.comps}
                />
              </ProjectProfileFormField>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex min-h-14 items-center justify-between gap-4 rounded-[18px] border border-accent/10 bg-white/72 px-4 py-3 text-sm font-semibold text-accent/78">
                  <span>Nonfiction</span>
                  <Switch
                    checked={draft.nonFiction}
                    onCheckedChange={(checked) =>
                      updateDraft("nonFiction", checked)
                    }
                  />
                </label>
              </div>
            </form>
          </section>
        ) : (
          <section className="glass-panel-strong flex flex-col gap-8 p-5 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent/58">
                  Project description
                </p>
                <h2 className="break-words font-serif text-2xl font-semibold leading-tight text-accent md:text-3xl">
                  {profile.projectName}
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-accent/72">
                  {profile.description || "Add your description here"}
                </p>
              </div>
              <Button
                className="w-fit shrink-0"
                onClick={startEditing}
                type="button"
                variant="outline"
              >
                <Pencil data-icon="inline-start" />
                Edit
              </Button>
            </div>

            <Separator className="bg-accent/10" />

            <div className="grid gap-5 md:grid-cols-3">
              <SummaryItem
                icon={BookOpen}
                label="Genre"
                value={formatLabel(profile.genre)}
              />
              <SummaryItem
                icon={Tags}
                label="Format"
                value={formatLabel(profile.format)}
              />
              <SummaryItem
                icon={Sparkles}
                label="Audience"
                value={formatLabel(profile.targetAudience)}
              />
            </div>

            <Separator className="bg-accent/10" />

            <div className="grid gap-8 lg:grid-cols-2">
              <TraitChips items={profile.subgenres} title="Subgenres" />
              <TraitChips items={profile.themes} title="Themes" />
              <TraitChips
                formatItems={false}
                items={profile.comps}
                title="Comps"
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
