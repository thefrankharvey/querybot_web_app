"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { captureQuerySafetyEvent } from "@/app/utils/query-safety/product-analytics.client";
import type {
  QueryReminder,
  QueryReminderKind,
  QueryReminderSource,
  QueryReminderStatus,
  QueryReminderSuggestionDismissal,
  QueryReminderRuleId,
} from "@/app/utils/query-reminders/contracts";

export type QueryReminderOriginSurface =
  | "home"
  | "kanban_dialog"
  | "query_dashboard";

export type QueryReminderListFilters = {
  status?: QueryReminderStatus;
  due?: "due" | "overdue" | "due_or_overdue" | "upcoming";
  projectId?: string;
  enabled?: boolean;
};

export const queryReminderKeys = {
  all: ["query-reminders"] as const,
  list: (filters: Omit<QueryReminderListFilters, "enabled"> = {}) =>
    [
      ...queryReminderKeys.all,
      "list",
      filters.status ?? null,
      filters.due ?? null,
      filters.projectId ?? null,
    ] as const,
  suggestionDismissals: (agentMatchId: string) =>
    [
      ...queryReminderKeys.all,
      "suggestion-dismissals",
      agentMatchId,
    ] as const,
};

type ApiErrorPayload = {
  code?: string;
  message?: string;
  error?: string;
};

export class QueryReminderClientApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly recoverable: boolean;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "QueryReminderClientApiError";
    this.status = status;
    this.code = code ?? null;
    this.recoverable = status === 0 || status === 409 || status >= 500;
  }
}

export async function fetchQueryReminderJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new QueryReminderClientApiError(
      "The reminder service could not be reached. Your changes are still here.",
      0,
      "NETWORK_ERROR",
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | (T & ApiErrorPayload)
    | null;

  if (!response.ok) {
    throw new QueryReminderClientApiError(
      payload?.message ??
        payload?.error ??
        "The reminder could not be updated. Your changes are still here.",
      response.status,
      payload?.code,
    );
  }

  if (!payload) {
    throw new QueryReminderClientApiError(
      "The reminder service returned an unexpected response.",
      response.status,
      "INVALID_RESPONSE",
    );
  }

  return payload;
}

function buildReminderListUrl(
  filters: Omit<QueryReminderListFilters, "enabled">,
): string {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.due) params.set("due", filters.due);
  if (filters.projectId !== undefined) params.set("projectId", filters.projectId);

  const query = params.toString();
  return query ? `/api/query-reminders?${query}` : "/api/query-reminders";
}

async function invalidateReminderQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryReminderKeys.all });
}

export function useQueryReminders(filters: QueryReminderListFilters = {}) {
  const { enabled = true, ...requestFilters } = filters;

  return useQuery({
    queryKey: queryReminderKeys.list(requestFilters),
    queryFn: async () => {
      const payload = await fetchQueryReminderJson<{ reminders: QueryReminder[] }>(
        buildReminderListUrl(requestFilters),
      );
      return payload.reminders;
    },
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useQueryReminderSuggestionDismissals(
  agentMatchId: string,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryReminderKeys.suggestionDismissals(agentMatchId),
    queryFn: async () => {
      const payload = await fetchQueryReminderJson<{
        dismissals: QueryReminderSuggestionDismissal[];
      }>(
        `/api/query-reminders/suggestions/dismissals?agentMatchId=${encodeURIComponent(agentMatchId)}`,
      );
      return payload.dismissals;
    },
    enabled: (options.enabled ?? true) && agentMatchId.length > 0,
    staleTime: 30_000,
  });
}

export type CreateQueryReminderVariables = {
  agentMatchId: string;
  kind: QueryReminderKind;
  dueOn: string;
  timezone: string;
  note?: string | null;
  source?: QueryReminderSource;
  suggestionRule?: QueryReminderRuleId | null;
};

export function useCreateQueryReminder(options: {
  originSurface: QueryReminderOriginSurface;
  onSuccess?: (reminder: QueryReminder) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateQueryReminderVariables) => {
      const payload = await fetchQueryReminderJson<{ reminder: QueryReminder }>(
        "/api/query-reminders",
        {
          method: "POST",
          body: JSON.stringify({
            agentMatchId: variables.agentMatchId,
            kind: variables.kind,
            dueOn: variables.dueOn,
            timezone: variables.timezone,
            note: variables.note ?? null,
            source: variables.source ?? "manual",
            suggestionRule: variables.suggestionRule ?? null,
          }),
        },
      );
      return payload.reminder;
    },
    onSuccess: async (reminder, variables) => {
      await invalidateReminderQueries(queryClient);

      const reminderSource = variables.source ?? "manual";
      captureQuerySafetyEvent("reminder_created", {
        reminderKind: variables.kind,
        reminderSource,
        originSurface: options.originSurface,
      });

      if (reminderSource === "accepted_suggestion" && variables.suggestionRule) {
        captureQuerySafetyEvent("smart_reminder_suggestion_accepted", {
          ruleId: variables.suggestionRule,
          originSurface: options.originSurface,
        });
      }

      options.onSuccess?.(reminder);
    },
  });
}

