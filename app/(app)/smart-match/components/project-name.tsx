import React from "react";
import { Input } from "@/app/ui-primitives/input";
import type { FormState } from "../page";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";

const ProjectName = ({
  form,
  setForm,
  projectNames,
  restoredProjectName,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  projectNames: string[];
  restoredProjectName?: string;
}) => {
  const restoredName = restoredProjectName?.trim();
  const options = restoredName
    ? [
        restoredName,
        ...projectNames.filter(
          (name) =>
            name.trim().toLocaleLowerCase() !== restoredName.toLocaleLowerCase(),
        ),
      ]
    : projectNames;
  const selectedProjectName =
    options.find(
      (name) =>
        name.trim().toLocaleLowerCase() ===
        form.project_name.trim().toLocaleLowerCase(),
    ) ?? "";

  const handleChange = (projectName: string) => {
    setForm((prev) => ({ ...prev, project_name: projectName }));
  };

  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block text-accent">
        Project Name<span className="text-accent text-xl font-bold">*</span>
      </label>
      <div className="flex w-full flex-col gap-3 md:flex-row">
        <Input
          placeholder="Enter a new project name..."
          value={form.project_name}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full md:flex-1"
        />
        {options.length > 0 && (
          <Select value={selectedProjectName} onValueChange={handleChange}>
            <SelectTrigger
              aria-label="Choose existing project"
              className="w-full md:w-[220px]"
            >
              <SelectValue placeholder="Choose Existing" />
            </SelectTrigger>
            <SelectContent surface="solid">
              <SelectGroup>
                {options.map((projectName) => (
                  <SelectItem key={projectName} value={projectName}>
                    {projectName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default ProjectName;
