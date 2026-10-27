"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/ui-primitives/button";
import { useAgentMatches, FormData } from "../context/agent-matches-context";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { validateQuery, formatComps } from "@/app/utils";
import Comps from "./components/comps";
import Themes from "./components/themes";
import TargetAudience from "./components/target-audience";
import Subgenres from "./components/subgenres";
import Genre from "./components/genre";
import Format from "./components/format";
import ProjectName from "./components/project-name";
import FictionButtonToggle from "./components/fiction-button-toggle";
import ExplanationBlock from "./components/explanation-block";
import { Spinner } from "@/app/ui-primitives/spinner";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import type { SmartMatchWalkthroughStepId } from "./components/smart-match-walkthrough-config";
import { useProfileContext } from "../context/profile-context";
import {
  buildSmartMatchProjectOptions,
  resolveSmartMatchProject,
  getSmartMatchSaveProjectId,
  getSmartMatchSearchForm,
  type SmartMatchProjectReference,
} from "@/app/utils/smart-match-projects";
import type { RestoredSmartMatchForm } from "@/app/utils/smart-match-restore";
import type { ProjectProfile } from "@/app/utils/project-profile";
import { useSmartMatchTraits } from "./hooks/use-smart-match-traits";
import { AgentSearchProgress } from "../components/agent-search-progress";
import { PreviousAgentMatchesButton } from "../components/previous-agent-matches-button";

const SmartMatchWalkthrough = dynamic(
  () =>
    import("./components/smart-match-walkthrough").then(
      (module) => module.SmartMatchWalkthrough,
    ),
  { ssr: false },
);

export type FormState = {
  project_name: string;
  genre: string;
  subgenres: string[];
  format: string;
  target_audience: string;
  comps: { title: string; author: string }[];
  themes: string[];
  enable_ai: boolean;
  non_fiction: boolean;
};

type PreviousSearchResponse = {
  error?: string;
  form?: RestoredSmartMatchForm;
  writer_project_id?: string | null;
};

