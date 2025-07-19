"use client";

import { useAgentMatches, FormData } from "../../context/agent-matches-context";
import { useMutation } from "@tanstack/react-query";
import { QUERY_LIMIT } from "../../constants";
import AgentMatchesInner from "./agent-matches-inner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../ui-primitives/pagination";
// import TypeForm from "../../components/type-form";
import { json2csv } from "json-2-csv";
import { formatMatchesForCSV } from "@/app/utils";

export const AgentMatchesFull = () => {
  const {
    matches,
    formData,
    saveMatches,
    nextCursorCount,
    saveNextCursor,
    currentCursor,
    saveCurrentCursor,
  } = useAgentMatches();
  const nextCursor = nextCursorCount || QUERY_LIMIT;

  const queryMutation = useMutation({
    mutationFn: async (params: { formData: FormData; nextCursor: number }) => {
      const res = await fetch(`/api/query?last_index=${params.nextCursor}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params.formData),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data = await res.json();
      return data;
    },

    onSuccess: (data) => {
      if (data.matches.length > 0) {
        saveMatches(data.matches);
        if (data.next_cursor !== null) {
          saveNextCursor(data.next_cursor);
        }
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleNextPage = () => {
    if (formData) {
      saveCurrentCursor(nextCursor);
      queryMutation.mutate({
        formData,
        nextCursor: nextCursor,
      });
    }
    window.scrollTo({ top: 0 });
  };

  const handlePreviousPage = () => {
    if (formData) {
      const updatedCursor = currentCursor - QUERY_LIMIT;
      saveCurrentCursor(updatedCursor);
      queryMutation.mutate({
        formData,
        nextCursor: updatedCursor,
      });
    }
    window.scrollTo({ top: 0 });
  };

  const handleCSVDownload = () => {
    if (!matches || matches.length === 0) {
      return;
    }

    const formattedMatches = formatMatchesForCSV(matches);

    try {
      // Convert matches to CSV
      const csv = json2csv(formattedMatches);

      // Create a blob with the CSV data
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      // Create a download link
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `agent-matches-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  return (
    <div className="pt-12 min-h-[700px]">
      <AgentMatchesInner
        matches={matches}
        hasProPlan={true}
        handleCSVDownload={handleCSVDownload}
        isLoading={queryMutation.isPending}
      />
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePreviousPage}
              aria-disabled={currentCursor === 0}
              tabIndex={currentCursor === 0 ? -1 : 0}
              style={{
                pointerEvents: currentCursor === 0 ? "none" : "auto",
                opacity: currentCursor === 0 ? 0.5 : 1,
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={handleNextPage}
              aria-disabled={matches.length < QUERY_LIMIT}
              tabIndex={matches.length < QUERY_LIMIT ? -1 : 0}
              style={{
                pointerEvents: matches.length < QUERY_LIMIT ? "none" : "auto",
                opacity: matches.length < QUERY_LIMIT ? 0.5 : 1,
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      {/* TODO: ADD BACK WHEN WE HAVE A NEW TYPE */}
      {/* <TypeForm /> */}
    </div>
  );
};

export default AgentMatchesFull;
