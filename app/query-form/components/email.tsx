import { Input } from "@/app/ui-primitives/input";
import React from "react";
import { FormState } from "../page";

const Email = ({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">Email *</label>
      <Input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
      />
    </div>
  );
};

export default Email;
