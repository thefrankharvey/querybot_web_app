"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Save,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/app/ui-primitives/button";
import { genreOptions } from "@/app/constants";
import { Input } from "@/app/ui-primitives/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui-primitives/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui-primitives/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import { Separator } from "@/app/ui-primitives/separator";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Textarea } from "@/app/ui-primitives/textarea";
import { cn, urlFormatter } from "@/app/utils";

import { syncCurrentAgentIdToClerk } from "./actions";
import {
  AgentProfile,
  AgentProfileMutableFields,
  AgentProfileResponse,
  buildFullCreateProfilePayload,
  buildMinimalCreateProfilePayload,
  formatLocation,
  HARDCODED_AGENT_LOOKUP_NAME,
  LegacyAgent,
  LegacyAgentResponse,
  splitAgentList,
  UpdateAgentProfileRequest,
  UpdateAgentProfileResponse,
} from "./agent-profile-utils";

type ImportMode = "full" | "minimal";
type LookupBy = "id" | "name" | "email";

type ApiError = Error & {
  status?: number;
  candidates?: string[];
};

type AgentProfileHomeProps = {
  initialAgentId: string | null;
};

type ProfileLink = {
  href: string;
  label: string;
};

const EDITABLE_TEXT_FIELDS = [
  "name",
  "title",
  "agency",
  "open_to_queries",
  "email",
  "city",
  "state_province",
  "country",
  "country_code",
  "location",
  "bio",
  "extra_interest",
  "website",
  "querytracker",
  "querymanager",
  "pubmarketplace",
] as const satisfies readonly (keyof AgentProfileMutableFields)[];

const EDITABLE_LIST_FIELDS = [
  "genres",
] as const satisfies readonly (keyof AgentProfileMutableFields)[];

const TARGET_AUDIENCE_ACCEPTANCE_FIELDS = [
  "accepts_middle_grade",
  "accepts_young_adult",
  "accepts_children",
] as const satisfies readonly (keyof AgentProfileMutableFields)[];

const FORMAT_ACCEPTANCE_FIELDS = [
  "accepts_nonfiction",
  "accepts_comics",
  "accepts_screenplay",
  "accepts_poetry",
] as const satisfies readonly (keyof AgentProfileMutableFields)[];

const ACCEPTANCE_FIELDS = [
  ...TARGET_AUDIENCE_ACCEPTANCE_FIELDS,
  ...FORMAT_ACCEPTANCE_FIELDS,
] as const satisfies readonly (keyof AgentProfileMutableFields)[];

type EditableTextField = (typeof EDITABLE_TEXT_FIELDS)[number];
type EditableListField = (typeof EDITABLE_LIST_FIELDS)[number];
type AcceptanceField = (typeof ACCEPTANCE_FIELDS)[number];

type AgentProfileDraft = Record<EditableTextField, string> &
  Record<EditableListField, string[]> &
  Record<AcceptanceField, boolean>;

type AcceptanceOption = {
  field: AcceptanceField;
  label: string;
};

const TEXT_FIELD_LABELS: Record<EditableTextField, string> = {
  name: "Name",
  title: "Title",
  agency: "Agency",
  open_to_queries: "Submission status",
  email: "Email",
  city: "City",
  state_province: "State / province",
  country: "Country",
  country_code: "Country code",
  location: "Free-text location",
  bio: "Bio",
  extra_interest: "Interests",
  website: "Website",
  querytracker: "QueryTracker",
  querymanager: "QueryManager",
  pubmarketplace: "Publishers Marketplace",
};

const LIST_FIELD_LABELS: Record<EditableListField, string> = {
  genres: "Genres",
};

const ACCEPTANCE_FIELD_LABELS: Record<AcceptanceField, string> = {
  accepts_middle_grade: "Middle Grade",
  accepts_young_adult: "Young Adult",
  accepts_children: "Children",
  accepts_nonfiction: "Nonfiction",
  accepts_comics: "Comics",
  accepts_screenplay: "Screenplay",
  accepts_poetry: "Poetry",
};

const TARGET_AUDIENCE_ACCEPTANCE_OPTIONS = [
  { field: "accepts_children", label: ACCEPTANCE_FIELD_LABELS.accepts_children },
  {
    field: "accepts_middle_grade",
    label: ACCEPTANCE_FIELD_LABELS.accepts_middle_grade,
  },
  {
    field: "accepts_young_adult",
    label: ACCEPTANCE_FIELD_LABELS.accepts_young_adult,
  },
] as const satisfies readonly AcceptanceOption[];

