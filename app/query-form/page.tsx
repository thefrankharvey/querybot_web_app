"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "../ui-primitives/button";
import { Input } from "../ui-primitives/input";
import MultiSelect from "../ui-primitives/multi-select";
// import { formatComps, formatThemes } from "../utils";
import { Textarea } from "../ui-primitives/textarea";
import { useDropzone } from "react-dropzone";
import {
  useAgentMatches,
  AgentMatchesProvider,
  FormData,
} from "../context/agent-matches-context";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useManuscriptProcessor } from "../hooks/use-manuscript-processor";
import Link from "next/link";
import BookLoader from "../components/book-loader";
import Combobox from "../ui-primitives/combobox";
import { genreOptions, subgenreOptions } from "../constants";

type FormState = {
  email: string;
  genre: string;
  subgenres: string[];
  target_audience: string;
  comps: { title: string; author: string }[];
  themes: string;
  synopsis: string;
  manuscript?: File;
};

const QueryForm = () => {
  const { saveMatches, saveFormData, saveNextCursor } = useAgentMatches();
  const [apiMessage, setApiMessage] = useState("");
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    email: "",
    genre: "",
    subgenres: [],
    target_audience: "",
    comps: [{ title: "", author: "" }],
    themes: "",
    synopsis: "",
    manuscript: undefined,
  });

  // TODO: add this back in later: manuscriptText,
  const {
    // manuscriptText,
    processManuscript,
    status: manuscriptStatus,
  } = useManuscriptProcessor();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (value: string) => {
    setForm((prev) => ({ ...prev, genre: value }));
  };

  const handleSubgenreChange = (subgenres: string[]) => {
    setForm((prev) => {
      return {
        ...prev,
        subgenres: subgenres,
      };
    });
  };

  const handleTargetAudienceChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, target_audience: e.target.value }));
  };

  const handleCompChange = (
    idx: number,
    field: "title" | "author",
    value: string
  ) => {
    setForm((prev) => {
      const comps = prev.comps.map((comp, i) =>
        i === idx ? { ...comp, [field]: value } : comp
      );
      return { ...prev, comps };
    });
  };

  const handleThemesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, themes: e.target.value }));
  };

  const handleSynopsisChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, synopsis: e.target.value }));
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const manuscript = acceptedFiles[0];
        setForm((prev) => ({ ...prev, manuscript }));
        await processManuscript(manuscript);
      }
    },
    [processManuscript]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

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

  // const testData = {
  //   email: "john@example.com",
  //   genre: "historical fiction",
  //   subgenres: ["espionage", "political"],
  //   special_audience: "middle grade",
  //   target_audience: Readers aged 10-14 interested in history and adventure.
  //   comps: the book thief,
  //   themes: friendship, courage, loyalty
  //   synopsis:
  //     A young spy in WWII France uncovers secrets that could save her family.
  //   query_letter:
  //     "Dear Agent, I am submitting my manuscript for your consideration...",
  //   manuscript: "",
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // const themes = formatThemes(form.themes);
    // const comps = formatComps(form.comps);

    // Create JSON payload instead of FormData

    // const payload = {
    //   email: form.email,
    //   genre: form.genre,
    //   subgenres: form.subgenres,
    //   target_audience: form.target_audience,
    //   comps: comps,
    //   themes: themes,
    //   synopsis: form.synopsis,
    //   manuscript: "Once upon a time in war-torn Europe, a girl named Elise...", // add this back in later: manuscriptText,
    //   enable_ai: true,
    //   non_fiction: true,
    //   query_letter:
    //     "Dear Agent, I am submitting my manuscript for your consideration...",
    //   format: "comics",
    // };

    const payload = {
      email: "john@example.com",
      genre: "historical fiction",
      subgenres: ["espionage", "political"],
      special_audience: "middle grade",
      target_audience:
        "Readers aged 10-14 interested in history and adventure.",
      comps: ["the book thief"],
      themes: ["friendship", "courage", "loyalty"],
      synopsis:
        "A young spy in WWII France uncovers secrets that could save her family.",
      query_letter:
        "Dear Agent, I am submitting my manuscript for your consideration...",
      manuscript: "Once upon a time in war-torn Europe, a girl named Elise...",
    };

    saveFormData(payload);
    queryMutation.mutate(payload);
    window.scrollTo({
      top: 0,
    });
  };

  return (
    <div className="pt-30">
      {queryMutation.isPending && (
        <div className="flex flex-col items-center h-[700px] mt-10">
          <BookLoader width={300} height={300} />
          <p className="mt-4 text-lg font-semibold">Searching for agents...</p>
        </div>
      )}
      {!queryMutation.isSuccess && !queryMutation.isPending && (
        <>
          <div className="w-full flex flex-col justify-start md:w-[640px] md:mx-auto">
            <h1 className="text-4xl md:text-[40px] font-extrabold leading-tight mb-4">
              Query Form
            </h1>
            <h2 className="text-lg mb-8">
              We&apos;ll use this information to match you with literary agents
              tailored to your specific needs.
            </h2>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-8 h-8" />
              <h2 className="text-2xl">Back</h2>
            </Link>
          </div>

          <div className="w-full flex justify-start md:w-1/2 md:mx-auto mb-4">
            {apiMessage && (
              <div className="text-red-500 text-base">{apiMessage}</div>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-8 bg-white rounded-lg p-4 py-12 md:p-12 w-full md:w-[640px] mx-auto shadow-lg">
              <div className="w-full">
                <label className="font-semibold mb-2 block">Email *</label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full">
                <label className="font-semibold mb-2 block">Genre</label>
                <Combobox
                  options={genreOptions}
                  optionTitle="genre"
                  handleChange={handleGenreChange}
                />
              </div>
              <div className="w-full">
                <label className="font-semibold mb-2 block">Subgenres</label>
                <MultiSelect
                  options={subgenreOptions}
                  optionTitle="subgenre"
                  handleChange={handleSubgenreChange}
                />
              </div>
              {/* <div className="w-full">
                <label className="font-semibold mb-2 block">
                  Special Audience
                </label>
                <Select
                  value={form.special_audience}
                  onValueChange={handleSpecialAudienceChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialAudienceOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
              <div className="w-full">
                <label className="font-semibold mb-2 block">
                  Target Audience
                </label>
                <Textarea
                  value={form.target_audience}
                  onChange={handleTargetAudienceChange}
                  rows={4}
                  className="w-full h-22"
                />
              </div>
              <div className="w-full">
                <h2 className="text-lg font-semibold mb-1">Comps</h2>
                <div className="text-muted-foreground text-sm mb-4">
                  published books, preferably recent, which compare to yours
                </div>
                {form.comps.map((comp, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="mb-2">
                      <label className="font-semibold mb-2 block">Title</label>
                      <Input
                        value={comp.title}
                        onChange={(e) =>
                          handleCompChange(idx, "title", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">Author</label>
                      <Input
                        value={comp.author}
                        onChange={(e) =>
                          handleCompChange(idx, "author", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex flex-col md:flex-row gap-4">
                  <Button
                    className="text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (form.comps.length < 5) {
                        setForm((prev) => ({
                          ...prev,
                          comps: [...prev.comps, { title: "", author: "" }],
                        }));
                      }
                    }}
                  >
                    Add Comp
                    <PlusIcon className="size-4" />
                  </Button>
                  <Button
                    className="text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (form.comps.length > 1) {
                        setForm((prev) => ({
                          ...prev,
                          comps: prev.comps.slice(0, -1),
                        }));
                      }
                    }}
                  >
                    Remove Comp
                    <MinusIcon className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="w-full">
                <label className="font-semibold mb-2 block">Themes</label>
                <div className="text-muted-foreground text-sm mb-4">
                  please list your themes in a comma separated list
                </div>
                <Textarea
                  value={form.themes}
                  onChange={handleThemesChange}
                  rows={5}
                  className="w-full h-22"
                />
              </div>
              <div className="w-full">
                <label className="font-semibold mb-2 block">
                  Plot Beats or Synopsis
                </label>
                <Textarea
                  value={form.synopsis}
                  onChange={handleSynopsisChange}
                  rows={5}
                  className="w-full h-22"
                />
              </div>

              <div className="w-full">
                <label className="font-semibold block">Manuscript</label>

                <div
                  {...getRootProps()}
                  className={[
                    "w-full mt-2 p-5 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
                    isDragActive
                      ? "bg-blue-50 border-blue-400"
                      : "border-gray-300 bg-transparent",
                  ].join(" ")}
                >
                  <input {...getInputProps()} />
                  {form.manuscript ? (
                    <div>
                      <p>
                        Selected file: <strong>{form.manuscript.name}</strong>
                      </p>
                      {manuscriptStatus === "success" && (
                        <p className="mt-2 text-green-600">
                          Manuscript processed successfully
                        </p>
                      )}
                      {manuscriptStatus === "error" && (
                        <p className="mt-2 text-red-600">
                          Error processing manuscript
                        </p>
                      )}
                    </div>
                  ) : (
                    <p>
                      {isDragActive
                        ? "Drop your file here…"
                        : "Drag & drop a document, or click to select"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex w-full justify-end mt-8">
                <Button
                  type="submit"
                  className="cursor-pointer w-1/2 text-lg p-8 font-semibold"
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

export default function QueryFormPage() {
  return (
    <AgentMatchesProvider>
      <QueryForm />
    </AgentMatchesProvider>
  );
}
