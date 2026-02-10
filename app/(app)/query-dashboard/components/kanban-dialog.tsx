"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/ui-primitives/dialog";
import { Switch } from "@/app/ui-primitives/switch";
import { ColumnData } from "./kanban-column";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import { StarRating } from "@/app/components/star-rating";
import CopyToClipboard from "@/app/components/copy-to-clipboard";
import { formatEmail } from "@/app/utils";
import { KanbanCardData, FitRating, FIT_RATING_CONFIG } from "./kanban-card";
import { KanbanNotes } from "./kanban-notes";
import { KanbanDialogTools } from "./kanban-dialog-tools";
import { Input } from "@/app/ui-primitives/input";
import { KanbanLinkButtons } from "./kanban-link-buttons";
import { Circle, CircleCheckBigIcon } from "lucide-react";

interface KanbanDialogProps {
  card: KanbanCardData | null;
  columns: ColumnData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePrepQuery: (cardId: string) => void;
  onFitRatingChange: (cardId: string, rating: FitRating) => void;
  onProjectNameChange: (cardId: string, projectName: string) => void;
  onMoveCard: (cardId: string, columnId: string) => void;
}

export function KanbanDialog({
  card,
  columns,
  open,
  onOpenChange,
  onTogglePrepQuery,
  onFitRatingChange,
  onProjectNameChange,
  onMoveCard,
}: KanbanDialogProps) {
  const [notes, setNotes] = useState("");

  if (!card) return null;

  const emails = formatEmail(card.email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl bg-white max-sm:w-[calc(100vw-16px)] max-sm:max-w-none max-sm:rounded-lg gap-6">
        <div className="mt-[-14px] right-12 z-10">
          <KanbanDialogTools
            card={card}
            currentColumnId={card.columnId}
            columns={columns}
            onMoveCard={onMoveCard}
            onOpenChange={onOpenChange}
          />
        </div>
        <DialogHeader className="mt-[-16px]">
          <div className="flex md:flex-row flex-col gap-6 justify-between mt-0">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl capitalize">{card.name}</DialogTitle>
              <DialogDescription className="text-sm">
                {card.agency}
              </DialogDescription>
            </div>
            {/* Match Score Section */}
            {card.match_score != null && (
              <div className="flex flex-col md:items-end items-start gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Match Score
                </label>
                <div className="flex items-center gap-2">
                  <StarRating rateNum={card.match_score} />
                  <span className="text-sm font-medium text-gray-600">
                    {card.match_score}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>


        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">
              Preferred Contact Method
            </label>
            <span className="text-sm text-gray-600">Query via email</span>
          </div>
          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            {emails && emails.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-2">
                  {emails.map((email, index) => (
                    <CopyToClipboard
                      key={index}
                      text={email}
                      className="text-sm underline"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <KanbanLinkButtons card={card} />

        <div className="flex flex-col gap-6">
          <div className="flex md:flex-row flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Fit Rating
              </label>
              <Select
                value={card.fitRating}
                onValueChange={(value: FitRating) =>
                  onFitRatingChange(card.id, value)
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FIT_RATING_CONFIG) as FitRating[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: FIT_RATING_CONFIG[key].color }}
                        />
                        {FIT_RATING_CONFIG[key].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Project Name
              </label>
              <Input
                value={card.projectName ?? "My Project"}
                placeholder="My Project"
                onChange={(e) => onProjectNameChange(card.id, e.target.value)}
              />
            </div>
          </div>

          {/* Query Letter Ready Checkbox */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <label
                className="text-sm font-medium cursor-pointer"
              >
                Query Letter Ready
              </label>
              {card.prepQueryLetterDone ? <CircleCheckBigIcon className="w-5 h-5 text-accent" /> : <Circle className="w-5 h-5 text-accent" />}
            </div>
            <Switch
              checked={card.prepQueryLetterDone}
              onCheckedChange={() => onTogglePrepQuery(card.id)}
            />
          </div>
        </div>
        {/* Notes Section */}
        <KanbanNotes notes={notes} setNotes={setNotes} saveNotes={() => { }} />
      </DialogContent>
    </Dialog>
  );
}

export default KanbanDialog;
