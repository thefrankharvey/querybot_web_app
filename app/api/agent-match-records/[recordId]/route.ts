import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createServerSupabase } from "@/app/api/supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";
import type {
  AgentMatchRecord,
  AgentMatchRecordPatch,
} from "@/app/types";
import { getProjectScope } from "@/app/utils/project-scope";
import { getQuerySafetyFeatureFlags } from "@/app/utils/query-safety/feature-flags.server";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
} as const;

const PATCH_FIELD_TO_COLUMN = {
  name: "name",
  email: "email",
  agencyUrl: "agency_url",
  queryTracker: "query_tracker",
  pubMarketplace: "pub_marketplace",
  fitRating: "fit_rating",
  genresThemes: "genres_themes",
  columnName: "column_name",
  updatedDate: "updated_date",
  querySentDate: "query_sent_date",
  pagesRequestedDate: "pages_requested_date",
  rejectedDate: "rejected_date",
  offerDate: "offer_date",
  notes: "notes",
  queryLetterReady: "query_letter_ready",
  queryRound: "query_round",
  queryOnHold: "query_on_hold",
} as const satisfies Record<keyof AgentMatchRecordPatch, string>;

const NULLABLE_STRING_FIELDS = new Set<keyof AgentMatchRecordPatch>([
  "name",
  "email",
  "agencyUrl",
  "queryTracker",
  "pubMarketplace",
  "fitRating",
  "genresThemes",
  "columnName",
  "updatedDate",
  "querySentDate",
  "pagesRequestedDate",
  "rejectedDate",
  "offerDate",
  "notes",
]);

type AgentMatchRow = Record<string, unknown>;

type PatchValidationResult =
  | { ok: true; patch: AgentMatchRecordPatch }
  | { ok: false; code: string; error: string };

function jsonResponse(
  body: unknown,
  { status = 200 }: { status?: number } = {},
) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function errorResponse(code: string, error: string, status: number) {
  return jsonResponse({ code, error }, { status });
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getRecordId(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function getNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getNullableBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function mapRecord(row: AgentMatchRow): AgentMatchRecord {
  return {
    recordId: getRecordId(row.id),
    name: getString(row.name),
    email: getNullableString(row.email),
    agency: getNullableString(row.agency),
    agencyId: getNullableString(row.agency_id),
    agencyUrl: getNullableString(row.agency_url),
    legacyAgentId: getNullableString(row.index_id),
    queryTracker: getNullableString(row.query_tracker),
    pubMarketplace: getNullableString(row.pub_marketplace),
    matchScore: getNullableNumber(row.match_score),
    fitRating: getNullableString(row.fit_rating),
    genresThemes: getNullableString(row.genres_themes),
    columnName: getNullableString(row.column_name),
    updatedDate: getNullableString(row.updated_date),
    querySentDate: getNullableString(row.query_sent_date),
    pagesRequestedDate: getNullableString(row.pages_requested_date),
    rejectedDate: getNullableString(row.rejected_date),
    offerDate: getNullableString(row.offer_date),
    notes: getNullableString(row.notes),
    queryLetterReady: getNullableBoolean(row.query_letter_ready),
    projectScope: getProjectScope({
      projectName: getNullableString(row.project_name),
      writerProjectId: getNullableString(row.writer_project_id),
    }),
    queryRound: getNullableNumber(row.query_round),
    queryOnHold: row.query_on_hold === true,
    safetyUpdatedAt: getNullableString(row.safety_updated_at),
    createdAt: getString(row.created_at),
  };
}

function validatePatchPayload(payload: unknown): PatchValidationResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      ok: false,
      code: "INVALID_PAYLOAD",
      error: "Request body must be a JSON object",
    };
  }

  const source = payload as Record<string, unknown>;
  const keys = Object.keys(source);
  const allowedKeys = new Set<string>(Object.keys(PATCH_FIELD_TO_COLUMN));
  const unknownKeys = keys.filter((key) => !allowedKeys.has(key));

  if (unknownKeys.length > 0) {
    return {
      ok: false,
      code: "INVALID_PAYLOAD",
      error: `Unknown field${unknownKeys.length === 1 ? "" : "s"}: ${unknownKeys.join(", ")}`,
    };
  }

  if (keys.length === 0) {
    return {
      ok: false,
      code: "INVALID_PAYLOAD",
      error: "At least one updatable field is required",
    };
  }

  const patch: AgentMatchRecordPatch = {};

  for (const key of keys as Array<keyof AgentMatchRecordPatch>) {
    const value = source[key];

    if (NULLABLE_STRING_FIELDS.has(key)) {
      if (value !== null && typeof value !== "string") {
        return {
          ok: false,
          code: "INVALID_PAYLOAD",
          error: `${key} must be a string or null`,
        };
      }
      Object.assign(patch, { [key]: value });
      continue;
    }

    if (key === "queryLetterReady") {
      if (value !== null && typeof value !== "boolean") {
        return {
          ok: false,
          code: "INVALID_PAYLOAD",
          error: "queryLetterReady must be a boolean or null",
        };
      }
      patch.queryLetterReady = value as boolean | null;
      continue;
    }

    if (key === "queryOnHold") {
      if (typeof value !== "boolean") {
        return {
          ok: false,
          code: "INVALID_PAYLOAD",
          error: "queryOnHold must be a boolean",
        };
      }
      patch.queryOnHold = value;
      continue;
    }

    if (key === "queryRound") {
      if (
        value !== null &&
        (typeof value !== "number" ||
          !Number.isInteger(value) ||
          value < 1 ||
          value > 9)
      ) {
        return {
          ok: false,
          code: "INVALID_QUERY_ROUND",
          error: "queryRound must be null or an integer from 1 through 9",
        };
      }
      patch.queryRound = value as number | null;
    }
  }

  return { ok: true, patch };
}

