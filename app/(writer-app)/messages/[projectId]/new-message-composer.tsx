"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, FileUp, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/app/ui-primitives/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/ui-primitives/command";
import { Input } from "@/app/ui-primitives/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui-primitives/popover";
import { Separator } from "@/app/ui-primitives/separator";
import { Spinner } from "@/app/ui-primitives/spinner";
import { Textarea } from "@/app/ui-primitives/textarea";
import { cn } from "@/app/utils";
import { getProjectMessageThreadHref } from "@/app/utils/message-routes";

const MANUSCRIPT_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const IS_MANUSCRIPT_UPLOAD_ENABLED = false;

export type SavedAgentForMessaging = {
  id: string;
  legacyAgentId: string | null;
  name: string;
  agency: string | null;
  agentProfileId: string | null;
};

type CreateThreadResponse = {
  status?: "success" | "duplicate" | "error";
  threadId?: string;
  thread_id?: string;
  message?: string;
  error?: string;
};

type ManuscriptResponse = {
  text?: string;
  message?: string;
  error?: string;
};

type AgentPickerProps = {
  agents: SavedAgentForMessaging[];
  disabled?: boolean;
  onSelectedAgentIdChange: (agentId: string) => void;
  selectedAgentId: string;
};

function normalizeMatchValue(value?: string | null) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function agentMatchesInitialId(
  agent: SavedAgentForMessaging,
  initialAgentId?: string | null,
) {
  const normalizedInitialAgentId = normalizeMatchValue(initialAgentId);

  if (!normalizedInitialAgentId) {
    return false;
  }

  return [agent.id, agent.legacyAgentId, agent.agentProfileId].some(
    (value) => normalizeMatchValue(value) === normalizedInitialAgentId,
  );
}

function findInitialAgent(
  agents: SavedAgentForMessaging[],
  initialAgentId?: string | null,
) {
  return agents.find((agent) => agentMatchesInitialId(agent, initialAgentId));
}

function getDefaultSubject(projectName: string) {
  return `Query: ${projectName}`;
}

function buildQueryLetterScaffold(
  projectName: string,
  agent?: SavedAgentForMessaging | null,
) {
  const agentName = agent?.name?.trim() || "[Agent name]";
  const title = projectName.trim() || "[Project title]";

  return [
    `Dear ${agentName},`,
    "",
    `I am seeking representation for ${title}. [Add a one-sentence hook.]`,
    "",
    "[Add a brief pitch with category, word count, stakes, and comparable titles.]",
    "",
    "Thank you for your time and consideration.",
    "",
    "Sincerely,",
  ].join("\n");
}

function appendManuscriptSample(body: string, sample: string) {
  const trimmedSample = sample.trim();

  if (!trimmedSample) {
    return body;
  }

  return `${body.trimEnd()}\n\nManuscript sample\n\n${trimmedSample}`;
}

function isAllowedManuscript(file: File) {
  const fileName = file.name.toLocaleLowerCase();
  return (
    fileName.endsWith(".pdf") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  );
}

async function readJsonResponse<TResponse>(response: Response) {
  try {
    return (await response.json()) as TResponse;
  } catch {
    return null;
  }
}

function getThreadId(result: CreateThreadResponse | null) {
  return result?.threadId || result?.thread_id || "";
}

function getResponseError(
  result: { message?: string; error?: string } | null,
  fallback: string,
) {
  return result?.message || result?.error || fallback;
}

