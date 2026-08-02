"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DataGrid,
  SelectColumn,
  textEditor,
  type Column,
  type DataGridHandle,
  type RenderEditCellProps,
  type SortColumn,
} from "react-data-grid";
import {
  Activity,
  AlertTriangle,
  Download,
  ExternalLink,
  FileUp,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  FIT_RATING_CONFIG,
  FitRatingBadge,
  type FitRating,
} from "@/app/components/fit-rating-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/ui-primitives/alert-dialog";
import { Button } from "@/app/ui-primitives/button";
import { Spinner } from "@/app/ui-primitives/spinner";
import { urlFormatter } from "@/app/utils";
import { cn } from "@/app/utils";
import {
  getProjectDashboardExportColumnHeader,
  getProjectDashboardExportFilename,
  type ProjectDashboardExportRow,
} from "@/app/utils/project-dashboard-export";
import { useAgentMatches } from "@/app/(writer-app)/context/agent-matches-context";
import { getSavedAgentComposeMessageHref } from "@/app/(writer-app)/agent-matches/project-scoped-agent-messaging";
import { useAgentMessagingAvailability } from "@/app/hooks/use-agent-messaging-availability";
import { normalizeAgentMessagingId } from "@/app/utils/agent-messaging-availability";
import { QueryStatusBadge } from "@/app/components/messages/query-lifecycle";
import { getProjectMessageThreadHref } from "@/app/utils/message-routes";
import type { QueryProgress } from "@/app/utils/message-types";
import { isManuscriptUploadVisible } from "@/app/utils/manuscript-attachments";
import { AgencyGuardBadge } from "@/app/components/query-safety/agency-guard";
import type { AgencyGuardServiceResult } from "@/app/utils/query-safety/agency-guard";
import { getDashboardAgencyGuard } from "@/app/utils/query-safety/dashboard-agency-guard";
import { NextReminderBadge } from "@/app/components/query-safety/reminder-badge";
import {
  getNextScheduledReminder,
  getReminderUrgency,
} from "@/app/components/query-safety/reminder-view-model";
import { useQueryReminders } from "@/app/hooks/use-query-reminders";
import { useQuerySafetyConfig } from "@/app/hooks/use-query-safety-config";
import type { QueryReminder } from "@/app/utils/query-reminders/contracts";
import { AgentWatchButton } from "@/app/components/personalized-radar/agent-watch-button";
import { AgentWatchLookupProvider } from "@/app/hooks/use-agent-watches";

import type { KanbanCardData } from "./kanban-card";
import { useQueryDashContext } from "../context/query-dash-context";
import { QueryRoundBadge } from "./query-round-control";
import {
  getQueryRoundSelection,
  getQueryRoundState,
  isQueryRoundSelection,
  isSameQueryRoundState,
  matchesQueryRoundFilter,
  QUERY_ROUND_LABELS,
  QUERY_ROUND_SELECTIONS,
  sortByQueryRound,
  type QueryRoundFilter,
} from "@/app/utils/query-rounds";

type DashboardTableRow = ProjectDashboardExportRow & {
  id: string;
  cardId: string;
  index_id: string | null;
  isPlaceholder: boolean;
  fitRating: FitRating;
  queryRound: number | null;
  queryOnHold: boolean;
  projectName: string;
  writerProjectId: string | null;
  isMessagingAvailable: boolean;
  trackingMode: "live" | "manual";
  messageThreadId: string | null;
  queryProgress: QueryProgress | null;
  lifecycleSyncUnavailable: boolean;
  agencyGuard: AgencyGuardServiceResult | null;
  nextReminder: QueryReminder | null;
};

type EditableTableKey = Exclude<
  keyof DashboardTableRow,
  | "id"
  | "cardId"
  | "index_id"
  | "isPlaceholder"
  | "projectName"
  | "writerProjectId"
  | "isMessagingAvailable"
  | "trackingMode"
  | "messageThreadId"
  | "queryProgress"
  | "lifecycleSyncUnavailable"
  | "agencyGuard"
  | "nextReminder"
  | "queryOnHold"
  | "wqh_profile_link"
>;

const WQH_PROFILE_LINK_BASE_URL = "https://writequeryhook.com";
const MESSAGE_ACTION_COLUMN_KEY = "message_action";
const RADAR_COLUMN_KEY = "radar_watch";
const REMINDER_COLUMN_KEY = "nextReminder";
type ReminderFilter = "all" | "due" | "overdue";
const FIT_RATING_OPTIONS = Object.keys(FIT_RATING_CONFIG) as FitRating[];
const HEADER_ROW_HEIGHT = 42;
const ROW_HEIGHT = 44;
const MIN_PLACEHOLDER_ROWS = 8;
const DATE_COLUMN_KEYS = new Set<keyof DashboardTableRow>([
  "query_sent_date",
  "pages_requested_date",
  "rejected_date",
  "offer_date",
]);
const LINK_COLUMN_KEYS = new Set<keyof DashboardTableRow>([
  "agency_url",
  "query_tracker",
  "pub_marketplace",
]);

function rowKeyGetter(row: DashboardTableRow) {
  return row.id;
}

