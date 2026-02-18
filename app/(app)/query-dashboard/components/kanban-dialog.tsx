"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
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
import { Circle, CircleCheckBigIcon, X } from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string): Date | null {
  const datePart = value.split("T")[0];
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function getCalendarDayDiffFromToday(date: Date): number {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((todayStart.getTime() - targetStart.getTime()) / DAY_MS);
  return Math.max(0, diffDays);
}

function formatAsMMDDYYYY(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

interface KanbanDialogProps {
  card: KanbanCardData | null;
  columns: readonly ColumnData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePrepQuery: (cardId: string) => void;
  onFitRatingChange: (cardId: string, rating: FitRating) => void;
  onProjectNameChange: (cardId: string, projectName: string) => void;
  onNotesSave: (cardId: string, notes: string) => void;
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
  onNotesSave,
  onMoveCard,
}: KanbanDialogProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || !card) return;
    setNotes(card.notes ?? "");
  }, [card, open]);

  if (!card) return null;

  const emails = formatEmail(card.email);
  const isTimingColumn =
    card.columnId === "submitted-query" || card.columnId === "pages-requested";
  const parsedUpdatedDate =
    isTimingColumn && card.updated_date ? parseDateOnly(card.updated_date) : null;
  const timingPrefix =
    card.columnId === "submitted-query"
      ? "Submitted Query"
      : card.columnId === "pages-requested"
        ? "Pages Requested"
        : null;
  const timingLabel =
    parsedUpdatedDate && timingPrefix
      ? (() => {
        const daysAgo = getCalendarDayDiffFromToday(parsedUpdatedDate);
        return daysAgo === 0
          ? `${timingPrefix} Today`
          : `${timingPrefix} ${daysAgo} ${daysAgo === 1 ? "Day" : "Days"} ago`;
      })()
      : null;
  const timingDate = parsedUpdatedDate ? formatAsMMDDYYYY(parsedUpdatedDate) : null;

  const handleSaveNotes = () => {
    onNotesSave(card.id, notes);
  };

  const handleCancelNotes = () => {
    setNotes(card.notes ?? "");
  };

  const handleCloseDialog = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto sm:max-w-xl overflow-x-hidden bg-white max-sm:w-[calc(100vw-16px)] max-sm:max-w-none max-sm:rounded-lg gap-6"
      >
        <div className="flex justify-between items-center mb-2">
          <KanbanDialogTools
            card={card}
            currentColumnId={card.columnId}
            columns={columns}
            onMoveCard={onMoveCard}
            onOpenChange={onOpenChange}
          />
          <button
            type="button"
            onClick={handleCloseDialog}
            aria-label="Close dialog"
            className="hover:bg-accent/20 rounded-sm p-1"
          >
            <X className="size-6" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="mt-[-16px]">
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
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:gap-8 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700">
                Preferred Contact Method
              </label>
              <span className="text-sm text-gray-600">Query via email</span>
            </div>
            {timingLabel && timingDate && (
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">
                  {timingLabel}
                </label>
                <span className="text-sm text-gray-600">{timingDate}</span>
              </div>
            )}
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
                className="w-full md:w-[330px] border border-accent/30 hover:border-accent/70 transition-all duration-300"
                maxLength={70}
                value={card.projectName ?? "My Project"}
                placeholder="My Project"
                onChange={(e) => onProjectNameChange(card.id, e.target.value)}
              />
              {(card.projectName ?? "My Project").length >= 70 && (
                <p className="text-red-500 text-sm">max characters reached</p>
              )}
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
        <KanbanNotes
          notes={notes}
          setNotes={setNotes}
          saveNotes={handleSaveNotes}
          cancelNotes={handleCancelNotes}
        />
      </DialogContent>
    </Dialog>
  );
}

export default KanbanDialog;
