"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UserNotification } from "@/app/utils/personalized-radar/notifications";
import { captureRadarEvent } from "@/app/utils/personalized-radar/product-analytics.client";

type NotificationPage = {
  notifications: UserNotification[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
  asOf: string;
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (status: "all" | "unread") => [...notificationKeys.all, "list", status] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

async function notificationJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;
  if (!response.ok || !payload) {
    throw new Error(payload?.message ?? "Notifications could not be updated");
  }
  return payload;
}

export function useNotifications(status: "all" | "unread" = "all") {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(status),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ status, limit: "20" });
      if (pageParam) params.set("cursor", pageParam);
      return notificationJson<NotificationPage>(`/api/notifications?${params}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () =>
      notificationJson<NotificationPage>(
        "/api/notifications?status=unread&limit=1",
      ).then((page) => page.unreadCount),
    staleTime: 15_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      notificationId: string;
      action: "read" | "unread" | "archive";
    }) =>
      notificationJson<{ notification: UserNotification }>(
        `/api/notifications/${input.notificationId}`,
        { method: "PATCH", body: JSON.stringify({ action: input.action }) },
      ),
    onSuccess: async (_payload, input) => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      captureRadarEvent(
        input.action === "archive"
          ? "notification_archived"
          : "notification_marked_read",
        { channel: "in_app" },
      );
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (before: string) =>
      notificationJson<{ updated: number }>("/api/notifications/mark-all-read", {
        method: "POST",
        body: JSON.stringify({ before }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      captureRadarEvent("notification_marked_read", { channel: "in_app" });
    },
  });
}

