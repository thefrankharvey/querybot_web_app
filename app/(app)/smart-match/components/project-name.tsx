import React from "react";
import { Input } from "@/app/ui-primitives/input";
import { FormState } from "../page";

const ProjectName = ({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => (
  <div className="w-full">
    <label className="font-semibold mb-2 block text-accent">
      Project Name<span className="text-accent text-xl font-bold">*</span>
    </label>
    <Input
      value={form.project_name}
      onChange={(e) =>
        setForm((prev) => ({ ...prev, project_name: e.target.value }))
      }
      className="w-full"
    />
  </div>
);

export default ProjectName;
