import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  AgencyGuardServiceError,
  getAgencyGuardForUser,
} from "@/app/utils/query-safety/agency-guard.server";
import type { AgencyGuardInput } from "@/app/utils/query-safety/agency-guard";
import { getQuerySafetyFeatureFlags } from "@/app/utils/query-safety/feature-flags.server";
import { checkQuerySafetyRateLimit } from "@/app/utils/query-safety/rate-limit.server";

const INPUT_FIELDS = new Set([
  "candidateRecordId",
  "candidateAgentProfileId",
  "candidateIndexId",
  "candidateAgencyId",
  "candidateAgencyName",
  "candidateAgencyUrl",
  "projectName",
  "writerProjectId",
  "includeAllProjects",
]);

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
};

function errorResponse(error: string, status: number, code: string) {
  return NextResponse.json(
    { code, error },
    { status, headers: NO_STORE_HEADERS },
  );
}

async function readInput(req: Request): Promise<AgencyGuardInput | null> {
  let value: unknown;
  try {
    value = await req.json();
  } catch {
    return null;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  if (Object.keys(source).some((key) => !INPUT_FIELDS.has(key))) {
    return null;
  }

  const stringFields = [
    "candidateRecordId",
    "candidateAgentProfileId",
    "candidateIndexId",
    "candidateAgencyId",
    "candidateAgencyName",
    "candidateAgencyUrl",
    "projectName",
    "writerProjectId",
  ] as const;

  for (const field of stringFields) {
    if (
      source[field] !== undefined &&
      source[field] !== null &&
      typeof source[field] !== "string"
    ) {
      return null;
    }
  }

  if (
    source.includeAllProjects !== undefined &&
    typeof source.includeAllProjects !== "boolean"
  ) {
    return null;
  }

  return source as AgencyGuardInput;
}

export async function POST(req: Request) {
  if (!getQuerySafetyFeatureFlags().agencyHistory) {
    return errorResponse(
      "Agency query history is disabled.",
      404,
      "FEATURE_DISABLED",
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  const rateLimit = checkQuerySafetyRateLimit(`agency-guard:${userId}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        code: "RATE_LIMITED",
        error: "Agency history is being checked too frequently. Try again shortly.",
      },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const input = await readInput(req);
  if (!input) {
    return errorResponse(
      "Request body must contain only valid agency guard fields.",
      400,
      "INVALID_PAYLOAD",
    );
  }

  try {
    const result = await getAgencyGuardForUser({ input, userId });
    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    if (error instanceof AgencyGuardServiceError) {
      return errorResponse(error.message, error.status, error.code);
    }

    return errorResponse(
      "Agency history is temporarily unavailable.",
      503,
      "AGENCY_GUARD_UNAVAILABLE",
    );
  }
}
