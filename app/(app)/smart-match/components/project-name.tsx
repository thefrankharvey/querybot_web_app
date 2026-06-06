import React from "react";
import { Input } from "@/app/ui-primitives/input";
import { FormState } from "../page";
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
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  projectNames: string[];
}) => {
  const selectedProjectName = projectNames.find(
    (projectName) => projectName === form.project_name.trim()
  );

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
        {projectNames.length > 0 && (
          <Select value={selectedProjectName} onValueChange={handleChange}>
            <SelectTrigger
              aria-label="Choose existing project"
              className="w-full md:w-[220px]"
            >
              <SelectValue placeholder="Choose Existing" />
            </SelectTrigger>
            <SelectContent surface="solid">
              <SelectGroup>
                {projectNames.map((projectName) => (
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
