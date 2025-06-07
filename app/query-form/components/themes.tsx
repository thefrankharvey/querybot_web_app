import { Textarea } from "@/app/ui-primitives/textarea";
import React from "react";
import { FormState } from "../page";

const Themes = ({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">Themes</label>
      <div className="text-muted-foreground text-sm mb-4">
        please list your themes in a comma separated list
      </div>
      <Textarea
        value={form.themes}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, themes: e.target.value }))
        }
        rows={5}
        className="w-full h-22"
      />
    </div>
  );
};

export default Themes;
