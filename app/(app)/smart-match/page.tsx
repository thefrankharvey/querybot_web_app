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
  const { saveMatches, saveFormData, saveNextCursor, saveSpreadsheetUrl, saveStatusFilter, startSpreadsheetPolling, resetForNewSearch } =
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
    queryMutation.mutate(payload);
    window.scrollTo({
      top: 0,
    });
  };

  if (isLoading) {
    return (
      <div className="pt-28 flex justify-center items-center md:ml-[-100px]">
        <Spinner className="size-16 text-accent" />
      </div>
    );
  }

  return (
    <div>
      {(queryMutation.isPending || queryMutation.isSuccess) && (
        <div className="flex flex-col items-center md:w-[700px] md:mx-auto h-[700px] mt-40">
          <ProgressBar
            isSuccess={queryMutation.isSuccess}
            onComplete={handleProgressComplete}
          />
        </div>
      )}
      {!queryMutation.isSuccess && !queryMutation.isPending && (
        <>
          <div className="w-full flex flex-col justify-start md:w-[700px] md:mx-auto">
            <div className="mb-4">
              <h1 className="text-4xl md:text-[32px] font-semibold leading-tight mb-7 flex items-center gap-4 text-accent">
                <ScanSearch className="w-10 h-10" />
                Smart Match
              </h1>
              <h2 className="text-base font-semibold mb-2 text-accent">
                How to get the best results:
              </h2>
              <p className="text-accent text-base">
                Fill this out this form as completely as possible. The more
                specific and complete your entries are the better your agent
                matches will be.
              </p>
            </div>
            <div className="flex gap-4 flex-col md:flex-row justify-between mb-4 md:items-center">
              <div className="flex gap-4 flex-col md:flex-row">
                <ExplanationBlock />
                {isSubscribed &&
                  hasAgentMatches &&
                  hasAgentMatches.length > 0 && (
                    <Link href="/agent-matches" className="w-full md:w-fit">
                      <Button
                        className="cursor-pointer text-sm p-2 px-4 w-full md:w-fit shadow-lg hover:shadow-xl"
                        variant="default"
                      >
                        Previous Agent Matches
                      </Button>
                    </Link>
                  )}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-8 bg-white rounded-lg p-4 py-12 md:p-12 w-full md:w-[700px] mx-auto shadow-lg">
              <FictionButtonToggle form={form} setForm={setForm} />
              <Genre setForm={setForm} />
              <Subgenres setForm={setForm} />
              <Format setForm={setForm} />
              <TargetAudience form={form} setForm={setForm} />
              <Themes setForm={setForm} />
              <Comps form={form} setForm={setForm} />
              {apiMessage && (
                <div className="text-red-500 text-base w-full font-semibold">
                  {apiMessage}
                </div>
              )}
              <div className="flex w-full justify-center mt-12">
                <Button
                  type="submit"
                  className="cursor-pointer w-full md:w-1/2 text-lg p-6 font-semibold shadow-lg hover:shadow-xl"
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