function AgentPicker({
  agents,
  disabled = false,
  onSelectedAgentIdChange,
  selectedAgentId,
}: AgentPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Recipient"
          className="h-auto min-h-11 w-full justify-between rounded-[1.25rem] px-4 py-3 text-left"
          disabled={disabled}
          id="message-recipient"
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className="flex min-w-0 flex-col items-start">
            <span className="max-w-full truncate">
              {selectedAgent
                ? selectedAgent.name
                : agents.length > 0
                  ? "Select an agent"
                  : "No messaging agents"}
            </span>
            {selectedAgent ? (
              <span className="max-w-full truncate text-xs font-normal text-accent/76">
                {selectedAgent.agency || "Agency unavailable"}
              </span>
            ) : null}
          </span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(calc(100vw-2rem),40rem)] p-0"
        surface="solid"
      >
        <Command>
          <CommandInput placeholder="Search agents..." />
          <CommandList className="max-h-72">
            <CommandEmpty>
              {agents.length === 0
                ? "No agents are currently available for messaging."
                : "No matching agents found."}
            </CommandEmpty>
            <CommandGroup>
              {agents.map((agent) => {
                const isSelected = selectedAgentId === agent.id;

                return (
                  <CommandItem
                    className="items-start rounded-xl px-3 py-3 data-[selected=true]:[&_span]:text-white"
                    key={agent.id}
                    keywords={[
                      agent.name,
                      agent.agency ?? "",
                      agent.legacyAgentId ?? "",
                      agent.agentProfileId ?? "",
                    ]}
                    onSelect={() => {
                      onSelectedAgentIdChange(agent.id);
                      setOpen(false);
                    }}
                    value={agent.id}
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{agent.name}</span>
                      <span className="truncate text-xs text-accent/76">
                        {agent.agency || "Agency unavailable"}
                      </span>
                    </span>
                    <Check
                      className={cn(
                        "mt-0.5",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function NewMessageComposer({
  initialAgentId,
  projectId,
  projectName,
  savedAgents,
}: {
  initialAgentId?: string | null;
  projectId: string;
  projectName: string;
  savedAgents: SavedAgentForMessaging[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initialSelectedAgent = useMemo(
    () => findInitialAgent(savedAgents, initialAgentId),
    [initialAgentId, savedAgents],
  );
  const [selectedAgentId, setSelectedAgentId] = useState(
    initialSelectedAgent?.id ?? "",
  );
  const selectedAgent = useMemo(
    () => savedAgents.find((agent) => agent.id === selectedAgentId) ?? null,
    [savedAgents, selectedAgentId],
  );
  const [subject, setSubject] = useState(() => getDefaultSubject(projectName));
  const initialScaffold = useMemo(
    () => buildQueryLetterScaffold(projectName, initialSelectedAgent),
    [initialSelectedAgent, projectName],
  );
  const previousScaffoldRef = useRef(initialScaffold);
  const [body, setBody] = useState(initialScaffold);
  const [sendError, setSendError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const hasAvailableAgents = savedAgents.length > 0;
  const trimmedSubject = subject.trim();
  const trimmedBody = body.trim();
  const canSend =
    Boolean(selectedAgent) &&
    trimmedSubject.length > 0 &&
    trimmedBody.length > 0 &&
    !isSending &&
    !isUploading;

  useEffect(() => {
    setSelectedAgentId((currentAgentId) => {
      if (currentAgentId) {
        return currentAgentId;
      }

      return initialSelectedAgent?.id ?? "";
    });
  }, [initialSelectedAgent]);

  useEffect(() => {
    const nextScaffold = buildQueryLetterScaffold(projectName, selectedAgent);

    setBody((currentBody) => {
      const shouldReplaceBody =
        currentBody.trim().length === 0 ||
        currentBody === previousScaffoldRef.current;

      previousScaffoldRef.current = nextScaffold;

      return shouldReplaceBody ? nextScaffold : currentBody;
    });
  }, [projectName, selectedAgent]);

  const handleUpload = async (file: File | null | undefined) => {
    if (!file) {
      return;
    }

    setUploadError(null);

    if (!isAllowedManuscript(file)) {
      setUploadError("Upload a PDF, DOC, or DOCX.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("manuscript", file);

      const response = await fetch("/api/process-manuscript", {
        method: "POST",
        body: formData,
      });
      const result = await readJsonResponse<ManuscriptResponse>(response);

      if (!response.ok) {
        throw new Error(getResponseError(result, "Could not read manuscript."));
      }

      const manuscriptText = result?.text?.trim() ?? "";

      if (!manuscriptText) {
        throw new Error("No manuscript text was extracted.");
      }

      setBody((currentBody) =>
        appendManuscriptSample(currentBody, manuscriptText),
      );
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Could not read manuscript.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedAgent) {
      setSendError("Select an agent.");
      return;
    }

    if (!trimmedSubject || !trimmedBody) {
      setSendError("Add a subject and message.");
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      const response = await fetch("/api/message-threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          agentId: selectedAgent.id,
          subject: trimmedSubject,
          body: trimmedBody,
        }),
      });
      const result = await readJsonResponse<CreateThreadResponse>(response);
      const threadId = getThreadId(result);

      if (threadId && result?.status === "success") {
        router.push(getProjectMessageThreadHref(projectId, threadId));
        return;
      }

      if (threadId && result?.status === "duplicate") {
        setSendError(
          "Your message was not sent because a conversation with this agent already exists. Open the existing conversation from your inbox.",
        );
        return;
      }

      if (!response.ok) {
        throw new Error(getResponseError(result, "Failed to send message."));
      }

      throw new Error("Message thread was not returned.");
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Failed to send message.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="rounded-[1.25rem] border border-accent/10 bg-white/72 p-4 shadow-[0_14px_34px_rgba(24,44,69,0.06)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-accent">New message</h3>
        <Button
          disabled={isSending || isUploading}
          onClick={() =>
            router.push(`/messages/${encodeURIComponent(projectId)}`)
          }
          size="sm"
          type="button"
          variant="ghost"
        >
          <X data-icon="inline-start" />
          Close
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="mb-4 flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-accent">
          Make your first message count
        </p>
        <p className="text-sm leading-6 text-accent/76">
          This first message is your query to the agent, so treat it as the
          query letter it is: polished, thoughtful, and true to your voice.
        </p>
        <p
          className="text-sm leading-6 text-accent/76"
          id="manuscript-upload-availability"
        >
          After you send it, you’ll need to wait for the agent to respond before
          you can send another message. If they request pages and choose to move
          forward, manuscript upload will become available here.
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-accent"
              htmlFor="message-recipient"
            >
              Recipient
            </label>
            <AgentPicker
              agents={savedAgents}
              disabled={isSending || isUploading}
              onSelectedAgentIdChange={(nextAgentId) => {
                setSelectedAgentId(nextAgentId);
                setSendError(null);
              }}
              selectedAgentId={selectedAgentId}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-accent"
              htmlFor="message-subject"
            >
              Subject
            </label>
            <Input
              disabled={isSending || !hasAvailableAgents}
              id="message-subject"
              onChange={(event) => {
                setSubject(event.target.value);
                setSendError(null);
              }}
              value={subject}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-accent"
            htmlFor="message-body"
          >
            Message
          </label>
          <Textarea
            className="min-h-72"
            disabled={isSending || !hasAvailableAgents}
            id="message-body"
            onChange={(event) => {
              setBody(event.target.value);
              setSendError(null);
            }}
            value={body}
          />
        </div>

        {!hasAvailableAgents ? (
          <p
            className="rounded-[1.25rem] border border-accent/10 bg-white/60 px-4 py-3 text-sm leading-6 text-accent/76"
            role="status"
          >
            None of your saved agents are available for messaging yet. Agents
            need a Write Query Hook account to receive messages.
          </p>
        ) : null}

        <input
          accept={MANUSCRIPT_ACCEPT}
          aria-label="Upload manuscript"
          className="sr-only"
          disabled={
            !IS_MANUSCRIPT_UPLOAD_ENABLED ||
            isSending ||
            isUploading ||
            !hasAvailableAgents
          }
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            event.currentTarget.value = "";
            void handleUpload(file);
          }}
          ref={fileInputRef}
          type="file"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-h-5">
            {uploadError ? (
              <p className="text-sm text-destructive">{uploadError}</p>
            ) : null}
            {sendError ? (
              <p className="text-sm text-destructive">{sendError}</p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              aria-describedby="manuscript-upload-availability"
              disabled={
                !IS_MANUSCRIPT_UPLOAD_ENABLED ||
                isSending ||
                isUploading ||
                !hasAvailableAgents
              }
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="outline"
            >
              {isUploading ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <FileUp data-icon="inline-start" />
              )}
              Upload manuscript
            </Button>
            <Button disabled={!canSend} type="submit">
              {isSending ? (
                <Spinner className="text-white" data-icon="inline-start" />
              ) : (
                <Send data-icon="inline-start" />
              )}
              Send
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
