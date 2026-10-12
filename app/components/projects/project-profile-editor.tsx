"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import { Spinner } from "@/app/ui-primitives/spinner";
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldLabel,
  FieldError,
} from "@/app/ui-primitives/field";
import { RadioGroup, RadioGroupItem } from "@/app/ui-primitives/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import { useManuscriptTraits } from "@/app/hooks/use-manuscript-traits";
import { targetAudienceOptions } from "@/app/constants";
import type { RestoredSmartMatchForm } from "@/app/utils/smart-match-restore";
import { ProjectTraitField } from "./project-trait-field";

export function ProjectProfileEditor({
  form,
  setForm,
  saving,
  onSave,
  onCancel,
}: {
  form: RestoredSmartMatchForm;
  setForm: React.Dispatch<React.SetStateAction<RestoredSmartMatchForm>>;
  saving: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
}) {
  const { traitOptions, createOrSelectTrait, traitsError } =
    useManuscriptTraits();
  const [addingTrait, setAddingTrait] = useState(false);
  const [compErrors, setCompErrors] = useState<Record<number, string>>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    if (saving || addingTrait) return;
    const errors: Record<number, string> = {};
    form.comps.forEach((comp, index) => {
      if (comp.author.trim() && !comp.title.trim())
        errors[index] = "Add a title for this author, or remove the book.";
    });
    setCompErrors(errors);
    const first = Object.keys(errors)[0];
    if (first !== undefined) {
      document.getElementById(`profile-comp-title-${first}`)?.focus();
      return;
    }
    void onSave();
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-8"
      aria-label="Edit project traits"
    >
      <fieldset
        disabled={saving || addingTrait}
        className="flex min-w-0 flex-col gap-8"
      >
        <FieldSet>
          <FieldLegend>Manuscript details</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel id="profile-type-label">Type</FieldLabel>
              <RadioGroup
                aria-labelledby="profile-type-label"
                value={form.non_fiction ? "nonfiction" : "fiction"}
                className="flex flex-wrap gap-6"
                onValueChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    non_fiction: value === "nonfiction",
                  }))
                }
              >
                <Field orientation="horizontal" className="w-auto">
                  <RadioGroupItem id="profile-fiction" value="fiction" />
                  <FieldLabel htmlFor="profile-fiction">Fiction</FieldLabel>
                </Field>
                <Field orientation="horizontal" className="w-auto">
                  <RadioGroupItem id="profile-nonfiction" value="nonfiction" />
                  <FieldLabel htmlFor="profile-nonfiction">
                    Nonfiction
                  </FieldLabel>
                </Field>
              </RadioGroup>
            </Field>
            <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-2">
              <ProjectTraitField
                type="genre"
                label="Genre"
                value={form.genre}
                options={traitOptions.genre}
                createTrait={createOrSelectTrait}
                onBusyChange={setAddingTrait}
                onChange={(genre) =>
                  setForm((previous) => ({
                    ...previous,
                    genre: genre as string,
                  }))
                }
              />
              <ProjectTraitField
                type="format"
                label="Format"
                value={form.format}
                options={traitOptions.format}
                createTrait={createOrSelectTrait}
                onBusyChange={setAddingTrait}
                onChange={(format) =>
                  setForm((previous) => ({
                    ...previous,
                    format: format as string,
                  }))
                }
              />
            </div>
            <Field>
              <FieldLabel htmlFor="profile-audience">
                Target audience
              </FieldLabel>
              <Select
                value={form.target_audience || "unset"}
                onValueChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    target_audience: value === "unset" ? "" : value,
                  }))
                }
              >
                <SelectTrigger id="profile-audience" className="w-full">
                  <SelectValue placeholder="Select an audience" />
                </SelectTrigger>
                <SelectContent surface="solid">
                  <SelectGroup>
                    <SelectItem value="unset">Not added yet</SelectItem>
                    {!targetAudienceOptions.some(
                      (option) => option.value === form.target_audience,
                    ) &&
                      form.target_audience && (
                        <SelectItem value={form.target_audience}>
                          {form.target_audience}
                        </SelectItem>
                      )}
                    {targetAudienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <ProjectTraitField
              type="subgenre"
              label="Subgenres"
              value={form.subgenres}
              multiple
              options={traitOptions.subgenre}
              createTrait={createOrSelectTrait}
              onBusyChange={setAddingTrait}
              onChange={(subgenres) =>
                setForm((previous) => ({
                  ...previous,
                  subgenres: subgenres as string[],
                }))
              }
            />
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend>Themes</FieldLegend>
          <FieldGroup>
            <ProjectTraitField
              type="theme"
              label="Themes in your manuscript"
              value={form.themes}
              multiple
              options={traitOptions.theme}
              createTrait={createOrSelectTrait}
              onBusyChange={setAddingTrait}
              onChange={(themes) =>
                setForm((previous) => ({
                  ...previous,
                  themes: themes as string[],
                }))
              }
            />
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend>Comparable books</FieldLegend>
          <p className="-mt-4 text-sm text-muted-foreground">
            Published books that compare to your manuscript. Add up to five.
          </p>
          <FieldGroup>
            {form.comps.map((comp, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                  {(["title", "author"] as const).map((key) => (
                    <Field
                      key={key}
                      data-invalid={
                        key === "title" && Boolean(compErrors[index])
                      }
                    >
                      <FieldLabel htmlFor={`profile-comp-${key}-${index}`}>
                        {key === "title" ? "Title" : "Author"} {index + 1}
                      </FieldLabel>
                      <Input
                        id={`profile-comp-${key}-${index}`}
                        name={`comp_${key}_${index}`}
                        autoComplete="off"
                        maxLength={500}
                        value={comp[key]}
                        aria-invalid={
                          key === "title" && Boolean(compErrors[index])
                        }
                        aria-describedby={
                          key === "title" && compErrors[index]
                            ? `profile-comp-error-${index}`
                            : undefined
                        }
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            comps: previous.comps.map((item, i) =>
                              i === index
                                ? { ...item, [key]: event.target.value }
                                : item,
                            ),
                          }))
                        }
                      />
                      {key === "title" && compErrors[index] && (
                        <FieldError id={`profile-comp-error-${index}`}>
                          {compErrors[index]}
                        </FieldError>
                      )}
                    </Field>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-7"
                  aria-label={`Remove comparable book ${index + 1}`}
                  onClick={() => {
                    setCompErrors({});
                    setForm((previous) => ({
                      ...previous,
                      comps: previous.comps.filter((_, i) => i !== index),
                    }));
                  }}
                >
                  <Trash2 data-icon="inline-start" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </FieldGroup>
          {form.comps.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() =>
                setForm((previous) => ({
                  ...previous,
                  comps: [...previous.comps, { title: "", author: "" }],
                }))
              }
            >
              <Plus data-icon="inline-start" aria-hidden="true" />
              Add comparable book
            </Button>
          )}
        </FieldSet>
      </fieldset>
      {traitsError && (
        <p role="status" className="text-sm text-muted-foreground">
          Trait options could not load. Your saved values are available; you can
          retry by reopening the editor.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving || addingTrait}>
          {saving && <Spinner data-icon="inline-start" />}{" "}
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving || addingTrait}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <p className="text-sm text-muted-foreground">
          You can save an incomplete profile.
        </p>
      </div>
    </form>
  );
}