const FORMAT_ACCEPTANCE_OPTIONS = [
  {
    field: "accepts_nonfiction",
    label: ACCEPTANCE_FIELD_LABELS.accepts_nonfiction,
  },
  { field: "accepts_comics", label: ACCEPTANCE_FIELD_LABELS.accepts_comics },
  {
    field: "accepts_screenplay",
    label: ACCEPTANCE_FIELD_LABELS.accepts_screenplay,
  },
  { field: "accepts_poetry", label: ACCEPTANCE_FIELD_LABELS.accepts_poetry },
] as const satisfies readonly AcceptanceOption[];

const SUBMISSION_STATUS_OPTIONS = [
  "Open for submissions",
  "Not open for submissions",
] as const;

type SelectOption = {
  value: string;
  label: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      typeof body?.message === "string"
        ? body.message
        : typeof body?.error === "string"
          ? body.error
          : "Request failed"
    ) as ApiError;
    error.status = response.status;
    error.candidates = Array.isArray(body?.candidates)
      ? body.candidates
      : undefined;
    throw error;
  }

  return body as T;
}

async function fetchLegacyAgent() {
  const params = new URLSearchParams({
    lookup_by: "name",
    value: HARDCODED_AGENT_LOOKUP_NAME,
  });
  const response = await fetch(`/api/get-agent?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await readJson<LegacyAgentResponse>(response);

  if (!data.agent?.agent_id) {
    throw new Error("Legacy agent response is missing agent_id");
  }

  return data.agent;
}

async function fetchAgentProfile(
  lookupBy: LookupBy,
  value: string,
  withLegacyData = true
) {
  const params = new URLSearchParams({
    lookup_by: lookupBy,
    value,
    with_legacy_data: String(withLegacyData),
  });
  const response = await fetch(`/api/get-agent-profile?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await readJson<AgentProfileResponse>(response);

  return data.agent;
}

async function createAgentProfile(
  legacyAgent: LegacyAgent,
  importMode: ImportMode
) {
  const payload =
    importMode === "full"
      ? buildFullCreateProfilePayload(legacyAgent)
      : buildMinimalCreateProfilePayload(legacyAgent);

  const response = await fetch("/api/create-agent-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readJson<AgentProfileResponse>(response);
}

async function updateAgentProfile(payload: UpdateAgentProfileRequest) {
  const response = await fetch("/api/update-agent-profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readJson<UpdateAgentProfileResponse>(response);
}

function normalizeOptionKey(value: string) {
  return value.trim().toLocaleLowerCase();
}

function uniqueList(values: string[]) {
  const seen = new Set<string>();
  const uniqueValues: string[] = [];

  for (const value of values) {
    const trimmedValue = value.trim();
    const optionKey = normalizeOptionKey(trimmedValue);

    if (!trimmedValue || seen.has(optionKey)) {
      continue;
    }

    seen.add(optionKey);
    uniqueValues.push(trimmedValue);
  }

  return uniqueValues;
}

function mergeProfileOptions(
  baseOptions: SelectOption[],
  selectedValues: string[]
) {
  const seen = new Set<string>();
  const options: SelectOption[] = [];

  for (const option of baseOptions) {
    const label = option.label.trim();
    const optionKey = normalizeOptionKey(label);

    if (!label || seen.has(optionKey)) {
      continue;
    }

    seen.add(optionKey);
    options.push({ value: label, label });
  }

  for (const value of selectedValues) {
    const trimmedValue = value.trim();
    const optionKey = normalizeOptionKey(trimmedValue);

    if (!trimmedValue || seen.has(optionKey)) {
      continue;
    }

    seen.add(optionKey);
    options.push({ value: trimmedValue, label: trimmedValue });
  }

  return options;
}

function listsMatch(left: string[], right: string[]) {
  if (left.length !== right.length) return false;

  return left.every((item, index) => item === right[index]);
}

function nullableText(value: string) {
  return value.trim() ? value : null;
}

function normalizeSubmissionStatus(value: unknown) {
  if (typeof value !== "string") return "";

  const trimmedValue = value.trim();
  const normalizedValue = normalizeOptionKey(trimmedValue);

  if (!trimmedValue) return "";

  if (SUBMISSION_STATUS_OPTIONS.some((option) => option === trimmedValue)) {
    return trimmedValue;
  }

  if (
    normalizedValue === "no" ||
    normalizedValue === "false" ||
    normalizedValue.includes("closed") ||
    normalizedValue.includes("not open")
  ) {
    return "Not open for submissions";
  }

  if (
    normalizedValue === "yes" ||
    normalizedValue === "true" ||
    normalizedValue.includes("open")
  ) {
    return "Open for submissions";
  }

  return trimmedValue;
}

function profileTextValue(profile: AgentProfile, field: EditableTextField) {
  if (field === "open_to_queries") {
    return normalizeSubmissionStatus(profile.open_to_queries);
  }

  const value = profile[field];

  return typeof value === "string" ? value : "";
}

function profileNullableText(profile: AgentProfile, field: EditableTextField) {
  const value = profile[field];

  return typeof value === "string" && value.trim() ? value : null;
}

function createProfileDraft(profile: AgentProfile): AgentProfileDraft {
  const draft = {} as AgentProfileDraft;

  for (const field of EDITABLE_TEXT_FIELDS) {
    draft[field] = profileTextValue(profile, field);
  }

  for (const field of EDITABLE_LIST_FIELDS) {
    draft[field] = splitAgentList(profile[field]);
  }

  for (const field of ACCEPTANCE_FIELDS) {
    draft[field] = profile[field] === true;
  }

  return draft;
}

function buildUpdateAgentProfilePayload(
  profile: AgentProfile,
  draft: AgentProfileDraft
) {
  if (!profile.profile_id) {
    throw new Error("Profile ID is missing. Refresh the page and try again.");
  }

  const payload: UpdateAgentProfileRequest = {
    profile_id: profile.profile_id,
  };
  const indexedPayload = payload as Record<string, unknown>;
  let hasChanges = false;

  for (const field of EDITABLE_TEXT_FIELDS) {
    const previousValue = profileNullableText(profile, field);
    const nextValue = nullableText(draft[field]);

    if (previousValue !== nextValue) {
      indexedPayload[field] = nextValue;
      hasChanges = true;
    }
  }

  for (const field of EDITABLE_LIST_FIELDS) {
    const previousItems = splitAgentList(profile[field]);
    const nextItems = uniqueList(draft[field]);

    if (!listsMatch(previousItems, nextItems)) {
      indexedPayload[field] = nextItems.length > 0 ? nextItems.join("|") : null;
      hasChanges = true;
    }
  }

  for (const field of ACCEPTANCE_FIELDS) {
    const previousValue = profile[field] === true;
    const nextValue = draft[field];

    if (previousValue !== nextValue) {
      indexedPayload[field] = nextValue;
      hasChanges = true;
    }
  }

  return hasChanges ? payload : null;
}

function getProfileLinks(profile: AgentProfile) {
  const links: ProfileLink[] = [];
  const websiteUrl = urlFormatter(profile.website);

  if (websiteUrl) {
    links.push({
      href: websiteUrl,
      label: "Website",
    });
  }

  if (typeof profile.querytracker === "string") {
    const queryTrackerUrl = urlFormatter(profile.querytracker);

    if (queryTrackerUrl) {
      links.push({
        href: queryTrackerUrl,
        label: "QueryTracker",
      });
    }
  }

  if (typeof profile.querymanager === "string") {
    const queryManagerUrl = urlFormatter(profile.querymanager);

    if (queryManagerUrl) {
      links.push({
        href: queryManagerUrl,
        label: "QueryManager",
      });
    }
  }

  if (typeof profile.pubmarketplace === "string") {
    const pubMarketplaceUrl = urlFormatter(profile.pubmarketplace);

    if (pubMarketplaceUrl) {
      links.push({
        href: pubMarketplaceUrl,
        label: "Publishers Marketplace",
      });
    }
  }

  return links;
}

function getAcceptanceFlags(profile: AgentProfile) {
  return [
    ["Middle Grade", profile.accepts_middle_grade],
    ["Young Adult", profile.accepts_young_adult],
    ["Children's", profile.accepts_children],
    ["Nonfiction", profile.accepts_nonfiction],
    ["Comics", profile.accepts_comics],
    ["Screenplay", profile.accepts_screenplay],
    ["Poetry", profile.accepts_poetry],
  ].filter(([, value]) => value === true) as [string, true][];
}

function ProfileTextBlock({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent/58">
        {title}
      </h3>
      <div className="text-base leading-7 text-accent/76">{children}</div>
    </div>
  );
}

function ProfileChips({
  emptyLabel = "Info unavailable",
  items,
  title,
}: {
  emptyLabel?: string;
  items: string[];
  title: string;
}) {
  return (
    <ProfileTextBlock title={title}>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.slice(0, 32).map((item) => (
            <span className="surface-tag px-3 py-1.5 text-sm" key={item}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p>{emptyLabel}</p>
      )}
    </ProfileTextBlock>
  );
}

function ProfileSummaryItem({
  children,
  icon: Icon,
  label,
}: {
  children: React.ReactNode;
  icon: typeof UserRound;
  label: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-accent/10 bg-white/72 text-accent/72">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent/52">
          {label}
        </p>
        <div className="mt-1 break-words text-sm leading-6 text-accent/78">
          {children}
        </div>
      </div>
    </div>
  );
}

function ProfileFormField({
  children,
  id,
  label,
}: {
  children: React.ReactNode;
  id: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        className="text-xs font-semibold uppercase tracking-[0.16em] text-accent/58"
        htmlFor={id}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ProfileTextInput({
  draft,
  field,
  onDraftChange,
  placeholder,
}: {
  draft: AgentProfileDraft;
  field: EditableTextField;
  onDraftChange: (field: EditableTextField, value: string) => void;
  placeholder?: string;
}) {
  const id = `agent-profile-${field}`;

  return (
    <ProfileFormField id={id} label={TEXT_FIELD_LABELS[field]}>
      <Input
        id={id}
        onChange={(event) => onDraftChange(field, event.target.value)}
        placeholder={placeholder}
        value={draft[field]}
      />
    </ProfileFormField>
  );
}

function ProfileTextArea({
  draft,
  field,
  onDraftChange,
  placeholder,
  rows = 5,
}: {
  draft: AgentProfileDraft;
  field: EditableTextField;
  onDraftChange: (field: EditableTextField, value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const id = `agent-profile-${field}`;

  return (
    <ProfileFormField id={id} label={TEXT_FIELD_LABELS[field]}>
      <Textarea
        id={id}
        onChange={(event) => onDraftChange(field, event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={draft[field]}
      />
    </ProfileFormField>
  );
}

function ProfileSubmissionStatusSelect({
  draft,
  onDraftChange,
}: {
  draft: AgentProfileDraft;
  onDraftChange: (field: EditableTextField, value: string) => void;
}) {
  const id = "agent-profile-open_to_queries";

  return (
    <ProfileFormField id={id} label={TEXT_FIELD_LABELS.open_to_queries}>
      <Select
        value={draft.open_to_queries}
        onValueChange={(value) => onDraftChange("open_to_queries", value)}
      >
        <SelectTrigger className="w-full" id={id}>
          <SelectValue placeholder="Select submission status" />
        </SelectTrigger>
        <SelectContent surface="solid">
          <SelectGroup>
            {SUBMISSION_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ProfileFormField>
  );
}

function ProfileTagSelector({
  field,
  onDraftChange,
  options,
  selectedValues,
}: {
  field: EditableListField;
  onDraftChange: (field: EditableListField, value: string[]) => void;
  options: SelectOption[];
  selectedValues: string[];
}) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [error, setError] = useState("");
  const id = `agent-profile-${field}`;
  const selectedKeys = new Set(selectedValues.map(normalizeOptionKey));
  const filteredOptions = options.filter((option) => {
    const searchKey = normalizeOptionKey(searchValue);

    if (!searchKey) return true;

    return (
      normalizeOptionKey(option.label).includes(searchKey) ||
      normalizeOptionKey(option.value).includes(searchKey)
    );
  });

  const setUniqueValues = (values: string[]) => {
    onDraftChange(field, uniqueList(values));
  };

  const handleSelect = (value: string) => {
    setError("");

    if (selectedKeys.has(normalizeOptionKey(value))) {
      setUniqueValues(
        selectedValues.filter(
          (selectedValue) =>
            normalizeOptionKey(selectedValue) !== normalizeOptionKey(value)
        )
      );
      return;
    }

    setUniqueValues([...selectedValues, value]);
  };

  const handleAddCustom = () => {
    const trimmedValue = customValue.trim();

    if (!trimmedValue || selectedKeys.has(normalizeOptionKey(trimmedValue))) {
      setError(`${LIST_FIELD_LABELS[field].slice(0, -1)} already exists`);
      return;
    }

    setUniqueValues([...selectedValues, trimmedValue]);
    setCustomValue("");
    setError("");
  };

  return (
    <ProfileFormField id={id} label={LIST_FIELD_LABELS[field]}>
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              aria-controls={`${id}-listbox`}
              aria-expanded={open}
              className="glass-input inline-flex min-h-11 w-full min-w-0 items-start justify-between gap-2 rounded-[1.75rem] bg-white px-4 py-3 text-sm font-medium text-accent shadow-none outline-none transition-[border-color,box-shadow,background-color] hover:border-accent/22 hover:bg-white/88 focus-visible:border-accent/20 focus-visible:ring-[4px] focus-visible:ring-ring/30"
              id={id}
              role="combobox"
              type="button"
            >
              <span className="flex min-w-0 flex-1 flex-wrap gap-2 text-left">
                {selectedValues.length > 0
                  ? selectedValues.map((value) => (
                      <span
                        className="min-w-0 max-w-full rounded-full border border-accent/10 bg-[#E2E8F1] px-3 py-1 text-xs font-medium text-accent"
                        key={value}
                      >
                        <span className="block max-w-full truncate">
                          {value}
                        </span>
                      </span>
                    ))
                  : `Select ${LIST_FIELD_LABELS[field].toLocaleLowerCase()}...`}
              </span>
              <ChevronDown className="mt-1 size-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[min(42rem,calc(100vw-2rem))] p-0"
            surface="solid"
          >
            <div className="flex flex-col">
              <div className="border-b border-accent/10 p-2">
                <Input
                  className="h-9"
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={`Search ${LIST_FIELD_LABELS[field].toLocaleLowerCase()}...`}
                  value={searchValue}
                />
              </div>
              <div
                className="max-h-[300px] overflow-y-auto p-1"
                id={`${id}-listbox`}
                role="listbox"
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = selectedKeys.has(
                      normalizeOptionKey(option.value)
                    );

                    return (
                      <button
                        aria-selected={isSelected}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-accent hover:text-white focus-visible:bg-accent focus-visible:text-white focus-visible:outline-none"
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        role="option"
                        type="button"
                      >
                        <Check
                          className={cn(
                            "size-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="min-w-0 truncate">
                          {option.label}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-6 text-center text-sm text-accent/58">
                    No {LIST_FIELD_LABELS[field].toLocaleLowerCase()} found.
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {selectedValues.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((value) => (
              <button
                className="flex w-fit items-center gap-1 rounded-full bg-[#E2E8F1] p-2 text-xs font-medium text-accent transition hover:bg-accent/12"
                key={value}
                onClick={() =>
                  setUniqueValues(
                    selectedValues.filter(
                      (selectedValue) => selectedValue !== value
                    )
                  )
                }
                type="button"
              >
                <span>{value}</span>
                <X className="size-4" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex w-full flex-col gap-2 md:w-1/2 md:flex-row">
          <Input
            onChange={(event) => {
              setCustomValue(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder={`Add custom ${LIST_FIELD_LABELS[
              field
            ].toLocaleLowerCase().slice(0, -1)}`}
            value={customValue}
          />
          <Button
            className="md:w-fit"
            onClick={handleAddCustom}
            type="button"
            variant="outline"
          >
            <Plus data-icon="inline-start" />
            Add
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </ProfileFormField>
  );
}

function ProfileAcceptanceMultiSelect({
  id,
  onDraftChange,
  options,
  title,
  values,
}: {
  id: string;
  onDraftChange: (field: AcceptanceField, value: boolean) => void;
  options: readonly AcceptanceOption[];
  title: string;
  values: AgentProfileDraft;
}) {
  const [open, setOpen] = useState(false);
  const selectedOptions = options.filter((option) => values[option.field]);
  const selectedFields = new Set(
    selectedOptions.map((option) => option.field)
  );
  const listboxId = `${id}-listbox`;

  const handleToggle = (field: AcceptanceField) => {
    onDraftChange(field, !values[field]);
  };

  return (
    <ProfileFormField id={id} label={title}>
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              aria-controls={listboxId}
              aria-expanded={open}
              className="glass-input inline-flex min-h-11 w-full min-w-0 items-start justify-between gap-2 rounded-[1.75rem] bg-white px-4 py-3 text-sm font-medium text-accent shadow-none outline-none transition-[border-color,box-shadow,background-color] hover:border-accent/22 hover:bg-white/88 focus-visible:border-accent/20 focus-visible:ring-[4px] focus-visible:ring-ring/30"
              id={id}
              role="combobox"
              type="button"
            >
              <span className="flex min-w-0 flex-1 flex-wrap gap-2 text-left">
                {selectedOptions.length > 0
                  ? selectedOptions.map((option) => (
                      <span
                        className="min-w-0 max-w-full rounded-full border border-accent/10 bg-[#E2E8F1] px-3 py-1 text-xs font-medium text-accent"
                        key={option.field}
                      >
                        <span className="block max-w-full truncate">
                          {option.label}
                        </span>
                      </span>
                    ))
                  : `Select ${title.toLocaleLowerCase()}...`}
              </span>
              <ChevronDown className="mt-1 size-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[min(28rem,calc(100vw-2rem))] p-0"
            surface="solid"
          >
            <div
              className="max-h-[300px] overflow-y-auto p-1"
              id={listboxId}
              role="listbox"
            >
              {options.map((option) => {
                const isSelected = selectedFields.has(option.field);

                return (
                  <button
                    aria-selected={isSelected}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-accent hover:text-white focus-visible:bg-accent focus-visible:text-white focus-visible:outline-none"
                    key={option.field}
                    onClick={() => handleToggle(option.field)}
                    role="option"
                    type="button"
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="min-w-0 truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <button
                className="flex w-fit items-center gap-1 rounded-full bg-[#E2E8F1] p-2 text-xs font-medium text-accent transition hover:bg-accent/12"
                key={option.field}
                onClick={() => onDraftChange(option.field, false)}
                type="button"
              >
                <span>{option.label}</span>
                <X className="size-4" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </ProfileFormField>
  );
}

function AgentProfileCard({
  draft,
  isEditing,
  isSaving,
  onCancelEdit,
  onDraftBooleanChange,
  onDraftListChange,
  onDraftTextChange,
  onEdit,
  onSave,
  profile,
}: {
  draft: AgentProfileDraft | null;
  isEditing: boolean;
  isSaving: boolean;
  onCancelEdit: () => void;
  onDraftBooleanChange: (field: AcceptanceField, value: boolean) => void;
  onDraftListChange: (field: EditableListField, value: string[]) => void;
  onDraftTextChange: (field: EditableTextField, value: string) => void;
  onEdit: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  profile: AgentProfile;
}) {
  const genres = splitAgentList(profile.genres);
  const location = formatLocation(profile);
  const links = getProfileLinks(profile);
  const acceptanceFlags = getAcceptanceFlags(profile);
  const genreSelectOptions = draft
    ? mergeProfileOptions(genreOptions, draft.genres)
    : [];

  if (isEditing && draft) {
    return (
      <section className="glass-panel-strong p-6 md:p-10">
        <form className="flex flex-col gap-8" onSubmit={onSave}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent/58">
                Agent profile
              </p>
              <h2 className="font-serif text-3xl leading-tight text-accent md:text-4xl">
                Edit profile
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={isSaving}
                onClick={onCancelEdit}
                type="button"
                variant="outline"
              >
                <X data-icon="inline-start" />
                Cancel
              </Button>
              <Button disabled={isSaving} type="submit">
                {isSaving ? (
                  <Spinner className="text-white" data-icon="inline-start" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                Save
              </Button>
            </div>
          </div>

          <Separator className="bg-accent/10" />

          <div className="grid gap-4 md:grid-cols-2">
            <ProfileTextInput
              draft={draft}
              field="name"
              onDraftChange={onDraftTextChange}
            />
            <ProfileTextInput
              draft={draft}
              field="title"
              onDraftChange={onDraftTextChange}
            />
            <ProfileTextInput
              draft={draft}
              field="agency"
              onDraftChange={onDraftTextChange}
            />
            <ProfileSubmissionStatusSelect
              draft={draft}
              onDraftChange={onDraftTextChange}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ProfileTextInput
              draft={draft}
              field="email"
              onDraftChange={onDraftTextChange}
              placeholder="agent@example.com"
            />
            <ProfileTextInput
              draft={draft}
              field="location"
              onDraftChange={onDraftTextChange}
              placeholder="New York, NY"
            />
            <ProfileTextInput
              draft={draft}
              field="city"
              onDraftChange={onDraftTextChange}
            />
            <ProfileTextInput
              draft={draft}
              field="state_province"
              onDraftChange={onDraftTextChange}
            />
            <ProfileTextInput
              draft={draft}
              field="country"
              onDraftChange={onDraftTextChange}
            />
            <ProfileTextInput
              draft={draft}
              field="country_code"
              onDraftChange={onDraftTextChange}
              placeholder="US"
            />
          </div>

          <Separator className="bg-accent/10" />

          <div className="flex flex-col gap-5">
            <ProfileTextArea
              draft={draft}
              field="bio"
              onDraftChange={onDraftTextChange}
              rows={7}
            />
            <ProfileTagSelector
              field="genres"
              onDraftChange={onDraftListChange}
              options={genreSelectOptions}
              selectedValues={draft.genres}
            />
            <ProfileTextArea
              draft={draft}
              field="extra_interest"
              onDraftChange={onDraftTextChange}
              rows={6}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ProfileAcceptanceMultiSelect
              id="agent-profile-target-audience"
              onDraftChange={onDraftBooleanChange}
              options={TARGET_AUDIENCE_ACCEPTANCE_OPTIONS}
              title="Target audience"
              values={draft}
            />
            <ProfileAcceptanceMultiSelect
              id="agent-profile-format"
              onDraftChange={onDraftBooleanChange}
              options={FORMAT_ACCEPTANCE_OPTIONS}
              title="Format"
              values={draft}
            />
          </div>

          <ProfileTextBlock title="Links">
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileTextInput
                draft={draft}
                field="website"
                onDraftChange={onDraftTextChange}
                placeholder="https://example.com"
              />
              <ProfileTextInput
                draft={draft}
                field="querytracker"
                onDraftChange={onDraftTextChange}
              />
              <ProfileTextInput
                draft={draft}
                field="querymanager"
                onDraftChange={onDraftTextChange}
              />
              <ProfileTextInput
                draft={draft}
                field="pubmarketplace"
                onDraftChange={onDraftTextChange}
              />
            </div>
          </ProfileTextBlock>
        </form>
      </section>
    );
  }

  return (
    <section className="glass-panel-strong flex flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent/58">
            Agent profile
          </p>
          <h2 className="font-serif text-3xl leading-tight text-accent md:text-4xl">
            {profile.name || "Your literary agent profile"}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-accent/72">
            {[profile.title, profile.agency].filter(Boolean).join(" at ") ||
              "Your profile is linked and ready for details."}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <Button onClick={onEdit} type="button" variant="outline">
            <Pencil data-icon="inline-start" />
            Edit
          </Button>

          {profile.open_to_queries ? (
            <span className="w-fit rounded-full border border-accent bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {profile.open_to_queries}
            </span>
          ) : null}
        </div>
      </div>

      <Separator className="bg-accent/10" />

      <div className="grid gap-5 md:grid-cols-2">
        <ProfileSummaryItem icon={Mail} label="Email">
          {profile.email || "Info unavailable"}
        </ProfileSummaryItem>
        <ProfileSummaryItem icon={MapPin} label="Location">
          {location || "Info unavailable"}
        </ProfileSummaryItem>
      </div>

      <Separator className="bg-accent/10" />

      <div className="flex flex-col gap-8">
        <ProfileTextBlock title="Bio">
          <p>{profile.bio || "Info unavailable"}</p>
        </ProfileTextBlock>

        <ProfileChips items={genres} title="Genres" />

        <ProfileTextBlock title="Interests">
          <p>
            {typeof profile.extra_interest === "string" &&
            profile.extra_interest
              ? profile.extra_interest
              : "Info unavailable"}
          </p>
        </ProfileTextBlock>

        {acceptanceFlags.length > 0 ? (
          <ProfileChips
            items={acceptanceFlags.map(([label]) => label)}
            title="Accepts"
          />
        ) : null}

        {links.length > 0 ? (
          <ProfileTextBlock title="Links">
            <div className="flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                  className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-white/72 px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent/20 hover:bg-white"
                  href={link.href}
                  key={`${link.label}-${link.href}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                  <ExternalLink className="size-4" />
                </a>
              ))}
            </div>
          </ProfileTextBlock>
        ) : null}
      </div>
    </section>
  );
}

function AgentProfileEmptyState() {
  return (
    <section className="glass-panel-strong flex flex-col gap-5 p-6 md:p-10">
      <div className="flex items-start gap-4">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-accent/10 bg-white/72 text-accent">
          <UserRound className="size-5" />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl text-accent">
            Choose how to set up your profile.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-accent/72">
            You can import the profile data we found on the web, or start with
            only your name and email linked to the legacy agent record.
          </p>
        </div>
      </div>
    </section>
  );
}

export function AgentProfileHome({ initialAgentId }: AgentProfileHomeProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [draftProfile, setDraftProfile] = useState<AgentProfileDraft | null>(
    null
  );
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImportMode, setActiveImportMode] = useState<ImportMode | null>(
    null
  );

  const syncCanonicalAgentId = useCallback(
    async (agentId: string) => {
      const result = await syncCurrentAgentIdToClerk(agentId);

      if (!result.success) {
        toast.error(result.error || "Profile linked, but account sync failed.");
        return;
      }

      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsCheckingProfile(true);
      setProfileError(null);

      try {
        let loadedProfile: AgentProfile | null = null;

        if (initialAgentId) {
          try {
            loadedProfile = await fetchAgentProfile("id", initialAgentId);
          } catch (error) {
            if ((error as ApiError).status !== 404) {
              throw error;
            }
          }
        }

        if (!loadedProfile) {
          try {
            loadedProfile = await fetchAgentProfile(
              "name",
              HARDCODED_AGENT_LOOKUP_NAME
            );
          } catch (error) {
            if ((error as ApiError).status !== 404) {
              throw error;
            }
          }
        }

        if (cancelled) return;

        if (loadedProfile) {
          setProfile(loadedProfile);
          setDraftProfile(null);
          setIsEditingProfile(false);
          setIsModalOpen(false);

          if (
            loadedProfile.legacy_agent_id &&
            loadedProfile.legacy_agent_id !== initialAgentId
          ) {
            void syncCanonicalAgentId(loadedProfile.legacy_agent_id);
          }
        } else {
          setProfile(null);
          setDraftProfile(null);
          setIsEditingProfile(false);
          setIsModalOpen(true);
        }
      } catch (error) {
        if (cancelled) return;

        setProfileError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
        setIsModalOpen(false);
      } finally {
        if (!cancelled) {
          setIsCheckingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [initialAgentId, syncCanonicalAgentId]);

  const handleCreateProfile = async (importMode: ImportMode) => {
    let legacyAgent: LegacyAgent | null = null;
    setActiveImportMode(importMode);
    setProfileError(null);

    try {
      legacyAgent = await fetchLegacyAgent();

      try {
        await createAgentProfile(legacyAgent, importMode);
      } catch (error) {
        if ((error as ApiError).status !== 409) {
          throw error;
        }
      }

      const loadedProfile = await fetchAgentProfile("id", legacyAgent.agent_id);
      setProfile(loadedProfile);
      setIsModalOpen(false);

      await syncCanonicalAgentId(legacyAgent.agent_id);

      toast.success(
        importMode === "full"
          ? "Profile imported and linked."
          : "Profile linked with your name and email."
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create profile";
      setProfileError(message);
      toast.error(message);
    } finally {
      setActiveImportMode(null);
    }
  };

  const handleStartEdit = () => {
    if (!profile) return;

    setDraftProfile(createProfileDraft(profile));
    setIsEditingProfile(true);
    setProfileError(null);
  };

  const handleCancelEdit = () => {
    setDraftProfile(null);
    setIsEditingProfile(false);
  };

  const handleDraftTextChange = (
    field: EditableTextField,
    value: string
  ) => {
    setDraftProfile((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            [field]: value,
          }
        : currentDraft
    );
  };

  const handleDraftBooleanChange = (
    field: AcceptanceField,
    value: boolean
  ) => {
    setDraftProfile((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            [field]: value,
          }
        : currentDraft
    );
  };

  const handleDraftListChange = (
    field: EditableListField,
    value: string[]
  ) => {
    setDraftProfile((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            [field]: value,
          }
        : currentDraft
    );
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile || !draftProfile) {
      return;
    }

    setIsUpdatingProfile(true);
    setProfileError(null);

    try {
      const payload = buildUpdateAgentProfilePayload(profile, draftProfile);

      if (!payload) {
        setDraftProfile(null);
        setIsEditingProfile(false);
        toast("No changes to save.");
        return;
      }

      const result = await updateAgentProfile(payload);
      const legacyAgentId = result.agent.legacy_agent_id || profile.legacy_agent_id;
      let nextProfile = result.agent;

      if (legacyAgentId) {
        try {
          nextProfile = await fetchAgentProfile("id", legacyAgentId);
        } catch (error) {
          console.warn("Failed to refresh legacy-filled agent profile", error);
        }
      }

      setProfile(nextProfile);
      setDraftProfile(null);
      setIsEditingProfile(false);
      toast.success("Profile updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      setProfileError(message);
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const isCreatingProfile = activeImportMode !== null;

  return (
    <>
      {isCheckingProfile ? (
        <section className="glass-panel-strong flex min-h-[240px] items-center justify-center p-6 md:p-10">
          <div className="flex items-center gap-3 text-accent/72">
            <Spinner />
            <span className="text-sm font-semibold">Loading profile...</span>
          </div>
        </section>
      ) : profile ? (
        <AgentProfileCard
          draft={draftProfile}
          isEditing={isEditingProfile}
          isSaving={isUpdatingProfile}
          onCancelEdit={handleCancelEdit}
          onDraftBooleanChange={handleDraftBooleanChange}
          onDraftListChange={handleDraftListChange}
          onDraftTextChange={handleDraftTextChange}
          onEdit={handleStartEdit}
          onSave={handleSaveProfile}
          profile={profile}
        />
      ) : (
        <AgentProfileEmptyState />
      )}

      {profileError ? (
        <div className="rounded-[20px] border border-destructive/20 bg-white/70 px-4 py-3 text-sm text-destructive">
          {profileError}
        </div>
      ) : null}

      <Dialog
        open={isModalOpen && !profile}
        onOpenChange={(open) => {
          if (open || profile) {
            setIsModalOpen(open);
          }
        }}
      >
        <DialogContent
          className="max-h-[calc(100vh-2rem)] max-w-[calc(100%-1rem)] overflow-y-auto rounded-[24px] border border-white/80 bg-white p-5 shadow-[0_28px_72px_rgba(24,44,69,0.22)] sm:max-w-[620px] sm:p-7"
          onInteractOutside={(event) => event.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-accent/58 shadow-[0_10px_24px_rgba(24,44,69,0.06)]">
              <Sparkles className="size-3" />
              Profile setup
            </span>
            <DialogTitle className="font-serif text-2xl leading-tight text-accent sm:text-3xl">
              Want us to import your literary agent profile?
            </DialogTitle>
            <DialogDescription className="max-w-[520px] text-sm leading-6 text-accent/72 sm:text-base sm:leading-7">
              We found a profile match on the web and can use it to prefill
              your agent workspace. Either way, we will link your account to the
              legacy agent record.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2 flex-col-reverse gap-3 sm:flex-col sm:justify-start">
            <Button
              disabled={isCreatingProfile}
              onClick={() => void handleCreateProfile("full")}
              type="button"
            >
              {activeImportMode === "full" ? (
                <Spinner className="text-white" data-icon="inline-start" />
              ) : (
                <Sparkles data-icon="inline-start" />
              )}
              Yes, populate my profile
            </Button>
            <Button
              disabled={isCreatingProfile}
              onClick={() => void handleCreateProfile("minimal")}
              type="button"
              variant="outline"
            >
              {activeImportMode === "minimal" ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <CheckCircle2 data-icon="inline-start" />
              )}
              No thanks, I&apos;ll fill it out myself
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
