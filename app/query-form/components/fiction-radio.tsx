import React from "react";
import { RadioGroup, RadioGroupItem } from "@/app/ui-primitives/radio-group";
import { FormState } from "@/app/query-form/page";

const FictionRadio = ({
  setForm,
  form,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  return (
    <div className="w-full">
      <RadioGroup
        value={form.non_fiction ? "non-fiction" : "fiction"}
        onValueChange={(value) => {
          setForm((prev: FormState) => ({
            ...prev,
            non_fiction: value === "non-fiction" ? true : false,
          }));
        }}
      >
        <div>
          <span className="text-accent text-xl font-bold">*</span>
          <div className="flex items-center space-x-2">
            <label className="font-semibold" htmlFor="fiction">
              Fiction
            </label>
            <RadioGroupItem value="fiction" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <label className="font-semibold" htmlFor="non-fiction">
            Non-Fiction
          </label>
          <RadioGroupItem value="non-fiction" />
        </div>
      </RadioGroup>
    </div>
  );
};

export default FictionRadio;
