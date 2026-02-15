"use client";

import { Button } from "@/app/ui-primitives/button";
import { Textarea } from "@/app/ui-primitives/textarea";
import { useState } from "react";

interface KanbanNotesProps {
    notes: string;
    setNotes: (notes: string) => void;
    saveNotes: () => void;
    cancelNotes: () => void;
}

export const KanbanNotes = ({
    notes,
    setNotes,
    saveNotes,
    cancelNotes,
}: KanbanNotesProps) => {
    const [notesActive, setNotesActive] = useState(false);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label
                    htmlFor="agent-notes"
                    className="text-sm font-semibold text-gray-700"
                >
                    Notes
                </label>
                {notes && !notesActive && (
                    <Button
                        onClick={() => setNotesActive(true)}
                        variant="default"
                        size="sm"
                    >
                        Edit
                    </Button>
                )}
                {notesActive && (
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                setNotesActive(false);
                                saveNotes();
                            }}
                            variant="default"
                            size="sm"
                        >
                            Save
                        </Button>
                        <Button
                            onClick={() => {
                                cancelNotes();
                                setNotesActive(false);
                            }}
                            variant="outline"
                            size="sm"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
            {!notes && !notesActive && (
                <div
                    onClick={() => setNotesActive(true)}
                    className="flex text-sm md:min-h-24 min-h-35 h-10 border border-accent/30 hover:border-accent/70 transition-all duration-300 rounded-md p-2 cursor-pointer"
                >
                    Add notes about this agent...
                </div>
            )}
            {notes && !notesActive && (
                <div
                    onClick={() => setNotesActive(true)}
                    className="flex text-sm md:min-h-24 min-h-35 h-10 border border-accent/30 hover:border-accent/70 transition-all duration-300 rounded-md p-2 cursor-pointer md:max-w-[526px] max-w-[324px] wrap"
                >
                    {notes}
                </div>
            )}
            {notesActive && (
                <>
                    <Textarea
                        id="agent-notes"
                        maxLength={200}
                        placeholder="Add notes about this agent..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:min-h-24 min-h-35 min-w-0 [field-sizing:fixed] resize-none border border-accent/70 rounded-md p-2 text-sm md:max-w-[526px] max-w-[324px] wrap"
                    />
                    {notes.length >= 200 && (
                        <p className="text-red-500 text-sm">max characters reached</p>
                    )}
                </>
            )}
        </div>
    );
};
