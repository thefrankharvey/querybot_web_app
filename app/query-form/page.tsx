"use client";

import React, { useState } from "react";
import { Button } from "../ui-primitives/button";
import { Input } from "../ui-primitives/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui-primitives/select";
import { Checkbox } from "../ui-primitives/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui-primitives/radio-group";
import { Textarea } from "../ui-primitives/textarea";
// import { useDropzone } from "react-dropzone";
// import { formatComps, formatThemes } from "../utils";

type FormState = {
  email: string;
  genre: string;
  subgenres: string[];
  special_audience: string;
  target_audience: string;
  comps: { title: string; author: string }[];
  themes: string;
  synopsis: string;
  manuscript: string;
};

const genreOptions = [
  "Literary Fiction",
  "Mystery/Crime",
  "Fantasy",
  "Science Fiction",
  "Historical Fiction",
  "Horror",
  "Thriller/Suspense",
  "Magical Realism",
  "Adventure",
  "Biography/Autobiography/Memoir",
  "Self-Help/Personal Development",
  "History",
  "Science and Technology",
  "Philosophy/Religion/Spirituality",
  "Travel/Adventure",
  "True Crime",
  "Poetry",
  "Short Story",
];

const subgenreOptions = ["espionage", "spy", "political"];
const specialAudienceOptions = [
  "middle grade",
  "young adult",
  "graphic novel/comic book",
  "children/picture book",
  "none",
];

const QueryForm = () => {
  const [form, setForm] = useState<FormState>({
    email: "",
    genre: "",
    subgenres: [],
    special_audience: "",
    target_audience: "",
    comps: [
      { title: "", author: "" },
      { title: "", author: "" },
      { title: "", author: "" },
    ],
    themes: "",
    synopsis: "",
    manuscript: "Once upon a time in war-torn Europe, a girl named Elise",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (value: string) => {
    setForm((prev) => ({ ...prev, genre: value }));
  };

  const handleSubgenreChange = (subgenre: string) => {
    setForm((prev) => {
      const exists = prev.subgenres.includes(subgenre);
      return {
        ...prev,
        subgenres: exists
          ? prev.subgenres.filter((s) => s !== subgenre)
          : [...prev.subgenres, subgenre],
      };
    });
  };

  const handleSpecialAudienceChange = (value: string) => {
    setForm((prev) => ({ ...prev, special_audience: value }));
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

  // const onDrop = useCallback((acceptedFiles: File[]) => {
  //   if (acceptedFiles.length > 0) {
  //     setForm((prev) => ({ ...prev, file: acceptedFiles[0] }));
  //   }
  // }, []);

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop,
  //   multiple: false,
  //   accept: {
  //     "application/pdf": [".pdf"],
  //     "application/msword": [".doc"],
  //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
  //       [".docx"],
  //   },
  // });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent browser reload

    // const formattedFormData = {
    //   ...form,
    //   query_letter:
    //     "Dear Agent, I am submitting my manuscript for your consideration...",
    //   comps: formatComps(form.comps),
    //   themes: formatThemes(form.themes),
    // };
    const testData = {
      email: "john@example.com",
      genre: "historical fiction",
      subgenres: ["espionage", "political"],
      special_audience: "middle grade",
      target_audience: "Readers aged 10-14 interested in history and adventure",
      comps: ["the book thief"],
      themes: ["friendship", "courage", "loyalty"],
      synopsis:
        "A young spy in WWII France uncovers secrets that could save her family.",
      query_letter:
        "Dear Agent, I am submitting my manuscript for your consideration...",
      manuscript: "",
    };

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      // const json = await res.json();
      // console.log({ json });
    } catch (err) {
      console.error(err);
    }
  };

  //     "email": "john@example.com",
  //     "genre": "Historical Fiction",
  //     "subgenres": ["Espionage", "Political"],
  //     "special_audience": "Middle Grade",
  //     "target_audience": "Readers aged 10-14 interested in history and adventure",
  //     "comps": ["The Book Thief", "Number the Stars"],
  //     "themes": ["Friendship", "Courage", "Loyalty"],
  //     "synopsis": "A young spy in WWII France uncovers secrets that could save her family.",
  //     "query_letter": "Dear Agent, I am submitting my manuscript for your consideration...",
  //     "manuscript": "Once upon a time in war-torn Europe, a girl named Elise..."

  return (
    <div className="pt-30">
      <div className="w-full flex justify-start md:w-1/2 md:mx-auto mb-8">
        <h1 className="text-4xl md:text-[40px] font-extrabold leading-tight">
          Query Form
        </h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center gap-8 bg-white rounded-lg p-4 py-12 md:p-12 w-full md:w-1/2 mx-auto">
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
            <Select value={form.genre} onValueChange={handleGenreChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {genreOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <label className="font-semibold mb-2 block">Subgenres</label>
            <div className="flex flex-col gap-2 ml-2">
              {subgenreOptions.map((sub) => (
                <label key={sub} className="flex items-center gap-2">
                  <Checkbox
                    checked={form.subgenres.includes(sub)}
                    onCheckedChange={() => handleSubgenreChange(sub)}
                  />
                  {sub}
                </label>
              ))}
            </div>
          </div>
          <div className="w-full">
            <label className="font-semibold mb-2 block">Special Audience</label>
            <RadioGroup
              value={form.special_audience}
              onValueChange={handleSpecialAudienceChange}
              className="flex flex-col gap-2 ml-2"
            >
              {specialAudienceOptions.map((aud) => (
                <label key={aud} className="flex items-center gap-2">
                  <RadioGroupItem value={aud} />
                  {aud}
                </label>
              ))}
            </RadioGroup>
          </div>
          <div className="w-full mt-6">
            <label className="font-semibold mb-2 block">Target Audience</label>
            <Textarea
              value={form.target_audience}
              onChange={handleTargetAudienceChange}
              rows={4}
              className="w-full h-40"
            />
          </div>
          <div className="w-full mt-10">
            <h2 className="text-lg font-semibold mb-1">Comps</h2>
            <div className="text-muted-foreground text-sm mb-4">
              published books, preferably recent, which compare to yours
            </div>
            <hr className="mb-6" />
            {form.comps.map((comp, idx) => (
              <div key={idx} className="mb-8">
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
          </div>
          <div className="w-full mt-10">
            <label className="font-semibold mb-2 block">Themes</label>
            <Textarea
              value={form.themes}
              onChange={handleThemesChange}
              rows={5}
              className="w-full h-40"
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
              className="w-full h-40"
            />
          </div>

          {/* <div
            {...getRootProps()}
            className={[
              "w-full mt-6 p-5 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
              isDragActive
                ? "bg-blue-50 border-blue-400"
                : "border-gray-300 bg-transparent",
            ].join(" ")}
          >
            <input {...getInputProps()} />
            {form.manuscript ? (
              <p>
                Selected file: <strong>{form.manuscript.name}</strong>
              </p>
            ) : (
              <p>
                {isDragActive
                  ? "Drop your file here…"
                  : "Drag & drop a document, or click to select"}
              </p>
            )}
          </div> */}

          <div className="flex w-full justify-end mt-8">
            {/* <Button
              type="submit"
              className="cursor-pointer w-1/2 text-lg p-8 font-semibold"
            >
              Submit
            </Button> */}
          </div>
          <Button
            onClick={handleSubmit}
            className="cursor-pointer w-1/2 text-lg p-8 font-semibold"
          >
            Submit TEST
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QueryForm;
