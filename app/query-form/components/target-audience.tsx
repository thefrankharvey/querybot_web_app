import React from "react";
import { FormState } from "../page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import { targetAudienceOptions } from "@/app/constants";

const TargetAudience = ({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">
        Target Audience<span className="text-accent text-xl font-bold">*</span>
      </label>

      <Select
        value={form.target_audience}
        onValueChange={(value) =>
          setForm((prev) => ({ ...prev, target_audience: value }))
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Please Select" />
        </SelectTrigger>
        <SelectContent>
          {targetAudienceOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TargetAudience;