function getDatabasePatch(patch: AgentMatchRecordPatch) {
  const databasePatch: Record<string, unknown> = {};

  for (const key of Object.keys(patch) as Array<keyof AgentMatchRecordPatch>) {
    databasePatch[PATCH_FIELD_TO_COLUMN[key]] = patch[key];
  }

  if ("queryRound" in patch || "queryOnHold" in patch) {
    databasePatch.safety_updated_at = new Date().toISOString();
  }

  return databasePatch;
}

function isInvalidRecordIdError(error: { code?: string } | null) {
  return error?.code === "22P02";
}

async function getOwnedRecord(
  supabase: ReturnType<typeof createServerSupabase>,
  recordId: string,
  userId: string,
) {
  return supabase
    .from(AGENT_MATCHES_TABLE)
    .select("*")
    .eq("id", recordId)
    .eq("user_id", userId)
    .maybeSingle();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
  }

  const { recordId } = await params;
  const supabase = createServerSupabase();
  const { data, error } = await getOwnedRecord(supabase, recordId, userId);

  if (isInvalidRecordIdError(error)) {
    return errorResponse("NOT_FOUND", "Saved agent record not found", 404);
  }

  if (error) {
    return errorResponse(
      "PERSISTENCE_ERROR",
      "Unable to load saved agent record",
      500,
    );
  }

  if (!data) {
    return errorResponse("NOT_FOUND", "Saved agent record not found", 404);
  }

  return jsonResponse({ record: mapRecord(data as AgentMatchRow) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(
      "INVALID_PAYLOAD",
      "Request body must contain valid JSON",
      400,
    );
  }

  const validation = validatePatchPayload(body);
  if (!validation.ok) {
    return errorResponse(validation.code, validation.error, 400);
  }

  if (
    ("queryRound" in validation.patch || "queryOnHold" in validation.patch) &&
    !getQuerySafetyFeatureFlags().queryRounds
  ) {
    return errorResponse(
      "FEATURE_DISABLED",
      "Query Rounds are disabled",
      404,
    );
  }

  const { recordId } = await params;
  const supabase = createServerSupabase();
  const currentResult = await getOwnedRecord(supabase, recordId, userId);

  if (isInvalidRecordIdError(currentResult.error)) {
    return errorResponse("NOT_FOUND", "Saved agent record not found", 404);
  }

  if (currentResult.error) {
    return errorResponse(
      "PERSISTENCE_ERROR",
      "Unable to update saved agent record",
      500,
    );
  }

  if (!currentResult.data) {
    return errorResponse("NOT_FOUND", "Saved agent record not found", 404);
  }

  const current = currentResult.data as AgentMatchRow;
  const nextQueryRound =
    "queryRound" in validation.patch
      ? (validation.patch.queryRound ?? null)
      : getNullableNumber(current.query_round);
  const nextQueryOnHold =
    "queryOnHold" in validation.patch
      ? validation.patch.queryOnHold === true
      : current.query_on_hold === true;

  if (nextQueryOnHold && nextQueryRound !== null) {
    return errorResponse(
      "INVALID_ROUND_HOLD_STATE",
      "A saved agent cannot be on Hold and assigned to a query round",
      400,
    );
  }

  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .update(getDatabasePatch(validation.patch))
    .eq("id", recordId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (isInvalidRecordIdError(error)) {
    return errorResponse("NOT_FOUND", "Saved agent record not found", 404);
  }

  if (error) {
    return errorResponse(
      "PERSISTENCE_ERROR",
      "Unable to update saved agent record",
      500,
    );
  }

  if (!data) {
    return errorResponse("NOT_FOUND", "Saved agent record not found", 404);
  }

  return jsonResponse({ record: mapRecord(data as AgentMatchRow) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
  }

  const { recordId } = await params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .delete()
    .eq("id", recordId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (isInvalidRecordIdError(error)) {
    return errorResponse("NOT_FOUND", "Saved agent record not found", 404);
  }

  if (error) {
    return errorResponse(
      "PERSISTENCE_ERROR",
      "Unable to delete saved agent record",
      500,
    );
  }

  if (!data) {
    return errorResponse("NOT_FOUND", "Saved agent record not found", 404);
  }

  return jsonResponse({ deletedRecordId: getRecordId(data.id) });
}
