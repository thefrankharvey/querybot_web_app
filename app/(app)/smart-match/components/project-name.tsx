import React from "react";
import { Input } from "@/app/ui-primitives/input";
import type { FormState } from "../page";
import type {
  SmartMatchProjectOption,
  SmartMatchProjectReference,
} from "@/app/utils/smart-match-projects";
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
  projects,
  selectedProject,
  onProjectSelect,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  projects: SmartMatchProjectOption[];
  selectedProject: SmartMatchProjectReference | null;
  onProjectSelect: (project: SmartMatchProjectReference | null) => void;
}) => {
  const options = projects;
  const matchingProjects = options.filter(
    (project) =>
      project.projectName.toLowerCase() ===
      form.project_name.trim().toLowerCase(),
  );
  const selectedOption =
    matchingProjects.find(
      (project) =>
        selectedProject &&
        project.writerProjectId === selectedProject.writerProjectId,
    ) ?? (matchingProjects.length === 1 ? matchingProjects[0] : null);

  const handleChange = (projectName: string) => {
    onProjectSelect(null);
    setForm((prev) => ({ ...prev, project_name: projectName }));
  };

  const handleSelect = (key: string) => {
    const project = options.find((option) => option.key === key);
    if (!project) return;
    onProjectSelect(project);
    setForm((prev) => ({ ...prev, project_name: project.projectName }));
  };

  return (
    <div className="w-full">
      <label
        htmlFor="smart-match-project-name"
        className="font-semibold mb-2 block text-accent"
      >
        Project Name<span className="text-accent text-xl font-bold">*</span>
      </label>
      <div className="flex w-full flex-col gap-3 md:flex-row">
        <Input
          id="smart-match-project-name"
          placeholder="Enter a new project name..."
          value={form.project_name}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full md:flex-1"
        />
        {options.length > 0 && (
          <Select
            value={selectedOption?.key ?? ""}
            onValueChange={handleSelect}
          >
            <SelectTrigger
              aria-label="Choose existing project"
              className="w-full md:w-[220px]"
            >
              <SelectValue placeholder="Choose Existing" />
            </SelectTrigger>
            <SelectContent surface="solid">
              <SelectGroup>
                {options.map((project) => (
                  <SelectItem key={project.key} value={project.key}>
                    {project.label}
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