function getFilenameFromContentDisposition(
  contentDisposition: string | null,
  fallbackFilename: string,
) {
  const quotedFilename = contentDisposition?.match(/filename="([^"]+)"/)?.[1];
  const plainFilename = contentDisposition?.match(/filename=([^;]+)/)?.[1];
  return (quotedFilename ?? plainFilename)?.trim() || fallbackFilename;
}

async function getDownloadErrorMessage(response: Response) {
  try {
    const errorData = (await response.json()) as { error?: string };
    return errorData.error || "Failed to create spreadsheet";
  } catch {
    return "Failed to create spreadsheet";
  }
}

function parseDateOnly(value?: string | null) {
  const datePart = value?.split("T")[0] ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : "";
}

function getFallbackDate(card: KanbanCardData, columnId: string) {
  return card.columnId === columnId ? parseDateOnly(card.updated_date) : "";
}

function getAgentResultPath(index: number) {
  return `/agent-matches/${index}`;
}

function getWqhProfileExportUrl(index: number) {
  return `${WQH_PROFILE_LINK_BASE_URL}${getAgentResultPath(index)}`;
}

function getWqhProfileHref(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  if (trimmedValue.startsWith(WQH_PROFILE_LINK_BASE_URL)) {
    return trimmedValue.slice(WQH_PROFILE_LINK_BASE_URL.length) || "/";
  }

  return trimmedValue.startsWith("/") ? trimmedValue : "";
}

function mapCardToRow(
  card: KanbanCardData,
  wqhProfileLinkByIndexId: ReadonlyMap<string, string>,
  availableAgentIds: ReadonlySet<string>,
  agencyGuard: AgencyGuardServiceResult,
  nextReminder: QueryReminder | null,
): DashboardTableRow {
  const indexId = card.index_id ?? null;
  const canUseManualDateFallback = card.trackingMode !== "live";

  return {
    id: card.id,
    cardId: card.id,
    index_id: indexId,
    isPlaceholder: false,
    projectName: card.projectName,
    writerProjectId: card.writerProjectId ?? null,
    isMessagingAvailable: availableAgentIds.has(
      normalizeAgentMessagingId(indexId),
    ),
    trackingMode: card.trackingMode ?? "manual",
    messageThreadId: card.messageThreadId ?? null,
    queryProgress: card.queryProgress ?? null,
    lifecycleSyncUnavailable: card.lifecycleSyncUnavailable ?? false,
    agencyGuard,
    nextReminder,
    name: card.name ?? "",
    fitRating: card.fitRating,
    queryRound: card.queryRound,
    queryOnHold: card.queryOnHold,
    agency_url: card.agency_url ?? "",
    wqh_profile_link: indexId
      ? (wqhProfileLinkByIndexId.get(indexId) ?? "")
      : "",
    query_tracker: card.query_tracker ?? "",
    pub_marketplace: card.pub_marketplace ?? "",
    email: card.email ?? "",
    query_sent_date:
      parseDateOnly(card.query_sent_date) ||
      (canUseManualDateFallback
        ? getFallbackDate(card, "submitted-query")
        : ""),
    pages_requested_date:
      parseDateOnly(card.pages_requested_date) ||
      (canUseManualDateFallback
        ? getFallbackDate(card, "pages-requested")
        : ""),
    rejected_date:
      parseDateOnly(card.rejected_date) ||
      (canUseManualDateFallback ? getFallbackDate(card, "rejected") : ""),
    offer_date:
      parseDateOnly(card.offer_date) ||
      (canUseManualDateFallback ? getFallbackDate(card, "offer-made") : ""),
    notes: card.notes ?? "",
  };
}

function createPlaceholderRow(index: number): DashboardTableRow {
  return {
    id: `placeholder:${index}`,
    cardId: "",
    index_id: null,
    isPlaceholder: true,
    projectName: "",
    writerProjectId: null,
    isMessagingAvailable: false,
    trackingMode: "manual",
    messageThreadId: null,
    queryProgress: null,
    lifecycleSyncUnavailable: false,
    agencyGuard: null,
    nextReminder: null,
    name: "",
    fitRating: "neutral",
    queryRound: null,
    queryOnHold: false,
    agency_url: "",
    wqh_profile_link: "",
    query_tracker: "",
    pub_marketplace: "",
    email: "",
    query_sent_date: "",
    pages_requested_date: "",
    rejected_date: "",
    offer_date: "",
    notes: "",
  };
}

function normalizeTextValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDateValue(value: unknown) {
  const normalized = normalizeTextValue(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
}

function normalizeFitRating(value: unknown): FitRating {
  return FIT_RATING_OPTIONS.includes(value as FitRating)
    ? (value as FitRating)
    : "neutral";
}

function isLikelyEmailList(value: string) {
  if (!value.trim()) return true;
  return value
    .split(/[\s,;]+/)
    .filter(Boolean)
    .every((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));
}

function buildCardUpdate(
  columnKey: string,
  previousRow: DashboardTableRow,
  nextRow: DashboardTableRow,
) {
  if (
    (previousRow.trackingMode === "live" ||
      previousRow.lifecycleSyncUnavailable) &&
    DATE_COLUMN_KEYS.has(columnKey as keyof DashboardTableRow)
  ) {
    return null;
  }

  if (columnKey === "fitRating") {
    const fitRating = normalizeFitRating(nextRow.fitRating);
    return fitRating === previousRow.fitRating ? null : { fitRating };
  }

  if (columnKey === "email") {
    const email = normalizeTextValue(nextRow.email);
    if (!isLikelyEmailList(email) || email === previousRow.email) return null;
    return { email };
  }

  if (DATE_COLUMN_KEYS.has(columnKey as keyof DashboardTableRow)) {
    const key = columnKey as
      | "query_sent_date"
      | "pages_requested_date"
      | "rejected_date"
      | "offer_date";
    const dateValue = normalizeDateValue(nextRow[key]);
    return dateValue === previousRow[key] ? null : { [key]: dateValue };
  }

  if (LINK_COLUMN_KEYS.has(columnKey as keyof DashboardTableRow)) {
    const key = columnKey as "agency_url" | "query_tracker" | "pub_marketplace";
    const value = normalizeTextValue(nextRow[key]);
    return value === previousRow[key] ? null : { [key]: value };
  }

  if (columnKey === "name") {
    const name = normalizeTextValue(nextRow.name);
    return !name || name === previousRow.name ? null : { name };
  }

  if (columnKey === "notes") {
    const notes = typeof nextRow.notes === "string" ? nextRow.notes : "";
    return notes === previousRow.notes ? null : { notes };
  }

  return null;
}

function TextCell({ value }: { value: string }) {
  return <span className="block truncate">{value}</span>;
}

function LinkCell({ value }: { value: string }) {
  const formattedUrl = urlFormatter(value);

  if (!formattedUrl) {
    return null;
  }

  return (
    <a
      className="inline-flex min-w-0 items-center gap-1 text-accent underline-offset-4 hover:underline"
      href={formattedUrl}
      rel="noreferrer"
      target="_blank"
    >
      <span className="truncate">{value}</span>
      <ExternalLink className="size-3.5 shrink-0" />
    </a>
  );
}

function WqhProfileLinkCell({ value }: { value: string }) {
  const href = getWqhProfileHref(value);

  return href ? (
    <Link
      className="inline-flex min-w-0 items-center gap-1 text-accent underline-offset-4 hover:underline"
      href={href}
      title={value}
    >
      <span className="truncate">WQH Profile</span>
      <ExternalLink className="size-3.5 shrink-0" />
    </Link>
  ) : null;
}

function MessageActionCell({
  onMessage,
  row,
}: {
  onMessage: (row: DashboardTableRow, shareManuscript: boolean) => void;
  row: DashboardTableRow;
}) {
  const href = row.messageThreadId
    ? getProjectMessageThreadHref(
        row.writerProjectId ?? row.projectName,
        row.messageThreadId,
      )
    : getSavedAgentComposeMessageHref({
        indexId: row.index_id,
        projectName: row.projectName,
        writerProjectId: row.writerProjectId,
      });

  if (
    (!row.isMessagingAvailable && !row.messageThreadId) ||
    !href ||
    row.isPlaceholder
  ) {
    return null;
  }

  const isLive = Boolean(row.messageThreadId);
  const canShareManuscript =
    isLive && isManuscriptUploadVisible(row.queryProgress?.currentCode);

  return (
    <Button
      aria-label={`${
        canShareManuscript
          ? "Share manuscript with"
          : isLive
            ? "View live query for"
            : "Message"
      } ${row.name}`}
      className="h-8 px-2 text-xs"
      onClick={(event) => {
        event.stopPropagation();
        onMessage(row, canShareManuscript);
      }}
      size="sm"
      type="button"
      variant="secondary"
    >
      {canShareManuscript ? (
        <FileUp data-icon="inline-start" />
      ) : isLive ? (
        <Activity data-icon="inline-start" />
      ) : (
        <MessageSquare data-icon="inline-start" />
      )}
      {canShareManuscript
        ? "Share manuscript"
        : isLive
          ? "View query"
          : "Message"}
    </Button>
  );
}

function TrackingCell({ row }: { row: DashboardTableRow }) {
  if (row.isPlaceholder) return null;

  if (row.lifecycleSyncUnavailable) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
        <AlertTriangle aria-hidden className="size-3.5 shrink-0" />
        <span>Status sync paused</span>
      </div>
    );
  }

  if (row.trackingMode === "live" && row.queryProgress) {
    return (
      <div className="flex items-center gap-2">
        <QueryStatusBadge compact status={row.queryProgress.currentCode} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent/48">
          Live
        </span>
      </div>
    );
  }

  return <span className="text-xs font-medium text-accent/56">Manual</span>;
}

function ReminderCell({ row }: { row: DashboardTableRow }) {
  if (row.isPlaceholder || !row.nextReminder) return null;
  return <NextReminderBadge reminder={row.nextReminder} />;
}

function RadarWatchCell({ row }: { row: DashboardTableRow }) {
  if (row.isPlaceholder) return null;
  return (
    <AgentWatchButton
      agentName={row.name}
      compact
      identity={{ agentProfileId: null, indexId: row.index_id }}
      originAgentMatchId={row.cardId}
      originSurface="query_dashboard"
    />
  );
}

