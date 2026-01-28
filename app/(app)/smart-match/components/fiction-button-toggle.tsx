import React from "react";
import { Check, X } from "lucide-react";
import { ButtonGroup } from "@/app/ui-primitives/button-group";
import { Button } from "@/app/ui-primitives/button";
import { FormState } from "@/app/(app)/smart-match/page";
import { cn } from "@/app/utils";

const FictionButtonToggle = ({
  setForm,
  form,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const isFiction = !form.non_fiction;
  const isNonFiction = form.non_fiction;

  return (
    <div className="w-full">
      <div className="flex md:w-[50%] w-full">
        <ButtonGroup orientation="horizontal" className="w-full">
          <Button
            type="button"
            variant={isFiction ? "solid" : "outline"}
            className={cn(
              "flex-1 gap-2 font-semibold",
              isFiction && "shadow-sm"
            )}
            onClick={() =>
              setForm((prev: FormState) => ({ ...prev, non_fiction: false }))
            }
            aria-pressed={isFiction}
            aria-label="Fiction"
          >
            {isFiction ? <Check className={"size-4 shrink-0"} aria-hidden /> : <X className={"size-4 shrink-0"} aria-hidden />}
            <span>Fiction</span>
          </Button>
          <Button
            type="button"
            variant={isNonFiction ? "solid" : "outline"}
            className={cn(
              "flex-1 gap-2 font-semibold",
              isNonFiction && "shadow-sm"
            )}
            onClick={() =>
              setForm((prev: FormState) => ({ ...prev, non_fiction: true }))
            }
            aria-pressed={isNonFiction}
            aria-label="Non-fiction"
          >
            {isNonFiction ? <Check className={"size-4 shrink-0"} aria-hidden /> : <X className={"size-4 shrink-0"} aria-hidden />}
            <span>Non-fiction</span>
          </Button>
        </ButtonGroup>
        <span className="text-accent text-xl font-bold text-right mt-[-18px]" aria-hidden>*</span>
      </div>
    </div>
  );
};

export default FictionButtonToggle;
