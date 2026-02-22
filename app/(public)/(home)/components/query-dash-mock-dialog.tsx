"use client";

import { Circle, CircleCheckBigIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/ui-primitives/dialog";
import { Button } from "@/app/ui-primitives/button";
import { StarRating } from "@/app/components/star-rating";
import type { MockCard, MockColumn } from "./query-dash-block";

interface QueryDashMockDialogProps {
  card: MockCard | null;
  columns: readonly MockColumn[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIT_CLASS: Record<MockCard["fit"], string> = {
  "Perfect Fit": "bg-[var(--fit-perfect)]",
  "Great Fit": "bg-[var(--fit-great)]",
  "Good Fit": "bg-[var(--fit-good)]",
  "Neutral Fit": "bg-[var(--fit-neutral)]",
};

const getColumnTitle = (columnId: string, columns: readonly MockColumn[]) => {
  return columns.find((column) => column.id === columnId)?.title ?? "Unknown Stage";
};

export default function QueryDashMockDialog({
  card,
  columns,
  open,
  onOpenChange,
}: QueryDashMockDialogProps) {
  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] overflow-y-auto sm:max-w-xl overflow-x-hidden bg-white max-sm:w-[calc(100vw-16px)] max-sm:max-w-none max-sm:rounded-lg gap-6"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
              {getColumnTitle(card.columnId, columns)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
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
              <DialogDescription className="text-sm">{card.agency}</DialogDescription>
            </div>
            {card.matchScore != null && (
              <div className="flex flex-col md:items-end items-start gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Match Score
                </label>
                <div className="flex items-center gap-2 text-gray-600">
                  <StarRating rateNum={card.matchScore} />
                  <span className="text-sm font-medium">{card.matchScore}</span>
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
            {card.timingLabel && (
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700">
                  Timeline
                </label>
                <span className="text-sm text-gray-600">{card.timingLabel}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <span className="text-sm text-gray-600">{card.email}</span>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap pointer-events-none">
          <Button size="sm" className="text-xs shadow-lg hover:shadow-xl w-fit">
            Query Tracker
          </Button>
          <Button size="sm" className="text-xs shadow-lg hover:shadow-xl w-fit">
            PubMarketplace
          </Button>
          <Button size="sm" className="text-xs shadow-lg hover:shadow-xl w-fit">
            Agent Profile
          </Button>
          <Button size="sm" className="text-xs shadow-lg hover:shadow-xl w-fit">
            Agency Website
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex md:flex-row flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Fit Rating</label>
              <div className="w-full md:w-[180px] rounded-md border border-accent/30 px-3 py-2 text-sm text-gray-700 bg-gray-50 pointer-events-none">
                {card.fit}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Project Name
              </label>
              <div className="w-full md:w-[330px] rounded-md border border-accent/30 px-3 py-2 text-sm text-gray-700 bg-gray-50 pointer-events-none">
                {card.project}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium">Query Letter Ready</label>
              {card.queryLetterReady ? (
                <CircleCheckBigIcon className="w-5 h-5 text-accent" />
              ) : (
                <Circle className="w-5 h-5 text-accent" />
              )}
            </div>
            <button
              type="button"
              aria-disabled="true"
              className={`h-6 w-11 rounded-full border transition-colors pointer-events-none ${
                card.queryLetterReady
                  ? "bg-accent border-accent/80"
                  : "bg-white border-accent/40"
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white border border-accent/40 transition-transform ${
                  card.queryLetterReady ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Tags</label>
          <div className="mt-1 flex flex-wrap gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${FIT_CLASS[card.fit]}`}
            >
              {card.fit}
            </span>
            <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
              {card.project}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Notes</label>
          <div className="text-sm border border-accent/30 rounded-md p-2 bg-gray-50 pointer-events-none">
            {card.notes || "No notes added."}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