function DateEditor({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<DashboardTableRow>) {
  const key = column.key as keyof DashboardTableRow;
  const value = DATE_COLUMN_KEYS.has(key) ? String(row[key] ?? "") : "";

  return (
    <input
      autoFocus
      className="h-full w-full border-0 bg-white px-2 text-sm text-accent outline-none"
      type="date"
      value={value}
      onBlur={() => onClose(true)}
      onChange={(event) =>
        onRowChange({ ...row, [key]: event.target.value }, true)
      }
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose(false);
        if (event.key === "Enter") onClose(true);
      }}
    />
  );
}

function FitRatingEditor({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<DashboardTableRow>) {
  return (
    <select
      autoFocus
      className="h-full w-full border-0 bg-white px-2 text-sm font-medium text-accent outline-none"
      value={row.fitRating}
      onBlur={() => onClose(true)}
      onChange={(event) =>
        onRowChange(
          { ...row, [column.key]: normalizeFitRating(event.target.value) },
          true,
        )
      }
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose(false);
        if (event.key === "Enter") onClose(true);
      }}
    >
      {FIT_RATING_OPTIONS.map((rating) => (
        <option key={rating} value={rating}>
          {FIT_RATING_CONFIG[rating].label}
        </option>
      ))}
    </select>
  );
}

function QueryRoundEditor({
  row,
  onRowChange,
  onClose,
}: RenderEditCellProps<DashboardTableRow>) {
  const value = getQueryRoundSelection(row);

  return (
    <select
      autoFocus
      aria-label={`Query Round for ${row.name}`}
      className="h-full w-full border-0 bg-white px-2 text-sm font-medium text-accent outline-none"
      value={value}
      onBlur={() => onClose(true)}
      onChange={(event) => {
        const selection = event.target.value;
        if (!isQueryRoundSelection(selection)) return;

        onRowChange({ ...row, ...getQueryRoundState(selection) }, true);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose(false);
        if (event.key === "Enter") onClose(true);
      }}
    >
      {QUERY_ROUND_SELECTIONS.map((selection) => (
        <option key={selection} value={selection}>
          {QUERY_ROUND_LABELS[selection]}
        </option>
      ))}
    </select>
  );
}

