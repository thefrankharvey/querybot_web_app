"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ScanSearch } from "lucide-react";
import { Button } from "../ui-primitives/button";
// import { formatComps, formatThemes } from "../utils";
import {
  useAgentMatches,
  AgentMatchesProvider,
  FormData,
} from "../context/agent-matches-context";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
// import { useManuscriptProcessor } from "../hooks/use-manuscript-processor";
import Link from "next/link";
import { validateQuery, formatComps } from "../utils";
import Comps from "./components/comps";
// import Manuscript from "./components/manuscript";
import Themes from "./components/themes";
// import Synopsis from "./components/synopsis";
import TargetAudience from "./components/target-audience";
import Subgenres from "./components/subgenres";
import Genre from "./components/genre";
import Email from "./components/email";
import Format from "./components/format";
import FictionRadio from "./components/fiction-radio";
import ExplanationBlock from "./components/explanation-block";
import TypeForm from "../components/type-form";
import Spinner from "../components/spinner";

export type FormState = {
  email: string;
  genre: string;
  subgenres: string[];
  format: string;
  target_audience: string;
  comps: { title: string; author: string }[];
  themes: string[];
  enable_ai: boolean;
  non_fiction: boolean;
};

const SmartQuery = () => {
  const { saveMatches, saveFormData, saveNextCursor } = useAgentMatches();
  const [apiMessage, setApiMessage] = useState("");
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    email: "",
    genre: "",
    subgenres: [],
    format: "",
    target_audience: "",
    comps: [{ title: "", author: "" }],
    themes: [],
    enable_ai: true,
    non_fiction: false,
  });

  // const {
  //   // manuscriptText,
  //   processManuscript,
  //   status: manuscriptStatus,
  // } = useManuscriptProcessor();

  const queryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/query?last_index=0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        setApiMessage("An API error occurred. Please try again.");
        throw new Error(`Request failed: ${res.status}`);
      }

      return res.json();
    },

    onSuccess: (data) => {
      if (data.matches.length > 0) {
        saveMatches(data.matches);
        saveNextCursor(data.next_cursor);
      } else {
        setApiMessage("No matches found");
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    if (queryMutation.isSuccess) {
      router.push("/agent-matches");
    }
  }, [queryMutation.isSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const comps = formatComps(form.comps);

    const payload = {
      email: form.email,
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
    queryMutation.mutate(payload);
    window.scrollTo({
      top: 0,
    });
  };

  return (
    <div className="pt-12">
      {queryMutation.isPending && (
        <div className="flex flex-col items-center h-[700px] mt-10">
          <Spinner size={200} />
          <p className="mt-4 text-lg font-semibold">Searching for agents...</p>
        </div>
      )}
      {!queryMutation.isSuccess && !queryMutation.isPending && (
        <>
          <div className="w-full flex flex-col justify-start md:w-[640px] md:mx-auto">
            <h1 className="text-4xl md:text-[40px] font-extrabold leading-tight mb-4 flex items-center gap-4">
              <ScanSearch className="w-10 h-10" />
              Smart Query
            </h1>
            <ExplanationBlock />
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ArrowLeft className="w-8 h-8" />
              <h2 className="text-2xl">Back</h2>
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-8 bg-white rounded-lg p-4 py-12 md:p-12 w-full md:w-[640px] mx-auto shadow-lg">
              <Email form={form} setForm={setForm} />
              <FictionRadio form={form} setForm={setForm} />
              <Genre setForm={setForm} />
              <Subgenres setForm={setForm} />
              <Format setForm={setForm} />
              <TargetAudience form={form} setForm={setForm} />
              <Themes setForm={setForm} />
              <Comps form={form} setForm={setForm} />
              {/* <Synopsis form={form} setForm={setForm} /> */}
              {/* <Manuscript
                form={form}
                setForm={setForm}
                manuscriptStatus={manuscriptStatus}
                processManuscript={processManuscript}
              /> */}
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
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default function SmartQueryPage() {
  return (
    <AgentMatchesProvider>
      <SmartQuery />
      <TypeForm />
    </AgentMatchesProvider>
  );
}
