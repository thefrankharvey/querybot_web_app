"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  AgencyGuardInput,
  AgencyGuardServiceResult,
} from "@/app/utils/query-safety/agency-guard";

export class AgencyGuardClientError extends Error {
  code: string;
  status: number;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "AgencyGuardClientError";
    this.status = status;
    this.code = code;
  }
}

async function fetchAgencyGuard(input: AgencyGuardInput) {
  const response = await fetch("/api/query-safety/agency-guard", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = (await response.json().catch(() => null)) as
    | (AgencyGuardServiceResult & { code?: string; error?: string })
    | null;

  if (!response.ok || !body) {
    throw new AgencyGuardClientError(
      body?.error || "Agency query history is temporarily unavailable.",
      response.status || 500,
      body?.code || "AGENCY_GUARD_UNAVAILABLE",
    );
  }

  return body;
}

export function useAgencyGuard(
  input: AgencyGuardInput,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: [
      "query-safety",
      "agency-guard",
      input.candidateRecordId ?? null,
      input.candidateIndexId ?? null,
      input.writerProjectId ?? null,
      input.projectName ?? null,
      input.includeAllProjects === true,
    ],
    queryFn: () => fetchAgencyGuard(input),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
