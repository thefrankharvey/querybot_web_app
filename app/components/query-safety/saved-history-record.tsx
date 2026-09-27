"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import type { AgentMatch } from "@/app/types";
import { AGENCY_HISTORY_KEY } from "@/app/hooks/use-agency-guard";
import { isDashboardProjectId } from "@/app/utils/project-dashboard-route";
import {
  classifyManualStage,
  querySentDay,
} from "@/app/utils/query-safety/agency-guard";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/ui-primitives/dialog";
import { AgencyGuard } from "./agency-guard";
export function SavedHistoryRecord({
  dashboardProjectId,
}: {
  dashboardProjectId?: string | null;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const id = params.get("record");
  const valid = !!id && isDashboardProjectId(id);
  const query = useQuery<AgentMatch>({
    queryKey: [
      AGENCY_HISTORY_KEY,
      user?.id,
      "saved-record",
      dashboardProjectId,
      id,
    ],
    enabled: valid && !!user?.id && !!dashboardProjectId,
    gcTime: 0,
    staleTime: 0,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `/api/agent-match-records/${encodeURIComponent(id!)}`,
        { cache: "no-store", signal },
      );
      if (!response.ok) throw new Error("Saved record unavailable.");
      const body = await response.json();
      if (body.agent_match?.dashboard_project_id !== dashboardProjectId)
        throw new Error("Saved record not found in this project.");
      return body.agent_match;
    },
  });
  if (!valid) return null;
  const row = query.isError ? undefined : query.data;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          const next = new URLSearchParams(params);
          next.delete("record");
          router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
            scroll: false,
          });
        }
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle>{row?.name ?? "Saved record"}</DialogTitle>
        <DialogDescription>
          {row?.project_name ?? "Your manually tracked query history"}
        </DialogDescription>
        {row ? (
          <>
            <p>{row.agency || "Agency unavailable"}</p>
            <p>Stage: {classifyManualStage(row) ?? "Research"}</p>
            <p>
              Query sent:{" "}
              {querySentDay(row.query_sent_date) ?? "No date entered"}
            </p>
            {row.notes && (
              <p className="whitespace-pre-wrap break-words">{row.notes}</p>
            )}
            <AgencyGuard
              candidate={{ dashboardProjectId, candidateRecordId: row.id }}
            />
          </>
        ) : (
          <p>
            {query.isPending ? "Loading saved record..." : query.error?.message}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