type ReminderActionVariables = {
  reminderId: string;
  reminderKind: QueryReminderKind;
};

function useReminderTransition(
  action: "complete" | "dismiss",
  options: {
    originSurface: QueryReminderOriginSurface;
    onSuccess?: (reminder: QueryReminder) => void;
  },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: ReminderActionVariables) => {
      const payload = await fetchQueryReminderJson<{ reminder: QueryReminder }>(
        `/api/query-reminders/${variables.reminderId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ action }),
        },
      );
      return payload.reminder;
    },
    onSuccess: async (reminder, variables) => {
      await invalidateReminderQueries(queryClient);
      captureQuerySafetyEvent(
        action === "complete" ? "reminder_completed" : "reminder_dismissed",
        {
          reminderKind: variables.reminderKind,
          originSurface: options.originSurface,
        },
      );
      options.onSuccess?.(reminder);
    },
  });
}

export function useCompleteQueryReminder(options: {
  originSurface: QueryReminderOriginSurface;
  onSuccess?: (reminder: QueryReminder) => void;
}) {
  return useReminderTransition("complete", options);
}

export function useDismissQueryReminder(options: {
  originSurface: QueryReminderOriginSurface;
  onSuccess?: (reminder: QueryReminder) => void;
}) {
  return useReminderTransition("dismiss", options);
}

export function useCancelQueryReminder(options: {
  onSuccess?: (reminder: QueryReminder) => void;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: ReminderActionVariables) => {
      const payload = await fetchQueryReminderJson<{ reminder: QueryReminder }>(
        `/api/query-reminders/${variables.reminderId}`,
        { method: "DELETE" },
      );
      return payload.reminder;
    },
    onSuccess: async (reminder) => {
      await invalidateReminderQueries(queryClient);
      options.onSuccess?.(reminder);
    },
  });
}

export type SnoozeQueryReminderVariables = ReminderActionVariables & {
  dueOn: string;
  timezone: string;
};

export function useSnoozeQueryReminder(options: {
  originSurface: QueryReminderOriginSurface;
  onSuccess?: (reminder: QueryReminder) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: SnoozeQueryReminderVariables) => {
      const payload = await fetchQueryReminderJson<{ reminder: QueryReminder }>(
        `/api/query-reminders/${variables.reminderId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            action: "snooze",
            dueOn: variables.dueOn,
            timezone: variables.timezone,
          }),
        },
      );
      return payload.reminder;
    },
    onSuccess: async (reminder, variables) => {
      await invalidateReminderQueries(queryClient);
      captureQuerySafetyEvent("reminder_snoozed", {
        reminderKind: variables.reminderKind,
        originSurface: options.originSurface,
      });
      options.onSuccess?.(reminder);
    },
  });
}

export type RescheduleQueryReminderVariables = ReminderActionVariables & {
  dueOn: string;
  timezone: string;
  note?: string | null;
};

export function useRescheduleQueryReminder(options: {
  onSuccess?: (reminder: QueryReminder) => void;
} = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: RescheduleQueryReminderVariables) => {
      const payload = await fetchQueryReminderJson<{ reminder: QueryReminder }>(
        `/api/query-reminders/${variables.reminderId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            action: "reschedule",
            dueOn: variables.dueOn,
            timezone: variables.timezone,
            note: variables.note ?? null,
          }),
        },
      );
      return payload.reminder;
    },
    onSuccess: async (reminder) => {
      await invalidateReminderQueries(queryClient);
      options.onSuccess?.(reminder);
    },
  });
}

export type DismissQueryReminderSuggestionVariables = {
  agentMatchId: string;
  ruleId: QueryReminderRuleId;
};

export function useDismissQueryReminderSuggestion(options: {
  originSurface: QueryReminderOriginSurface;
  onSuccess?: (dismissal: QueryReminderSuggestionDismissal) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: DismissQueryReminderSuggestionVariables) => {
      const payload = await fetchQueryReminderJson<{
        dismissal: QueryReminderSuggestionDismissal;
      }>("/api/query-reminders/suggestions/dismissals", {
        method: "POST",
        body: JSON.stringify({
          agentMatchId: variables.agentMatchId,
          ruleId: variables.ruleId,
        }),
      });
      return payload.dismissal;
    },
    onSuccess: async (dismissal, variables) => {
      await invalidateReminderQueries(queryClient);
      captureQuerySafetyEvent("smart_reminder_suggestion_dismissed", {
        ruleId: variables.ruleId,
        originSurface: options.originSurface,
      });
      options.onSuccess?.(dismissal);
    },
  });
}
