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
import { ColumnData } from "./kanban-column";
import { KanbanCardData } from "./kanban-card";
import { RemoveAgent } from "./remove-agent";

interface KanbanDialogToolsProps {
  currentColumnId: string;
  columns: ColumnData[];
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
          className="p-1 hover:bg-accent/20 rounded"
          aria-label="Card tools"
        >
          <Ellipsis className="w-6 h-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-[250px]">
        <div className="flex flex-col gap-6 pb-2">
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
          <RemoveAgent indexId={card.index_id} onRemoved={() => onOpenChange(false)} />
        </div>
      </PopoverContent>
    </Popover >
  );
}

export default KanbanDialogTools;
