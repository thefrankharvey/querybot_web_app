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
} from "react-data-grid";
import { Download, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAgentMatches } from "@/app/(app)/context/agent-matches-context";
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
import {
  getProjectDashboardExportColumnHeader,
  getProjectDashboardExportFilename,
  type ProjectDashboardExportRow,
} from "@/app/utils/project-dashboard-export";

import type { KanbanCardData } from "./kanban-card";
import { useQueryDashContext } from "../context/query-dash-context";

type DashboardTableRow = ProjectDashboardExportRow & {
  id: string;
  cardId: string;
  index_id: string | null;
  isPlaceholder: boolean;
  fitRating: FitRating;
};

type EditableTableKey = Exclude<
  keyof DashboardTableRow,
  "id" | "cardId" | "index_id" | "isPlaceholder" | "wqh_profile_link"
>;

const WQH_PROFILE_LINK_BASE_URL = "https://writequeryhook.com";
const FIT_RATING_OPTIONS = Object.keys(FIT_RATING_CONFIG) as FitRating[];
const HEADER_ROW_HEIGHT = 42;
const ROW_HEIGHT = 44;
const MIN_PLACEHOLDER_ROWS = 8;
const PICKER_ONLY_DATE_COLUMN_KEYS = new Set<keyof DashboardTableRow>([
  "query_sent_date",
  "pages_requested_date",
  "rejected_date",
  "offer_date",
]);
const READ_ONLY_COLUMN_KEYS = new Set<keyof DashboardTableRow>([
  "name",
  "agency_url",
  "wqh_profile_link",
  "query_tracker",
  "pub_marketplace",
  "email",
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

function getLocalDateOnly(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
): DashboardTableRow {
  const indexId = card.index_id ?? null;

  return {
    id: card.id,
    cardId: card.id,
    index_id: indexId,
    isPlaceholder: false,
    name: card.name ?? "",
    fitRating: card.fitRating,
    agency_url: card.agency_url ?? "",
    wqh_profile_link: indexId
      ? (wqhProfileLinkByIndexId.get(indexId) ?? "")
      : "",
    query_tracker: card.query_tracker ?? "",
    pub_marketplace: card.pub_marketplace ?? "",
    email: card.email ?? "",
    query_sent_date:
      parseDateOnly(card.query_sent_date) ||
      getFallbackDate(card, "submitted-query"),
    pages_requested_date:
      parseDateOnly(card.pages_requested_date) ||
      getFallbackDate(card, "pages-requested"),
    rejected_date:
      parseDateOnly(card.rejected_date) || getFallbackDate(card, "rejected"),
    offer_date:
      parseDateOnly(card.offer_date) || getFallbackDate(card, "offer-made"),
    notes: card.notes ?? "",
  };
}

function createPlaceholderRow(index: number): DashboardTableRow {
  return {
    id: `placeholder:${index}`,
    cardId: "",
    index_id: null,
    isPlaceholder: true,
    name: "",
    fitRating: "neutral",
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

function showDatePicker(input: HTMLInputElement) {
  try {
    input.showPicker();
  } catch {
    // The browser can reject showPicker when user activation is unavailable.
  }
}

function buildCardUpdate(
  columnKey: string,
  previousRow: DashboardTableRow,
  nextRow: DashboardTableRow,
) {
  if (READ_ONLY_COLUMN_KEYS.has(columnKey as keyof DashboardTableRow)) {
    return null;
  }

  if (columnKey === "fitRating") {
    const fitRating = normalizeFitRating(nextRow.fitRating);
    return fitRating === previousRow.fitRating ? null : { fitRating };
  }

  if (
    PICKER_ONLY_DATE_COLUMN_KEYS.has(columnKey as keyof DashboardTableRow)
  ) {
    const key = columnKey as
      | "query_sent_date"
      | "pages_requested_date"
      | "rejected_date"
      | "offer_date";
    const dateValue = normalizeDateValue(nextRow[key]);
    return dateValue === previousRow[key] ? null : { [key]: dateValue };
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

function DateEditor({
  row,
  column,
  onRowChange,
  onClose,
}: RenderEditCellProps<DashboardTableRow>) {
  const key = column.key as keyof DashboardTableRow;
  const value = PICKER_ONLY_DATE_COLUMN_KEYS.has(key)
    ? String(row[key] ?? "")
    : "";
  const isPickerOnly = PICKER_ONLY_DATE_COLUMN_KEYS.has(key);
  const maximumDate = isPickerOnly ? getLocalDateOnly() : undefined;
  const inputRef = useCallback(
    (input: HTMLInputElement | null) => {
      if (!input || !isPickerOnly) return;

      input.focus();
      showDatePicker(input);
    },
    [isPickerOnly],
  );

  return (
    <input
      autoFocus
      className="h-full w-full border-0 bg-white px-2 text-sm text-accent outline-none"
      max={maximumDate}
      ref={inputRef}
      type="date"
      value={value}
      onBlur={() => onClose(true)}
      onChange={(event) => {
        const nextValue = event.target.value;
        if (maximumDate && nextValue > maximumDate) return;

        onRowChange({ ...row, [key]: nextValue }, true);
      }}
      onClick={(event) => {
        if (isPickerOnly) showDatePicker(event.currentTarget);
      }}
      onDrop={(event) => {
        if (isPickerOnly) event.preventDefault();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose(false);
          return;
        }

        if (isPickerOnly) {
          if (event.key !== "Tab") event.preventDefault();
          return;
        }

        if (event.key === "Enter") onClose(true);
      }}
      onPaste={(event) => {
        if (isPickerOnly) event.preventDefault();
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

export function QueryDashboardTable() {
  const { matches } = useAgentMatches();
  const {
    activeProjectName,
    createManualRow,
    isLoading,
    removeRowsByIds,
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
  const [pendingFocusRowId, setPendingFocusRowId] = useState<string | null>(
    null,
  );
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
  const persistedRows = useMemo(
    () =>
      visibleCards.map((card) =>
        mapCardToRow(card, wqhProfileLinkByIndexId),
      ),
    [visibleCards, wqhProfileLinkByIndexId],
  );
  const placeholderCount = useMemo(() => {
    const visibleRowCapacity = Math.max(
      MIN_PLACEHOLDER_ROWS,
      Math.ceil(Math.max(0, gridHeight - HEADER_ROW_HEIGHT) / ROW_HEIGHT),
    );
    return Math.max(
      MIN_PLACEHOLDER_ROWS,
      visibleRowCapacity - persistedRows.length + MIN_PLACEHOLDER_ROWS,
    );
  }, [gridHeight, persistedRows.length]);
  const placeholderRows = useMemo(
    () =>
      Array.from({ length: placeholderCount }, (_, index) =>
        createPlaceholderRow(index),
      ),
    [placeholderCount],
  );
  const rows = useMemo(
    () => [...persistedRows, ...placeholderRows],
    [persistedRows, placeholderRows],
  );
  const persistedRowIds = useMemo(
    () => new Set(persistedRows.map((row) => row.id)),
    [persistedRows],
  );
  const selectedPersistedRows = useMemo(
    () => persistedRows.filter((row) => selectedRows.has(row.id)),
    [persistedRows, selectedRows],
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
    () => [
      {
        ...SelectColumn,
        frozen: true,
      },
      {
        key: "name",
        name: getProjectDashboardExportColumnHeader("name"),
        editable: false,
        resizable: true,
        width: 220,
        renderCell: ({ row }) => (
          <span className="block truncate font-semibold capitalize">
            {row.name}
          </span>
        ),
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
        key: "agency_url",
        name: getProjectDashboardExportColumnHeader("agency_url"),
        editable: false,
        resizable: true,
        width: 210,
        renderCell: ({ row }) => <LinkCell value={row.agency_url} />,
      },
      {
        key: "wqh_profile_link",
        name: getProjectDashboardExportColumnHeader("wqh_profile_link"),
        editable: false,
        resizable: true,
        width: 180,
        renderCell: ({ row }) => (
          <WqhProfileLinkCell value={row.wqh_profile_link} />
        ),
      },
      {
        key: "query_tracker",
        name: getProjectDashboardExportColumnHeader("query_tracker"),
        editable: false,
        resizable: true,
        width: 210,
        renderCell: ({ row }) => <LinkCell value={row.query_tracker} />,
      },
      {
        key: "pub_marketplace",
        name: getProjectDashboardExportColumnHeader("pub_marketplace"),
        editable: false,
        resizable: true,
        width: 220,
        renderCell: ({ row }) => <LinkCell value={row.pub_marketplace} />,
      },
      {
        key: "email",
        name: getProjectDashboardExportColumnHeader("email"),
        editable: false,
        resizable: true,
        width: 240,
        renderCell: ({ row }) => <TextCell value={row.email} />,
      },
      {
        key: "query_sent_date",
        name: getProjectDashboardExportColumnHeader("query_sent_date"),
        resizable: true,
        width: 140,
        renderCell: ({ row }) => <TextCell value={row.query_sent_date} />,
        renderEditCell: DateEditor,
      },
      {
        key: "pages_requested_date",
        name: getProjectDashboardExportColumnHeader("pages_requested_date"),
        resizable: true,
        width: 165,
        renderCell: ({ row }) => <TextCell value={row.pages_requested_date} />,
        renderEditCell: DateEditor,
      },
      {
        key: "rejected_date",
        name: getProjectDashboardExportColumnHeader("rejected_date"),
        resizable: true,
        width: 135,
        renderCell: ({ row }) => <TextCell value={row.rejected_date} />,
        renderEditCell: DateEditor,
      },
      {
        key: "offer_date",
        name: getProjectDashboardExportColumnHeader("offer_date"),
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
    ],
    [],
  );
  const handleRowsChange = useCallback(
    (
      nextRows: DashboardTableRow[],
      data: { indexes: number[]; column: { key: string } },
    ) => {
      for (const index of data.indexes) {
        const nextRow = nextRows[index];
        const previousRow = rows[index];
        if (!nextRow || !previousRow) continue;

        const update = buildCardUpdate(data.column.key, previousRow, nextRow);
        if (!update) continue;

        if (previousRow.isPlaceholder) {
          void createManualRow(update);
        } else {
          updateCardFields(nextRow.cardId, update);
        }
      }
    },
    [createManualRow, rows, updateCardFields],
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
    const rowIds = selectedPersistedRows.map((row) => row.cardId);
    if (rowIds.length === 0) return;

    setIsRemovingRows(true);
    try {
      const { deletedRowIds } = await removeRowsByIds(rowIds);
      const deletedRowIdSet = new Set(deletedRowIds);

      setSelectedRows((currentSelectedRows) => {
        const nextSelectedRows = new Set(currentSelectedRows);
        for (const rowId of deletedRowIdSet) {
          nextSelectedRows.delete(rowId);
        }
        return nextSelectedRows;
      });
    } finally {
      setIsRemovingRows(false);
    }
  }, [removeRowsByIds, selectedPersistedRows]);

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
          {persistedRows.length} row{persistedRows.length === 1 ? "" : "s"}
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
                <AlertDialogCancel disabled={isRemovingRows}>
                  Back
                </AlertDialogCancel>
                <AlertDialogAction
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
      <div className="query-dashboard-table-grid-frame" ref={gridFrameRef}>
        <DataGrid
          ref={gridRef}
          aria-label="Project query tracking table"
          className="rdg-light query-dashboard-table-grid"
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
          onCellClick={({ column, selectCell }, event) => {
            if (
              !PICKER_ONLY_DATE_COLUMN_KEYS.has(
                column.key as keyof DashboardTableRow,
              )
            ) {
              return;
            }

            selectCell(true);
            event.preventGridDefault();
          }}
          onCellKeyDown={({ column, mode }, event) => {
            if (
              mode !== "SELECT" ||
              !PICKER_ONLY_DATE_COLUMN_KEYS.has(
                column.key as keyof DashboardTableRow,
              ) ||
              event.ctrlKey ||
              event.metaKey
            ) {
              return;
            }

            if (
              event.key.length === 1 ||
              event.key === "Backspace" ||
              event.key === "Delete" ||
              event.key === "Enter" ||
              event.key === "F2"
            ) {
              event.preventDefault();
              event.preventGridDefault();
            }
          }}
          onFill={({ columnKey, sourceRow, targetRow }) =>
            targetRow.isPlaceholder ||
            READ_ONLY_COLUMN_KEYS.has(
              columnKey as keyof DashboardTableRow,
            ) ||
            PICKER_ONLY_DATE_COLUMN_KEYS.has(
              columnKey as keyof DashboardTableRow,
            )
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
            READ_ONLY_COLUMN_KEYS.has(
              targetColumnKey as keyof DashboardTableRow,
            ) ||
            sourceColumnKey === "wqh_profile_link" ||
            PICKER_ONLY_DATE_COLUMN_KEYS.has(
              targetColumnKey as keyof DashboardTableRow,
            )
              ? targetRow
              : {
                  ...targetRow,
                  [targetColumnKey]:
                    sourceRow[sourceColumnKey as EditableTableKey],
                }
          }
          onRowsChange={handleRowsChange}
          onSelectedRowsChange={setSelectedRows}
        />
      </div>
    </div>
  );
}
