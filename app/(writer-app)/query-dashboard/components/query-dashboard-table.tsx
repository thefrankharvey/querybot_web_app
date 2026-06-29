"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  "id" | "cardId" | "index_id"
>;

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

function mapCardToRow(card: KanbanCardData): DashboardTableRow {
  return {
    id: card.id,
    cardId: card.id,
    index_id: card.index_id ?? null,
    isPlaceholder: false,
    name: card.name ?? "",
    fitRating: card.fitRating,
    agency_url: card.agency_url ?? "",
    genres_themes: card.genres_themes ?? "",
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
    genres_themes: "",
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

  if (columnKey === "genres_themes") {
    const genres_themes = normalizeTextValue(nextRow.genres_themes);
    return genres_themes === previousRow.genres_themes ? null : { genres_themes };
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

function GenresThemesCell({ value }: { value: string }) {
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 overflow-hidden">
      {items.map((item) => (
        <span
          className="max-w-[130px] truncate rounded-full border border-accent/10 bg-white/80 px-2 py-0.5 text-xs font-medium text-accent"
          key={item}
          title={item}
        >
          {item}
        </span>
      ))}
      {value.split(",").filter(Boolean).length > items.length && (
        <span className="text-xs text-accent/58">+</span>
      )}
    </div>
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

export function QueryDashboardTable() {
  const {
    activeProjectName,
    createManualRow,
    isLoading,
    removeRowsByIndexIds,
    updateCardFields,
    visibleCards,
  } = useQueryDashContext();
  const gridRef = useRef<DataGridHandle>(null);
  const gridFrameRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState(0);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [isCreatingRow, setIsCreatingRow] = useState(false);
  const [isExportingRows, setIsExportingRows] = useState(false);
  const [isRemovingRows, setIsRemovingRows] = useState(false);
  const [pendingFocusRowId, setPendingFocusRowId] = useState<string | null>(null);
  const persistedRows = useMemo(
    () => visibleCards.map(mapCardToRow),
    [visibleCards],
  );
  const placeholderCount = useMemo(() => {
    const visibleRowCapacity = Math.max(
      MIN_PLACEHOLDER_ROWS,
      Math.ceil(Math.max(0, gridHeight - HEADER_ROW_HEIGHT) / ROW_HEIGHT)
    );
    return Math.max(
      MIN_PLACEHOLDER_ROWS,
      visibleRowCapacity - persistedRows.length + MIN_PLACEHOLDER_ROWS
    );
  }, [gridHeight, persistedRows.length]);
  const placeholderRows = useMemo(
    () =>
      Array.from({ length: placeholderCount }, (_, index) =>
        createPlaceholderRow(index)
      ),
    [placeholderCount]
  );
  const rows = useMemo(
    () => [...persistedRows, ...placeholderRows],
    [persistedRows, placeholderRows]
  );
  const persistedRowIds = useMemo(
    () => new Set(persistedRows.map((row) => row.id)),
    [persistedRows]
  );
  const selectedPersistedRows = useMemo(
    () =>
      persistedRows.filter((row) => row.index_id && selectedRows.has(row.id)),
    [persistedRows, selectedRows]
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
        frozen: true,
        resizable: true,
        width: 220,
        renderCell: ({ row }) => (
          <span className="block truncate font-semibold capitalize">
            {row.name}
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
        key: "agency_url",
        name: getProjectDashboardExportColumnHeader("agency_url"),
        resizable: true,
        width: 210,
        renderCell: ({ row }) => <LinkCell value={row.agency_url} />,
        renderEditCell: textEditor,
      },
      {
        key: "genres_themes",
        name: getProjectDashboardExportColumnHeader("genres_themes"),
        resizable: true,
        width: 280,
        renderCell: ({ row }) => (
          <GenresThemesCell value={row.genres_themes} />
        ),
        renderEditCell: textEditor,
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
    (nextRows: DashboardTableRow[], data: { indexes: number[]; column: { key: string } }) => {
      for (const index of data.indexes) {
        const nextRow = nextRows[index];
        const previousRow = rows.find((row) => row.id === nextRow?.id);
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
    const indexIds = selectedPersistedRows
      .map((row) => row.index_id)
      .filter((indexId): indexId is string => Boolean(indexId));

    if (indexIds.length === 0) return;

    setIsRemovingRows(true);
    try {
      const { deletedIndexIds } = await removeRowsByIndexIds(indexIds);
      const deletedIndexIdSet = new Set(deletedIndexIds);

      setSelectedRows((currentSelectedRows) => {
        const nextSelectedRows = new Set(currentSelectedRows);
        for (const row of selectedPersistedRows) {
          if (row.index_id && deletedIndexIdSet.has(row.index_id)) {
            nextSelectedRows.delete(row.id);
          }
        }
        return nextSelectedRows;
      });
    } finally {
      setIsRemovingRows(false);
    }
  }, [removeRowsByIndexIds, selectedPersistedRows]);

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
                disabled={
                  selectedPersistedRows.length === 0 || isRemovingRows
                }
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
      <div className="query-dashboard-table-grid-frame" ref={gridFrameRef}>
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
          onFill={({ columnKey, sourceRow, targetRow }) =>
            targetRow.isPlaceholder
              ? targetRow
              : {
                  ...targetRow,
                  [columnKey]: sourceRow[columnKey as EditableTableKey],
                }
          }
          onPaste={({ sourceColumnKey, sourceRow, targetColumnKey, targetRow }) => ({
            ...targetRow,
            [targetColumnKey]: sourceRow[sourceColumnKey as EditableTableKey],
          })}
          onRowsChange={handleRowsChange}
          onSelectedRowsChange={setSelectedRows}
        />
      </div>
    </div>
  );
}
