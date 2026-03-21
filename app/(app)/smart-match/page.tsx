"use client";

import React, { useState } from "react";
import { ScanSearch } from "lucide-react";
import { Button } from "@/app/ui-primitives/button";
import {
  useAgentMatches,
  FormData,
} from "../context/agent-matches-context";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { validateQuery, formatComps, getFromLocalStorage } from "@/app/utils";
import Comps from "./components/comps";
import Themes from "./components/themes";
import TargetAudience from "./components/target-audience";
import Subgenres from "./components/subgenres";
import Genre from "./components/genre";
import Format from "./components/format";
import FictionButtonToggle from "./components/fiction-button-toggle";
import ExplanationBlock from "./components/explanation-block";
import { Spinner } from "@/app/ui-primitives/spinner";
import ProgressBar from "./components/progress-bar";
import { useClerkUser } from "@/app/hooks/use-clerk-user";
import { startSheetPolling } from "../workers/sheet-worker-manager";

export type FormState = {
  genre: string;
  subgenres: string[];
  format: string;
  target_audience: string;
  comps: { title: string; author: string }[];
  themes: string[];
  enable_ai: boolean;
  non_fiction: boolean;
};

const SmartMatch = () => {
  const { isSubscribed, isLoading, user } = useClerkUser();
  const hasAgentMatches = getFromLocalStorage("agent_matches");
  const { saveMatches, saveFormData, saveNextCursor, saveSpreadsheetUrl, saveStatusFilter, saveCountryFilter, startSpreadsheetPolling, resetForNewSearch, saveTotalAgents } =
    useAgentMatches();
  const [apiMessage, setApiMessage] = useState("");
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    genre: "",
    subgenres: [],
    format: "",
    target_audience: "",
    comps: [{ title: "", author: "" }],
    themes: [],
    enable_ai: true,
    non_fiction: false,
  });

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

    onSuccess: (data) => {
      const totalAgents = typeof data.total_agents === "number" ? data.total_agents : typeof data.total_available === "number" ? data.total_available : null;
      saveTotalAgents(totalAgents);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetForNewSearch();
    const comps = formatComps(form.comps);

    const payload = {
      email: user?.primaryEmailAddress?.emailAddress || "",
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

    saveFormData(payload);
    saveStatusFilter("all");
    saveCountryFilter("all");
    queryMutation.mutate(payload);
    window.scrollTo({
      top: 0,
    });
  };

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
        <div className="mt-40 flex h-[700px] flex-col items-center md:mx-auto md:w-[700px]">
          <ProgressBar
            isSuccess={queryMutation.isSuccess}
            onComplete={handleProgressComplete}
          />
        </div>
      )}
      {!queryMutation.isSuccess && !queryMutation.isPending && (
        <>
          <div className="mx-auto flex w-full max-w-[700px] flex-col justify-start">
            <div className="mb-4">
              <h1 className="mb-7 flex items-center gap-2 font-serif text-4xl font-semibold leading-tight text-accent md:text-[32px]">
                <ScanSearch className="w-10 h-10" />
                Smart Match
              </h1>
              <h2 className="mb-2 text-base font-semibold text-accent">
                How to get the best results:
              </h2>
              <p className="page-subtitle max-w-none">
                Fill this out this form as completely as possible. The more
                specific and complete your entries are the better your agent
                matches will be.
              </p>
            </div>
            <div className="flex gap-4 flex-col md:flex-row justify-between mb-4 md:items-center">
              <div className="flex gap-4 flex-col md:flex-row">
                <ExplanationBlock />
                {hasAgentMatches &&
                  hasAgentMatches.length > 0 && (
                    <Link href="/agent-matches" className="w-full md:w-fit">
                      <Button className="w-full md:w-fit" variant="default">
                        Previous Agent Matches
                      </Button>
                    </Link>
                  )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="glass-panel-strong mx-auto flex w-full max-w-[700px] flex-col items-center gap-8 p-4 py-12 md:p-12">
              <FictionButtonToggle form={form} setForm={setForm} />
              <Genre setForm={setForm} />
              <Subgenres setForm={setForm} />
              <Format setForm={setForm} />
              <TargetAudience form={form} setForm={setForm} />
              <Themes setForm={setForm} />
              <Comps form={form} setForm={setForm} />
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
    </div>
  );
};

export default SmartMatch;
