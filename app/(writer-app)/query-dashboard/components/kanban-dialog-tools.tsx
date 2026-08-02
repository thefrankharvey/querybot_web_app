"use client";

import { useState } from "react";
import { Ellipsis } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui-primitives/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import type { ColumnData } from "./kanban-column";
import type { KanbanCardData } from "./kanban-card";
import { RemoveAgent } from "./remove-agent";
import { useQueryDashContext } from "../context/query-dash-context";

interface KanbanDialogToolsProps {
  currentColumnId: string;
  columns: readonly ColumnData[];
  onMoveCard: (cardId: string, columnId: string) => void;
  onOpenChange: (open: boolean) => void;
  card: KanbanCardData;
}

export function KanbanDialogTools({
  currentColumnId,
  columns,
  onMoveCard,
  onOpenChange,
  card,
}: KanbanDialogToolsProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const { removeCardByRecordId } = useQueryDashContext();

  const handleMoveCardSelect = (nextColumnId: string) => {
    if (nextColumnId === currentColumnId) return;

    onMoveCard(card.id, nextColumnId);
    setToolsOpen(false);
    requestAnimationFrame(() => onOpenChange(false));
  };

  return (
    <Popover open={toolsOpen} onOpenChange={setToolsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-1 hover:bg-accent/20 rounded mt-[-2px]"
          aria-label="Card tools"
        >
          <Ellipsis className="w-6 h-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-[250px]">
        <div className="flex flex-col gap-6 pb-2">
          {card.lifecycleSyncUnavailable ? (
            <div className="rounded-lg border border-destructive/16 bg-destructive/6 p-3">
              <p className="text-sm font-semibold text-destructive">
                Status sync paused
              </p>
              <p className="mt-1 text-xs leading-5 text-accent/72">
                Lifecycle moves are disabled until Messages reconnect. Other
                card details remain editable.
              </p>
            </div>
          ) : card.trackingMode === "live" ? (
            <div className="rounded-lg border border-accent/10 bg-accent/6 p-3">
              <p className="text-sm font-semibold text-accent">Live query</p>
              <p className="mt-1 text-xs leading-5 text-accent/62">
                This stage is synced from Messages and cannot be moved manually.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Move Card to</label>
              <Select
                value={currentColumnId}
                onValueChange={handleMoveCardSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <RemoveAgent
            recordId={card.id}
            onRemoved={(deletedRecordId) => {
              removeCardByRecordId(deletedRecordId);
              onOpenChange(false);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default KanbanDialogTools;
