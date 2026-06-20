"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Save,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui-primitives/dialog";
import { Separator } from "@/app/ui-primitives/separator";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Switch } from "@/app/ui-primitives/switch";
import { Textarea } from "@/app/ui-primitives/textarea";
import { urlFormatter } from "@/app/utils";

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
  "genres",
  "subgenres",
  "extra_interest",
  "website",
  "querytracker",
  "querymanager",
  "pubmarketplace",
] as const satisfies readonly (keyof AgentProfileMutableFields)[];

const ACCEPTANCE_FIELDS = [
  "accepts_middle_grade",
  "accepts_young_adult",
  "accepts_children",
  "accepts_nonfiction",
  "accepts_comics",
  "accepts_screenplay",
  "accepts_poetry",
] as const satisfies readonly (keyof AgentProfileMutableFields)[];

type EditableTextField = (typeof EDITABLE_TEXT_FIELDS)[number];
type AcceptanceField = (typeof ACCEPTANCE_FIELDS)[number];

type AgentProfileDraft = Record<EditableTextField, string> &
  Record<AcceptanceField, boolean>;

const TEXT_FIELD_LABELS: Record<EditableTextField, string> = {
  name: "Name",
  title: "Title",
  agency: "Agency",
  open_to_queries: "Query status",
  email: "Email",
  city: "City",
  state_province: "State / province",
  country: "Country",
  country_code: "Country code",
  location: "Free-text location",
  bio: "Bio",
  genres: "Genres",
  subgenres: "Subgenres",
  extra_interest: "Interests",
  website: "Website",
  querytracker: "QueryTracker",
  querymanager: "QueryManager",
  pubmarketplace: "Publishers Marketplace",
};

const ACCEPTANCE_FIELD_LABELS: Record<AcceptanceField, string> = {
  accepts_middle_grade: "Middle Grade",
  accepts_young_adult: "Young Adult",
  accepts_children: "Children's",
  accepts_nonfiction: "Nonfiction",
  accepts_comics: "Comics",
  accepts_screenplay: "Screenplay",
  accepts_poetry: "Poetry",
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

function parseEditableList(value: string) {
  return value
    .split(/[\n|,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index);
}

function listsMatch(left: string[], right: string[]) {
  if (left.length !== right.length) return false;

  return left.every((item, index) => item === right[index]);
}

function nullableText(value: string) {
  return value.trim() ? value : null;
}

function profileTextValue(profile: AgentProfile, field: EditableTextField) {
  if (field === "genres" || field === "subgenres") {
    return splitAgentList(profile[field]).join("\n");
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
    if (field === "genres") {
      const previousItems = splitAgentList(profile.genres);
      const nextItems = parseEditableList(draft.genres);

      if (!listsMatch(previousItems, nextItems)) {
        indexedPayload.genres = nextItems.length > 0 ? nextItems.join("|") : null;
        hasChanges = true;
      }

      continue;
    }

    if (field === "subgenres") {
      const previousItems = splitAgentList(profile.subgenres);
      const nextItems = parseEditableList(draft.subgenres);

      if (!listsMatch(previousItems, nextItems)) {
        indexedPayload.subgenres = nextItems.length > 0 ? nextItems : null;
        hasChanges = true;
      }

      continue;
    }

    const previousValue = profileNullableText(profile, field);
    const nextValue = nullableText(draft[field]);

    if (previousValue !== nextValue) {
      indexedPayload[field] = nextValue;
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

function ProfileSwitchField({
  checked,
  field,
  onDraftChange,
}: {
  checked: boolean;
  field: AcceptanceField;
  onDraftChange: (field: AcceptanceField, value: boolean) => void;
}) {
  const id = `agent-profile-${field}`;

  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-[1.25rem] border border-accent/10 bg-white/58 px-4 py-3">
      <label className="text-sm font-medium text-accent/78" htmlFor={id}>
        {ACCEPTANCE_FIELD_LABELS[field]}
      </label>
      <Switch
        checked={checked}
        id={id}
        onCheckedChange={(value) => onDraftChange(field, value)}
      />
    </div>
  );
}

function AgentProfileCard({
  draft,
  isEditing,
  isSaving,
  onCancelEdit,
  onDraftBooleanChange,
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
  onDraftTextChange: (field: EditableTextField, value: string) => void;
  onEdit: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  profile: AgentProfile;
}) {
  const genres = splitAgentList(profile.genres);
  const subgenres = splitAgentList(profile.subgenres);
  const location = formatLocation(profile);
  const links = getProfileLinks(profile);
  const acceptanceFlags = getAcceptanceFlags(profile);

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
            <ProfileTextInput
              draft={draft}
              field="open_to_queries"
              onDraftChange={onDraftTextChange}
              placeholder="Open to queries"
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
            <ProfileTextArea
              draft={draft}
              field="genres"
              onDraftChange={onDraftTextChange}
              placeholder="One per line, comma, or |"
              rows={4}
            />
            <ProfileTextArea
              draft={draft}
              field="subgenres"
              onDraftChange={onDraftTextChange}
              placeholder="One per line, comma, or |"
              rows={4}
            />
            <ProfileTextArea
              draft={draft}
              field="extra_interest"
              onDraftChange={onDraftTextChange}
              rows={6}
            />
          </div>

          <ProfileTextBlock title="Accepts">
            <div className="grid gap-3 md:grid-cols-2">
              {ACCEPTANCE_FIELDS.map((field) => (
                <ProfileSwitchField
                  checked={draft[field]}
                  field={field}
                  key={field}
                  onDraftChange={onDraftBooleanChange}
                />
              ))}
            </div>
          </ProfileTextBlock>

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

        {subgenres.length > 0 ? (
          <ProfileChips items={subgenres} title="Subgenres" />
        ) : null}

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
