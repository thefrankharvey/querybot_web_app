import { Textarea } from "@/app/ui-primitives/textarea";
import React from "react";
import { FormState } from "../page";

const TargetAudience = ({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">Target Audience</label>
      <Textarea
        value={form.target_audience}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, target_audience: e.target.value }))
        }
        rows={4}
        className="w-full h-22"
      />
    </div>
  );
};

export default TargetAudience;
