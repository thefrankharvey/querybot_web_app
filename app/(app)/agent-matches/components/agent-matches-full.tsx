"use client";

import { useAgentMatches, FormData } from "../../context/agent-matches-context";
import { useMutation } from "@tanstack/react-query";
import { QUERY_LIMIT } from "@/app/constants";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/app/ui-primitives/pagination";
import { startSheetPolling } from "../../workers/sheet-worker-manager";
import AgentMatchesInner from "./agent-matches-inner";
import TypeForm from "@/app/components/type-form";

export const AgentMatchesFull = () => {
  const {
    matches,
    formData,
    saveMatches,
    nextCursorCount,
    saveNextCursor,
    currentCursor,
    saveCurrentCursor,
    statusFilter,
    saveStatusFilter,
    countryFilter,
    saveCountryFilter,
    sheetTaskId,
    spreadsheetUrl,
    sheetStatus,
    startSpreadsheetPolling,
    saveSpreadsheetUrl,
  } = useAgentMatches();
  const nextCursor = nextCursorCount || QUERY_LIMIT;

  const queryMutation = useMutation({
    mutationFn: async (params: {
      formData: FormData;
      nextCursor: number;
      status: string;
      country_code: string;
    }) => {
      // Map status values for API: "all" -> "", "open" -> "open", "closed" -> "closed"
      const statusParam = params.status === "all" ? "" : params.status;
      const statusQuery = statusParam ? `&status=${statusParam}` : "";

      // Map country_code values for API: "all" -> "", otherwise use the country code
      const countryParam = params.country_code === "all" ? "" : params.country_code;
      const countryQuery = countryParam ? `&country_code=${countryParam}` : "";

      const res = await fetch(
        `/api/get-agents-paid?last_index=${params.nextCursor}${statusQuery}${countryQuery}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params.formData),
        }
      );

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
        if (data.task_id) {
          startSpreadsheetPolling(data.task_id);

          startSheetPolling(
            data.task_id,
            (url) => {
              saveSpreadsheetUrl(url);
            },
            () => {
            }
          );
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
        status: statusFilter,
        country_code: countryFilter,
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
        status: statusFilter,
        country_code: countryFilter,
      });
    }
    window.scrollTo({ top: 0 });
  };

  const handleStatusChange = (newStatus: string) => {
    saveStatusFilter(newStatus);
    // Reset pagination to page 1 and trigger new query
    if (formData) {
      saveCurrentCursor(0);
      saveNextCursor(QUERY_LIMIT);
      queryMutation.mutate({
        formData,
        nextCursor: 0,
        status: newStatus,
        country_code: countryFilter,
      });
    }
    window.scrollTo({ top: 0 });
  };

  const handleCountryChange = (newCountry: string) => {
    saveCountryFilter(newCountry);
    // Reset pagination to page 1 and trigger new query
    if (formData) {
      saveCurrentCursor(0);
      saveNextCursor(QUERY_LIMIT);
      queryMutation.mutate({
        formData,
        nextCursor: 0,
        status: statusFilter,
        country_code: newCountry,
      });
    }
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <AgentMatchesInner
        matches={matches}
        isSubscribed={true}
        isLoading={queryMutation.isPending}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        countryFilter={countryFilter}
        onCountryChange={handleCountryChange}
        sheetTaskId={sheetTaskId}
        spreadsheetUrl={spreadsheetUrl}
        sheetStatus={sheetStatus}
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
      <TypeForm />
    </>
  );
};

export default AgentMatchesFull;