export function QueryDashboardTable() {
  const router = useRouter();
  const { matches } = useAgentMatches();
  const safetyConfig = useQuerySafetyConfig();
  const agencyHistoryEnabled =
    safetyConfig.data?.features.agencyHistory === true;
  const manualRemindersEnabled =
    safetyConfig.data?.features.manualReminders === true;
  const queryRoundsEnabled =
    safetyConfig.data?.features.queryRounds === true;
  const {
    activeProjectName,
    cards,
    createManualRow,
    isLoading,
    removeRowsByRecordIds,
    setQueryRound,
    updateCardFields,
    visibleCards,
  } = useQueryDashContext();
  const gridRef = useRef<DataGridHandle>(null);
  const gridFrameRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState(0);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [isCreatingRow, setIsCreatingRow] = useState(false);
  const [isExportingRows, setIsExportingRows] = useState(false);
  const [isRemovingRows, setIsRemovingRows] = useState(false);
  const [queryRoundFilter, setQueryRoundFilter] =
    useState<QueryRoundFilter>("all");
  const [reminderFilter, setReminderFilter] =
    useState<ReminderFilter>("all");
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const [pendingFocusRowId, setPendingFocusRowId] = useState<string | null>(
    null,
  );
  const remindersQuery = useQueryReminders({
    status: "scheduled",
    enabled: manualRemindersEnabled,
  });
  const agentMessagingIds = useMemo(
    () => visibleCards.map((card) => card.index_id),
    [visibleCards],
  );
  const { availableAgentIds } =
    useAgentMessagingAvailability(agentMessagingIds);
  const wqhProfileLinkByIndexId = useMemo(() => {
    const linkByIndexId = new Map<string, string>();

    matches.forEach((agent, index) => {
      const indexId = agent.agent_id?.trim();
      if (indexId && !linkByIndexId.has(indexId)) {
        linkByIndexId.set(indexId, getWqhProfileExportUrl(index));
      }
    });

    return linkByIndexId;
  }, [matches]);
  const agencyGuardByCardId = useMemo(
    () =>
      new Map(
        visibleCards.map((card) => [
          card.id,
          getDashboardAgencyGuard(card, cards),
        ]),
      ),
    [cards, visibleCards],
  );
  const nextReminderByAgentMatchId = useMemo(() => {
    const remindersByAgentMatchId = new Map<string, QueryReminder[]>();

    for (const reminder of remindersQuery.data ?? []) {
      const reminders = remindersByAgentMatchId.get(reminder.agentMatchId) ?? [];
      reminders.push(reminder);
      remindersByAgentMatchId.set(reminder.agentMatchId, reminders);
    }

    return new Map(
      Array.from(remindersByAgentMatchId, ([agentMatchId, reminders]) => [
        agentMatchId,
        getNextScheduledReminder(reminders),
      ]),
    );
  }, [remindersQuery.data]);
  const persistedRows = useMemo(
    () =>
      visibleCards.map((card) =>
        mapCardToRow(
          card,
          wqhProfileLinkByIndexId,
          availableAgentIds,
          agencyGuardByCardId.get(card.id) ??
            getDashboardAgencyGuard(card, cards),
          nextReminderByAgentMatchId.get(card.id) ?? null,
        ),
      ),
    [
      agencyGuardByCardId,
      availableAgentIds,
      cards,
      nextReminderByAgentMatchId,
      visibleCards,
      wqhProfileLinkByIndexId,
    ],
  );
  const displayedPersistedRows = useMemo(() => {
    const filteredRows = persistedRows.filter((row) => {
      if (
        queryRoundsEnabled &&
        !matchesQueryRoundFilter(row, queryRoundFilter)
      ) {
        return false;
      }
      if (!manualRemindersEnabled || reminderFilter === "all") return true;
      if (!row.nextReminder) return false;
      return getReminderUrgency(row.nextReminder) === reminderFilter;
    });
    const roundSort = sortColumns.find((column) => column.columnKey === "queryRound");
    const reminderSort = sortColumns.find(
      (column) => column.columnKey === REMINDER_COLUMN_KEY,
    );

    if (roundSort) return sortByQueryRound(filteredRows, roundSort.direction);
    if (!reminderSort) return filteredRows;

    return filteredRows.toSorted((left, right) => {
      if (!left.nextReminder && !right.nextReminder) return 0;
      if (!left.nextReminder) return 1;
      if (!right.nextReminder) return -1;
      const dateOrder = left.nextReminder.dueOn.localeCompare(
        right.nextReminder.dueOn,
      );
      return reminderSort.direction === "ASC" ? dateOrder : -dateOrder;
    });
  }, [
    manualRemindersEnabled,
    persistedRows,
    queryRoundFilter,
    queryRoundsEnabled,
    reminderFilter,
    sortColumns,
  ]);
  const placeholderCount = useMemo(() => {
    const visibleRowCapacity = Math.max(
      MIN_PLACEHOLDER_ROWS,
      Math.ceil(Math.max(0, gridHeight - HEADER_ROW_HEIGHT) / ROW_HEIGHT),
    );
    return Math.max(
      MIN_PLACEHOLDER_ROWS,
      visibleRowCapacity - displayedPersistedRows.length + MIN_PLACEHOLDER_ROWS,
    );
  }, [displayedPersistedRows.length, gridHeight]);
  const placeholderRows = useMemo(
    () =>
      Array.from({ length: placeholderCount }, (_, index) =>
        createPlaceholderRow(index),
      ),
    [placeholderCount],
  );
  const rows = useMemo(
    () => [...displayedPersistedRows, ...placeholderRows],
    [displayedPersistedRows, placeholderRows],
  );
  const watchIdentities = useMemo(
    () =>
      persistedRows.map((row) => ({
        agentProfileId: null,
        indexId: row.index_id,
      })),
    [persistedRows],
  );
  const persistedRowIds = useMemo(
    () => new Set(displayedPersistedRows.map((row) => row.id)),
    [displayedPersistedRows],
  );
  const selectedPersistedRows = useMemo(
    () =>
      displayedPersistedRows.filter((row) => selectedRows.has(row.id)),
    [displayedPersistedRows, selectedRows],
  );
  const handleMessageRow = useCallback(
    (row: DashboardTableRow, shareManuscript: boolean) => {
      if (row.messageThreadId) {
        const threadHref = getProjectMessageThreadHref(
          row.writerProjectId ?? row.projectName,
          row.messageThreadId,
        );
        router.push(
          shareManuscript ? `${threadHref}?shareManuscript=1` : threadHref,
        );
        return;
      }

      if (!row.isMessagingAvailable) return;

      const href = getSavedAgentComposeMessageHref({
        indexId: row.index_id,
        projectName: row.projectName,
        writerProjectId: row.writerProjectId,
      });

      if (href) {
        router.push(href);
      }
    },
    [router],
  );

  useEffect(() => {
    const element = gridFrameRef.current;
    if (!element) return;

    const updateHeight = () => {
      setGridHeight(element.getBoundingClientRect().height);
    };
    const resizeObserver = new ResizeObserver(updateHeight);

    updateHeight();
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setSelectedRows((currentSelectedRows) => {
      const nextSelectedRows = new Set<string>();
      for (const rowId of currentSelectedRows) {
        if (persistedRowIds.has(rowId)) {
          nextSelectedRows.add(rowId);
        }
      }
      return nextSelectedRows.size === currentSelectedRows.size
        ? currentSelectedRows
        : nextSelectedRows;
    });
  }, [persistedRowIds]);

  useEffect(() => {
    if (!pendingFocusRowId) return;

    const rowIdx = rows.findIndex((row) => row.id === pendingFocusRowId);
    if (rowIdx < 0) return;

    window.requestAnimationFrame(() => {
      gridRef.current?.scrollToCell({ rowIdx, idx: 1 });
      gridRef.current?.selectCell({ rowIdx, idx: 1 }, true);
      setPendingFocusRowId(null);
    });
  }, [pendingFocusRowId, rows]);

  const columns = useMemo<readonly Column<DashboardTableRow>[]>(
    () => {
      const availableColumns: Column<DashboardTableRow>[] = [
      {
        ...SelectColumn,
        frozen: true,
      },
      {
        key: MESSAGE_ACTION_COLUMN_KEY,
        name: "Query",
        frozen: true,
        resizable: false,
        width: 150,
        renderCell: ({ row }) => (
          <MessageActionCell onMessage={handleMessageRow} row={row} />
        ),
      },
      {
        key: RADAR_COLUMN_KEY,
        name: "Radar",
        frozen: true,
        resizable: false,
        width: 86,
        renderCell: ({ row }) => <RadarWatchCell row={row} />,
      },
      {
        key: "trackingMode",
        name: "Tracking",
        frozen: true,
        resizable: true,
        width: 210,
        renderCell: ({ row }) => <TrackingCell row={row} />,
      },
      {
        key: REMINDER_COLUMN_KEY,
        name: "Reminder",
        resizable: true,
        sortable: true,
        width: 210,
        renderCell: ({ row }) => <ReminderCell row={row} />,
      },
      {
        key: "name",
        name: getProjectDashboardExportColumnHeader("name"),
        frozen: true,
        resizable: true,
        width: 220,
        renderCell: ({ row }) => (
          <span className="flex min-w-0 items-center gap-2">
            <span className="block min-w-0 truncate font-semibold capitalize">
              {row.name}
            </span>
            {agencyHistoryEnabled && row.agencyGuard ? (
              <AgencyGuardBadge compact guard={row.agencyGuard} />
            ) : null}
          </span>
        ),
        renderEditCell: textEditor,
      },
      {
        key: "fitRating",
        name: getProjectDashboardExportColumnHeader("fitRating"),
        resizable: true,
        width: 150,
        renderCell: ({ row }) =>
          row.isPlaceholder ? null : <FitRatingBadge rating={row.fitRating} />,
        renderEditCell: FitRatingEditor,
      },
      {
        key: "queryRound",
        name: "Round",
        editable: (row) => !row.isPlaceholder,
        resizable: true,
        sortable: true,
        width: 145,
        renderCell: ({ row }) =>
          row.isPlaceholder ? null : (
            <QueryRoundBadge
              queryOnHold={row.queryOnHold}
              queryRound={row.queryRound}
            />
          ),
        renderEditCell: QueryRoundEditor,
      },
      {
        key: "agency_url",
        name: getProjectDashboardExportColumnHeader("agency_url"),
        resizable: true,
        width: 210,
        renderCell: ({ row }) => <LinkCell value={row.agency_url} />,
        renderEditCell: textEditor,
      },
      {
        key: "wqh_profile_link",
        name: getProjectDashboardExportColumnHeader("wqh_profile_link"),
        resizable: true,
        width: 180,
        renderCell: ({ row }) => (
          <WqhProfileLinkCell value={row.wqh_profile_link} />
        ),
      },
      {
        key: "query_tracker",
        name: getProjectDashboardExportColumnHeader("query_tracker"),
        resizable: true,
        width: 210,
        renderCell: ({ row }) => <LinkCell value={row.query_tracker} />,
        renderEditCell: textEditor,
      },
      {
        key: "pub_marketplace",
        name: getProjectDashboardExportColumnHeader("pub_marketplace"),
        resizable: true,
        width: 220,
        renderCell: ({ row }) => <LinkCell value={row.pub_marketplace} />,
        renderEditCell: textEditor,
      },
      {
        key: "email",
        name: getProjectDashboardExportColumnHeader("email"),
        resizable: true,
        width: 240,
        renderCell: ({ row }) => <TextCell value={row.email} />,
        renderEditCell: textEditor,
      },
      {
        key: "query_sent_date",
        name: getProjectDashboardExportColumnHeader("query_sent_date"),
        editable: (row) =>
          row.trackingMode !== "live" && !row.lifecycleSyncUnavailable,
        resizable: true,
        width: 140,
        renderCell: ({ row }) => <TextCell value={row.query_sent_date} />,
        renderEditCell: DateEditor,
      },
      {
        key: "pages_requested_date",
        name: getProjectDashboardExportColumnHeader("pages_requested_date"),
        editable: (row) =>
          row.trackingMode !== "live" && !row.lifecycleSyncUnavailable,
        resizable: true,
        width: 165,
        renderCell: ({ row }) => <TextCell value={row.pages_requested_date} />,
        renderEditCell: DateEditor,
      },
      {
        key: "rejected_date",
        name: getProjectDashboardExportColumnHeader("rejected_date"),
        editable: (row) =>
          row.trackingMode !== "live" && !row.lifecycleSyncUnavailable,
        resizable: true,
        width: 135,
        renderCell: ({ row }) => <TextCell value={row.rejected_date} />,
        renderEditCell: DateEditor,
      },
      {
        key: "offer_date",
        name: getProjectDashboardExportColumnHeader("offer_date"),
        editable: (row) =>
          row.trackingMode !== "live" && !row.lifecycleSyncUnavailable,
        resizable: true,
        width: 130,
        renderCell: ({ row }) => <TextCell value={row.offer_date} />,
        renderEditCell: DateEditor,
      },
      {
        key: "notes",
        name: getProjectDashboardExportColumnHeader("notes"),
        resizable: true,
        width: 320,
        renderCell: ({ row }) => <TextCell value={row.notes} />,
        renderEditCell: textEditor,
      },
      ];

      return availableColumns.filter((column) => {
        if (column.key === "queryRound") return queryRoundsEnabled;
        if (column.key === REMINDER_COLUMN_KEY) return manualRemindersEnabled;
        return true;
      });
    },
    [
      agencyHistoryEnabled,
      handleMessageRow,
      manualRemindersEnabled,
      queryRoundsEnabled,
    ],
  );
  const handleRowsChange = useCallback(
    (
      nextRows: DashboardTableRow[],
      data: { indexes: number[]; column: { key: string } },
    ) => {
      for (const index of data.indexes) {
        const nextRow = nextRows[index];
        const previousRow = rows.find((row) => row.id === nextRow?.id);
        if (!nextRow || !previousRow) continue;

        if (data.column.key === "queryRound") {
          if (
            !previousRow.isPlaceholder &&
            !isSameQueryRoundState(previousRow, nextRow)
          ) {
            setQueryRound(
              nextRow.cardId,
              getQueryRoundSelection(nextRow),
              "table",
            );
          }
          continue;
        }

        const update = buildCardUpdate(data.column.key, previousRow, nextRow);
        if (!update) continue;

        if (previousRow.isPlaceholder) {
          void createManualRow(update);
        } else {
          updateCardFields(nextRow.cardId, update);
        }
      }
    },
    [createManualRow, rows, setQueryRound, updateCardFields],
  );
  const handleAddRow = useCallback(async () => {
    setIsCreatingRow(true);
    try {
      const createdCard = await createManualRow();
      if (createdCard) {
        setPendingFocusRowId(createdCard.id);
      }
    } finally {
      setIsCreatingRow(false);
    }
  }, [createManualRow]);
  const handleDownloadSpreadsheet = useCallback(async () => {
    setIsExportingRows(true);

    try {
      const response = await fetch("/api/project-dashboard/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: activeProjectName,
          rows: persistedRows,
        }),
      });

      if (!response.ok) {
        throw new Error(await getDownloadErrorMessage(response));
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = getFilenameFromContentDisposition(
        response.headers.get("content-disposition"),
        getProjectDashboardExportFilename(activeProjectName),
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 0);

      toast.success("Spreadsheet downloaded", {
        description: `${persistedRows.length} row${
          persistedRows.length === 1 ? "" : "s"
        } exported.`,
      });
    } catch (error) {
      toast.error("Failed to download spreadsheet", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsExportingRows(false);
    }
  }, [activeProjectName, persistedRows]);
  const handleRemoveSelectedRows = useCallback(async () => {
    const recordIds = selectedPersistedRows.map((row) => row.id);

    if (recordIds.length === 0) return;

    setIsRemovingRows(true);
    try {
      const { deletedRecordIds } = await removeRowsByRecordIds(recordIds);
      const deletedRecordIdSet = new Set(deletedRecordIds);

      setSelectedRows((currentSelectedRows) => {
        const nextSelectedRows = new Set(currentSelectedRows);
        for (const row of selectedPersistedRows) {
          if (deletedRecordIdSet.has(row.id)) {
            nextSelectedRows.delete(row.id);
          }
        }
        return nextSelectedRows;
      });
    } finally {
      setIsRemovingRows(false);
    }
  }, [removeRowsByRecordIds, selectedPersistedRows]);

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center text-sm font-medium text-accent/60">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="query-dashboard-table-shell">
      <div className="query-dashboard-table-toolbar">
        <div className="min-w-0 text-xs font-medium text-accent/60">
          {displayedPersistedRows.length}
          {queryRoundFilter === "all" ? "" : ` of ${persistedRows.length}`} row
          {displayedPersistedRows.length === 1 ? "" : "s"}
          {selectedPersistedRows.length > 0
            ? `, ${selectedPersistedRows.length} selected`
            : ""}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            disabled={isExportingRows || persistedRows.length === 0}
            size="sm"
            type="button"
            variant="secondary"
            onClick={handleDownloadSpreadsheet}
          >
            {isExportingRows ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Download data-icon="inline-start" />
            )}
            {isExportingRows ? "Downloading..." : "Download Spreadsheet"}
          </Button>
          <Button
            disabled={isCreatingRow}
            size="sm"
            type="button"
            variant="secondary"
            onClick={handleAddRow}
          >
            <Plus data-icon="inline-start" />
            Add Row
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={selectedPersistedRows.length === 0 || isRemovingRows}
                size="sm"
                type="button"
                variant="outline"
              >
                <Trash2 data-icon="inline-start" />
                Remove Rows
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove selected rows?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove {selectedPersistedRows.length} selected
                  dashboard row
                  {selectedPersistedRows.length === 1 ? "" : "s"}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white hover:bg-gray-100">
                  Back
                </AlertDialogCancel>
                <AlertDialogAction
                  className="border-1 border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white"
                  disabled={isRemovingRows}
                  onClick={handleRemoveSelectedRows}
                >
                  {isRemovingRows ? "Removing..." : "Remove Rows"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {queryRoundsEnabled ? (
        <div
          aria-label="Filter table by Query Round"
          className="flex max-w-full items-center gap-1.5 overflow-x-auto px-1 pb-2 scrollbar-transparent"
          role="group"
        >
        {(["all", ...QUERY_ROUND_SELECTIONS] as const).map((filter) => {
          const selected = queryRoundFilter === filter;
          const label =
            filter === "all" ? "All" : QUERY_ROUND_LABELS[filter];

          return (
            <button
              key={filter}
              aria-pressed={selected}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
                selected
                  ? "border-accent bg-accent text-white"
                  : "border-accent/12 bg-white/80 text-accent hover:bg-accent/8",
              )}
              onClick={() => setQueryRoundFilter(filter)}
              type="button"
            >
              {label}
            </button>
          );
        })}
        </div>
      ) : null}
      {manualRemindersEnabled ? (
        <div
          aria-label="Filter table by reminder status"
          className="flex max-w-full items-center gap-1.5 overflow-x-auto px-1 pb-2 scrollbar-transparent"
          role="group"
        >
        {(["all", "due", "overdue"] as const).map((filter) => {
          const selected = reminderFilter === filter;
          const label =
            filter === "all"
              ? "All reminders"
              : filter === "due"
                ? "Due today"
                : "Overdue";

          return (
            <button
              key={filter}
              aria-pressed={selected}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
                selected
                  ? "border-accent bg-accent text-white"
                  : "border-accent/12 bg-white/80 text-accent hover:bg-accent/8",
              )}
              onClick={() => setReminderFilter(filter)}
              type="button"
            >
              {label}
            </button>
          );
        })}
        </div>
      ) : null}
      <div className="query-dashboard-table-grid-frame" ref={gridFrameRef}>
        <AgentWatchLookupProvider identities={watchIdentities}>
          <DataGrid
          ref={gridRef}
          aria-label="Project query tracking table"
          className={cn("rdg-light query-dashboard-table-grid")}
          columns={columns}
          defaultColumnOptions={{ resizable: true }}
          headerRowHeight={HEADER_ROW_HEIGHT}
          isRowSelectionDisabled={(row) => row.isPlaceholder}
          rowClass={(row) =>
            row.isPlaceholder ? "query-dashboard-placeholder-row" : undefined
          }
          rowHeight={ROW_HEIGHT}
          rowKeyGetter={rowKeyGetter}
          rows={rows}
          selectedRows={selectedRows}
          sortColumns={sortColumns}
          onFill={({ columnKey, sourceRow, targetRow }) =>
            targetRow.isPlaceholder ||
            columnKey === "trackingMode" ||
            (targetRow.trackingMode === "live" &&
              DATE_COLUMN_KEYS.has(columnKey as keyof DashboardTableRow)) ||
            (targetRow.lifecycleSyncUnavailable &&
              DATE_COLUMN_KEYS.has(columnKey as keyof DashboardTableRow)) ||
            columnKey === "wqh_profile_link" ||
            columnKey === "queryRound" ||
            columnKey === REMINDER_COLUMN_KEY ||
            columnKey === RADAR_COLUMN_KEY ||
            columnKey === MESSAGE_ACTION_COLUMN_KEY
              ? targetRow
              : {
                  ...targetRow,
                  [columnKey]: sourceRow[columnKey as EditableTableKey],
                }
          }
          onPaste={({
            sourceColumnKey,
            sourceRow,
            targetColumnKey,
            targetRow,
          }) =>
            targetColumnKey === "wqh_profile_link" ||
            targetColumnKey === "trackingMode" ||
            targetColumnKey === "queryRound" ||
            targetColumnKey === REMINDER_COLUMN_KEY ||
            targetColumnKey === RADAR_COLUMN_KEY ||
            sourceColumnKey === "queryRound" ||
            sourceColumnKey === "trackingMode" ||
            sourceColumnKey === REMINDER_COLUMN_KEY ||
            sourceColumnKey === RADAR_COLUMN_KEY ||
            (targetRow.trackingMode === "live" &&
              DATE_COLUMN_KEYS.has(
                targetColumnKey as keyof DashboardTableRow,
              )) ||
            (targetRow.lifecycleSyncUnavailable &&
              DATE_COLUMN_KEYS.has(
                targetColumnKey as keyof DashboardTableRow,
              )) ||
            targetColumnKey === MESSAGE_ACTION_COLUMN_KEY ||
            sourceColumnKey === MESSAGE_ACTION_COLUMN_KEY
              ? targetRow
              : {
                  ...targetRow,
                  [targetColumnKey]:
                    sourceRow[sourceColumnKey as EditableTableKey],
                }
          }
          onRowsChange={handleRowsChange}
          onSelectedRowsChange={setSelectedRows}
          onSortColumnsChange={setSortColumns}
          />
        </AgentWatchLookupProvider>
      </div>
    </div>
  );
}