const SmartMatch = () => {
  const { isSubscribed, isLoading, user } = useClerkUser();
  const { createOrSelectTrait, traitOptions, traitsError } =
    useSmartMatchTraits();
  const {
    projectSummaries,
    updateProject,
    isLoading: isLoadingSavedProjects,
    isError: projectsError,
    refetch,
  } = useProfileContext();
  const {
    saveMatches,
    saveFormData,
    saveNextCursor,
    handleAgentExportResponse,
    saveStatusFilter,
    saveCountryFilter,
    resetForNewSearch,
    saveTotalAgents,
    saveProjectName,
    saveWriterProjectId,
  } = useAgentMatches();
  const [apiMessage, setApiMessage] = useState("");
  const [profileRevision, setProfileRevision] = useState<string | null>(null);
  const [isLoadingProjectTraits, setIsLoadingProjectTraits] = useState(false);
  const [projectTraitsError, setProjectTraitsError] = useState(false);
  const projectRequest = useRef(0);
  const [isRestoringPreviousSearch, setIsRestoringPreviousSearch] =
    useState(false);
  const [selectedProjectReference, setSelectedProjectReference] =
    useState<SmartMatchProjectReference | null>(null);
  const [activeWalkthroughStep, setActiveWalkthroughStep] =
    useState<SmartMatchWalkthroughStepId | null>(null);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    project_name: "",
    genre: "",
    subgenres: [],
    format: "",
    target_audience: "",
    comps: [{ title: "", author: "" }],
    themes: [],
    enable_ai: true,
    non_fiction: false,
  });
  const projectOptions = useMemo(
    () => buildSmartMatchProjectOptions(projectSummaries),
    [projectSummaries],
  );

  const selectProject = useCallback(async (project: SmartMatchProjectReference | null) => {
    const requestId = ++projectRequest.current;
    setSelectedProjectReference(project);
    setProfileRevision(null);
    setProjectTraitsError(false);
    if (!project?.dashboardProjectId) { setIsLoadingProjectTraits(false); return; }
    setIsLoadingProjectTraits(true);
    setApiMessage("");
    try {
      const response = await fetch(`/api/dashboard-projects/${project.dashboardProjectId}/profile`, { cache: "no-store" });
      const body = await response.json() as { profile?: ProjectProfile; error?: string };
      if (!response.ok || !body.profile) throw new Error(body.error || "Unable to load this project's traits.");
      if (requestId !== projectRequest.current) return;
      setForm(body.profile.form);
      setProfileRevision(body.profile.revision);
      setSelectedProjectReference({ ...project, writerProjectId: body.profile.writerProjectId ?? project.writerProjectId });
    } catch (error) {
      if (requestId !== projectRequest.current) return;
      setProjectTraitsError(true);
      setApiMessage(error instanceof Error ? error.message : "Unable to load this project's traits. Select the project again to retry.");
    } finally { if (requestId === projectRequest.current) setIsLoadingProjectTraits(false); }
  }, []);

  const hasSelectedRequestedProject = useRef(false);
  useEffect(() => {
    if (
      isLoading ||
      !user?.id ||
      isLoadingSavedProjects ||
      projectsError ||
      hasSelectedRequestedProject.current
    ) return;
    const projectId = new URLSearchParams(window.location.search).get(
      "project",
    );
    if (!projectId) return;
    const project = projectOptions.find(
      (option) => option.dashboardProjectId === projectId,
    );
    if (project) {
      hasSelectedRequestedProject.current = true;
      void selectProject(project);
    }
  }, [
    isLoading,
    user?.id,
    isLoadingSavedProjects,
    projectsError,
    projectOptions,
    selectProject,
  ]);

  const getWriterProjectIdFromResponse = (data: unknown) => {
    if (!data || typeof data !== "object") return null;
    const value = (data as { writer_project_id?: unknown }).writer_project_id;
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  const queryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const getAgentsEndpoint = isSubscribed
        ? "/api/get-agents-paid"
        : "/api/get-agents-free";

      const getAgentsResp = await fetch(`${getAgentsEndpoint}?last_index=0`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!getAgentsResp.ok) {
        const errorData = await getAgentsResp.json().catch(() => null);
        const message =
          errorData?.error || errorData?.message || "An API error occurred. Please try again.";
        setApiMessage(message);
        throw new Error(message);
      }
      const getAgentsData = await getAgentsResp.json();

      return getAgentsData;
    },

    onSuccess: async (data, submittedFormData) => {
      const totalAgents =
        typeof data.total_agents === "number"
          ? data.total_agents
          : typeof data.total_available === "number"
            ? data.total_available
            : null;
      saveTotalAgents(totalAgents);
      const returnedWriterProjectId = getWriterProjectIdFromResponse(data);

      if (returnedWriterProjectId) {
        const savedForm = getSmartMatchSearchForm(
          submittedFormData,
          returnedWriterProjectId,
          data.dashboard_project,
        );
        saveWriterProjectId(
          getSmartMatchSaveProjectId(savedForm, returnedWriterProjectId),
        );
        saveFormData({ ...savedForm, result_set_id: data.result_set_id });
        if (data.dashboard_project) {
          saveProjectName(data.dashboard_project.project_name);
          await updateProject(data.dashboard_project);
          void refetch();
        }
      }

      if (isSubscribed) handleAgentExportResponse(data);

      if (data.matches.length > 0) {
        saveMatches(data.matches);
        saveNextCursor(typeof data.next_cursor === "number" ? data.next_cursor : -1);
      } else {
        setApiMessage("No matches found");
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleProgressComplete = () => {
    router.push("/agent-matches");
  };

  const handleRestorePreviousSearch = async () => {
    if (isRestoringPreviousSearch) return;

    setIsRestoringPreviousSearch(true);
    setApiMessage("");

    try {
      const response = await fetch("/api/smart-match/previous-search", {
        cache: "no-store",
      });
      const data = (await response
        .json()
        .catch(() => null)) as PreviousSearchResponse | null;

      if (response.status === 404) {
        toast.info("No previous Smart Match search found.");
        return;
      }

      if (!response.ok || !data?.form) {
        throw new Error(
          data?.error || "Unable to restore the previous Smart Match search",
        );
      }

      const restoredWriterProjectId = data.writer_project_id?.trim();
      const existing = projectOptions.find(
        (project) =>
          restoredWriterProjectId &&
          project.writerProjectId === restoredWriterProjectId,
      );
      if (existing) {
        await selectProject(existing);
      } else {
        ++projectRequest.current;
        setIsLoadingProjectTraits(false);
        setProjectTraitsError(false);
        setProfileRevision(null);
        setForm(data.form);
        setSelectedProjectReference(null);
      }
      toast.success("Previous Smart Match search restored.");

      window.requestAnimationFrame(() => {
        document.getElementById("smart-match-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (error) {
      console.error("[smart-match-restore] Client restore failed", error);
      toast.error("Unable to restore the previous Smart Match search.");
    } finally {
      setIsRestoringPreviousSearch(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setApiMessage("");
    if (isLoadingProjectTraits || projectTraitsError) {
      setApiMessage(isLoadingProjectTraits ? "Please wait for this project's saved traits to load." : "Select this project again to load its saved traits before searching.");
      return;
    }
    if (isLoadingSavedProjects || projectsError) {
      setApiMessage(
        "Please wait for your existing projects to load, or try loading them again.",
      );
      return;
    }
    let submittedProject: SmartMatchProjectReference;
    try {
      submittedProject = resolveSmartMatchProject(
        form.project_name,
        selectedProjectReference,
        projectOptions,
      );
    } catch (error) {
      setApiMessage((error as Error).message);
      return;
    }
    const {
      projectName: submittedProjectName,
      writerProjectId: submittedWriterProjectId,
    } = submittedProject;
    const existingProject = projectOptions.find(
      (project) =>
        submittedProject.dashboardProjectId
          ? project.dashboardProjectId === submittedProject.dashboardProjectId
          : project.projectName === submittedProjectName &&
            project.writerProjectId === submittedWriterProjectId,
    );

    if (!submittedProjectName) {
      setApiMessage("Project name required");
      return;
    }

    const comps = formatComps(form.comps);

    const payload = {
      email: user?.primaryEmailAddress?.emailAddress || "",
      writer_project_id: submittedWriterProjectId,
      expected_profile_revision: selectedProjectReference?.dashboardProjectId === submittedProject.dashboardProjectId ? profileRevision : null,
      save_project: existingProject ? submittedProject : undefined,
      project_name: submittedProjectName,
      genre: form.genre,
      subgenres: form.subgenres,
      format: form.format,
      target_audience: form.target_audience,
      comps: comps,
      themes: form.themes,
      enable_ai: true,
      non_fiction: form.non_fiction,
    };

    const { error, isValid } = validateQuery(payload);

    if (!isValid && error) {
      setApiMessage(error);
      return;
    }

    await resetForNewSearch();
    saveProjectName(submittedProjectName);
    saveWriterProjectId(submittedWriterProjectId);
    saveFormData(payload);
    saveStatusFilter("all");
    saveCountryFilter("all");
    queryMutation.mutate(payload);
    window.scrollTo({
      top: 0,
    });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateDesktopViewport = () => {
      setIsDesktopViewport(mediaQuery.matches);
    };

    updateDesktopViewport();
    mediaQuery.addEventListener("change", updateDesktopViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateDesktopViewport);
    };
  }, []);

  const isSearchInProgress = queryMutation.isPending || queryMutation.isSuccess;
  const shouldEnableWalkthrough = isDesktopViewport && !isSearchInProgress;

  if (isLoading) {
    return (
      <div className="ambient-page flex items-center justify-center pt-48 md:ml-[-100px]">
        <Spinner className="size-16 text-accent" />
      </div>
    );
  }

  return (
    <div className="ambient-page pb-48 pt-6 px-4 md:px-6 md:pb-48 md:pt-4">
      {(queryMutation.isPending || queryMutation.isSuccess) && (
        <AgentSearchProgress
          isSuccess={queryMutation.isSuccess}
          onComplete={handleProgressComplete}
        />
      )}
      {!queryMutation.isSuccess && !queryMutation.isPending && (
        <>
          <div className="mx-auto flex w-full max-w-[700px] flex-col justify-start">
            <div className="mb-4">
              <h1 className="mb-7 flex items-center gap-2 font-serif text-4xl font-semibold leading-tight text-accent md:text-[32px]">
                <ScanSearch className="w-10 h-10" />
                Smart Match
              </h1>
              <h2 className="mb-2 text-sm font-semibold text-accent">
                How to get the best results:
              </h2>
              <p className="page-subtitle max-w-none text-sm">
                Fill this out this form as completely as possible. The more
                specific and complete your entries are the better your agent
                matches will be.
              </p>
            </div>
            <div className="flex gap-4 flex-col md:flex-row justify-between mb-4 md:items-center">
              <div className="flex gap-4 flex-col md:flex-row">
                <ExplanationBlock />
                <Button
                  className="w-full md:w-fit"
                  disabled={isRestoringPreviousSearch}
                  onClick={handleRestorePreviousSearch}
                  type="button"
                >
                  {isRestoringPreviousSearch ? (
                    <Spinner
                      className="text-current"
                      data-icon="inline-start"
                    />
                  ) : null}
                  {isRestoringPreviousSearch
                    ? "Restoring..."
                    : "Restore previous search"}
                </Button>
                <PreviousAgentMatchesButton className="w-full md:w-fit" />
              </div>
            </div>
          </div>
          <form id="smart-match-form" onSubmit={handleSubmit}>
            <fieldset disabled={isLoadingProjectTraits} className="glass-panel-strong mx-auto flex w-full max-w-[700px] flex-col items-center gap-8 p-4 py-12 md:p-12">
              {isLoadingProjectTraits && <p role="status" className="text-sm text-accent">Loading saved project traits…</p>}
              <FictionButtonToggle form={form} setForm={setForm} />
              <ProjectName
                form={form}
                setForm={setForm}
                projects={projectOptions}
                selectedProject={selectedProjectReference}
                onProjectSelect={(project) => { void selectProject(project); }}
              />
              {projectsError && (
                <div
                  role="alert"
                  className="flex w-full items-center gap-3 text-sm"
                >
                  Unable to load existing projects.
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => refetch()}
                  >
                    Try again
                  </Button>
                </div>
              )}
              <Genre
                createOrSelectTrait={createOrSelectTrait}
                form={form}
                isWalkthroughGenreDropdownOpen={
                  activeWalkthroughStep === "genre-dropdown"
                }
                options={traitOptions.genre}
                setForm={setForm}
              />
              <Subgenres
                createOrSelectTrait={createOrSelectTrait}
                form={form}
                options={traitOptions.subgenre}
                setForm={setForm}
              />
              <Format
                createOrSelectTrait={createOrSelectTrait}
                form={form}
                options={traitOptions.format}
                setForm={setForm}
              />
              <TargetAudience form={form} setForm={setForm} />
              <Themes
                createOrSelectTrait={createOrSelectTrait}
                form={form}
                options={traitOptions.theme}
                setForm={setForm}
              />
              <Comps form={form} setForm={setForm} />
              {traitsError && (
                <div className="w-full text-sm font-medium text-red-500">
                  {traitsError}
                </div>
              )}
              {apiMessage && (
                <div className="w-full text-base font-semibold text-red-500">
                  {apiMessage}
                </div>
              )}
              <div className="mt-12 flex w-full justify-center">
                <Button
                  type="submit"
                  disabled={isLoadingSavedProjects || projectsError}
                  className="w-full text-lg font-semibold md:w-1/2"
                >
                  Search for Agents
                </Button>
              </div>
            </fieldset>
          </form>
        </>
      )}
      <SmartMatchWalkthrough
        enabled={shouldEnableWalkthrough}
        onActiveStepChange={setActiveWalkthroughStep}
      />
    </div>
  );
};

export default SmartMatch;
