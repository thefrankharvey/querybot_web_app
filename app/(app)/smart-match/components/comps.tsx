import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import { MinusIcon, PlusIcon } from "lucide-react";
import React from "react";
import { FormState } from "../page";

export const Comps = ({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
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

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-1">Comparable Titles</h2>
      <div className="text-muted-foreground text-sm mb-4">
        published books, preferably recent, which compare to yours
      </div>
      {form.comps.map((comp, idx) => (
        <div key={idx} className="mb-4 flex flex-col md:flex-row gap-2">
          <div className="mb-2 flex-1">
            <label className="font-semibold mb-2 block">Title</label>
            <Input
              value={comp.title}
              onChange={(e) => handleCompChange(idx, "title", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="font-semibold mb-2 block">Author</label>
            <Input
              value={comp.author}
              onChange={(e) => handleCompChange(idx, "author", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      ))}
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          className="text-sm shadow-lg hover:shadow-xl"
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
          className="text-sm shadow-lg hover:shadow-xl"
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
  );
};

export default Comps;
