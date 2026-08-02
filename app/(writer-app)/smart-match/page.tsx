"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/ui-primitives/button";
import {
  useAgentMatches,
  FormData,
} from "../context/agent-matches-context";
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
import { startSheetPolling } from "../workers/sheet-worker-manager";
import type { SmartMatchWalkthroughStepId } from "./components/smart-match-walkthrough-config";
import { useProfileContext } from "../context/profile-context";
import TooltipComponent from "@/app/components/tooltip";
import {
  getProjectNamesFromAgentMatches,
  getWriterProjectIdForProjectName,
} from "@/app/utils/project-dashboard-summary";
import type { RestoredSmartMatchForm } from "@/app/utils/smart-match-restore";
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

type RestoredProjectReference = {
  projectName: string;
  writerProjectId: string;
};

const SmartMatch = () => {
  const { isSubscribed, isLoading, user } = useClerkUser();
  const { createOrSelectTrait, traitOptions, traitsError } =
    useSmartMatchTraits();
  const { agentsList } = useProfileContext();
  const { saveMatches, saveFormData, saveNextCursor, saveSpreadsheetUrl, saveStatusFilter, saveCountryFilter, startSpreadsheetPolling, resetForNewSearch, saveTotalAgents, saveProjectName, saveWriterProjectId } =
    useAgentMatches();
  const [apiMessage, setApiMessage] = useState("");
  const [isRestoringPreviousSearch, setIsRestoringPreviousSearch] =
    useState(false);
  const [restoredProjectReference, setRestoredProjectReference] =
    useState<RestoredProjectReference | null>(null);
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
  const projectNames = useMemo(
    () => getProjectNamesFromAgentMatches(agentsList),
    [agentsList]
  );

  const resolveSubmittedProjectName = (projectName: string) => {
    const trimmedProjectName = projectName.trim();
    if (!trimmedProjectName) return "";

    return (
      projectNames.find(
        (name) =>
          name.toLocaleLowerCase() ===
          trimmedProjectName.toLocaleLowerCase()
      ) ?? trimmedProjectName
    );
  };

  const getWriterProjectIdFromResponse = (data: unknown) => {
    if (!data || typeof data !== "object") return null;
    const value = (data as { writer_project_id?: unknown }).writer_project_id;
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  const queryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      saveSpreadsheetUrl(null);
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
        setApiMessage("An API error occurred. Please try again.");
        throw new Error(`Query request failed: ${getAgentsResp.status}`);
      }
      const getAgentsData = await getAgentsResp.json();

      return getAgentsData;
    },

    onSuccess: (data, submittedFormData) => {
      const totalAgents = typeof data.total_agents === "number" ? data.total_agents : typeof data.total_available === "number" ? data.total_available : null;
      saveTotalAgents(totalAgents);
      const returnedWriterProjectId = getWriterProjectIdFromResponse(data);

      if (returnedWriterProjectId) {
        saveWriterProjectId(returnedWriterProjectId);
        saveFormData({
          ...submittedFormData,
          writer_project_id: returnedWriterProjectId,
        });
      }

      if (data.matches.length > 0) {
        saveMatches(data.matches);
        saveNextCursor(data.next_cursor);

        if (data.task_id) {
          startSpreadsheetPolling(data.task_id);

          startSheetPolling(
            data.task_id,
            (url) => {
              saveSpreadsheetUrl(url);
            },
            () => {
            }
          );
        }
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
    if (!isSubscribed || isRestoringPreviousSearch) return;

    setIsRestoringPreviousSearch(true);
    setApiMessage("");

    try {
      const response = await fetch("/api/smart-match/previous-search", {
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as
        | PreviousSearchResponse
        | null;

      if (response.status === 404) {
        toast.info("No previous Smart Match search found.");
        return;
      }

      if (response.status === 403) {
        toast.error("Subscribe for access");
        return;
      }

      if (!response.ok || !data?.form) {
        throw new Error(
          data?.error || "Unable to restore the previous Smart Match search",
        );
      }

      setForm(data.form);
      const restoredWriterProjectId = data.writer_project_id?.trim();
      setRestoredProjectReference(
        restoredWriterProjectId
          ? {
              projectName: data.form.project_name,
              writerProjectId: restoredWriterProjectId,
            }
          : null,
      );
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
    await resetForNewSearch();

    const submittedProjectName = resolveSubmittedProjectName(form.project_name);
    const restoredWriterProjectId =
      restoredProjectReference &&
      restoredProjectReference.projectName.trim().toLocaleLowerCase() ===
        submittedProjectName.trim().toLocaleLowerCase()
        ? restoredProjectReference.writerProjectId
        : null;
    const submittedWriterProjectId =
      restoredWriterProjectId ??
      getWriterProjectIdForProjectName(agentsList, submittedProjectName);

    if (!submittedProjectName) {
      setApiMessage("Project name required");
      return;
    }

    const comps = formatComps(form.comps);

    const payload = {
      email: user?.primaryEmailAddress?.emailAddress || "",
      writer_project_id: submittedWriterProjectId,
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
                {!isSubscribed ? (
                  <TooltipComponent
                    asChild
                    className="inline-block w-full md:w-fit"
                    content="Subscribe for access"
                    contentClass="text-center"
                  >
                    <span tabIndex={0}>
                      <Button
                        className="w-full md:w-fit"
                        disabled
                        type="button"
                      >
                        Restore previous search
                      </Button>
                    </span>
                  </TooltipComponent>
                ) : (
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
                )}
                <PreviousAgentMatchesButton className="w-full md:w-fit" />
              </div>
            </div>
          </div>
          <form id="smart-match-form" onSubmit={handleSubmit}>
            <div className="glass-panel-strong mx-auto flex w-full max-w-[700px] flex-col items-center gap-8 p-4 py-12 md:p-12">
              <FictionButtonToggle form={form} setForm={setForm} />
              <ProjectName
                form={form}
                setForm={setForm}
                projectNames={projectNames}
              />
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
                  className="w-full text-lg font-semibold md:w-1/2"
                >
                  Search for Agents
                </Button>
              </div>
            </div>
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
