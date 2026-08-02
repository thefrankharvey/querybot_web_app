import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "../supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";
import { fetchCanonicalAgencyIdentities } from "@/app/utils/agency-identity.server";

const PRIVATE_NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

const CREATE_FIELDS = [
  "name",
  "email",
  "agency",
  "agency_url",
  "index_id",
  "query_tracker",
  "pub_marketplace",
  "match_score",
  "fit_rating",
  "genres_themes",
  "column_name",
  "updated_date",
  "query_sent_date",
  "pages_requested_date",
  "rejected_date",
  "offer_date",
  "notes",
  "query_letter_ready",
  "project_name",
  "writer_project_id",
] as const;

type CreateField = (typeof CREATE_FIELDS)[number];
type CreatePayload = Partial<Record<CreateField, unknown>>;

function containsInvalidAgencyIdentityInput(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  const source = payload as Record<string, unknown>;
  return (
    "agency_id" in source ||
    ("agencyId" in source &&
      source.agencyId !== null &&
      typeof source.agencyId !== "string")
  );
}

function sanitizeCreatePayload(payload: unknown): CreatePayload | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const source = payload as Record<string, unknown>;
  const sanitized: CreatePayload = {};

  for (const field of CREATE_FIELDS) {
    if (field in source) {
      sanitized[field] = source[field];
    }
  }

  return sanitized;
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  const rows = data ?? [];
  const canonicalAgencies = await fetchCanonicalAgencyIdentities(
    rows.flatMap((row) =>
      typeof row.index_id === "string" ? [row.index_id] : [],
    ),
  );
  const enrichedRows = rows.map((row) => {
    const indexId =
      typeof row.index_id === "string" ? row.index_id.trim().toLowerCase() : "";
    const canonicalAgency = canonicalAgencies.get(indexId);

    return canonicalAgency
      ? { ...row, agency_id: canonicalAgency.agency_id }
      : row;
  });

  return NextResponse.json(
    { agent_matches: enrichedRows },
    { headers: PRIVATE_NO_STORE_HEADERS },
  );
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  const body = await req.json();

  // Accept single or array payload
  const agents = Array.isArray(body) ? body : [body];

  if (agents.some(containsInvalidAgencyIdentityInput)) {
    return NextResponse.json(
      {
        error: "Invalid payload: agencyId must be a string or null",
      },
      {
        status: 400,
        headers: PRIVATE_NO_STORE_HEADERS,
      },
    );
  }
  const sanitizedPayloads = agents.map((agent) => {
    const sanitized = sanitizeCreatePayload(agent);

    if (!sanitized) {
      return null;
    }

    return sanitized;
  });

  if (sanitizedPayloads.some((payload) => payload === null)) {
    return NextResponse.json(
      { error: "Invalid payload: expected an object or array of objects" },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }

  // `agencyId` is only a browser hint. Resolve the reviewed catalogue identity
  // from the agent ID and persist that result (or null), never the hint itself.
  const validPayloads = sanitizedPayloads as CreatePayload[];
  const canonicalAgencies = await fetchCanonicalAgencyIdentities(
    validPayloads.flatMap((payload) =>
      typeof payload.index_id === "string" ? [payload.index_id] : [],
    ),
  );
  const insertPayloads = validPayloads.map((payload) => {
    const indexId =
      typeof payload.index_id === "string" ? payload.index_id.trim() : "";

    return {
      ...payload,
      agency_id: canonicalAgencies.get(indexId.toLowerCase())?.agency_id ?? null,
      user_id: userId,
    };
  });

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .insert(
      insertPayloads as Array<
        CreatePayload & {
          agency_id: string | null;
          user_id: string;
        }
      >,
    )
    .select("*"); // return inserted rows

  if (error)
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
    );
  return NextResponse.json(
    { created: data },
    { status: 201, headers: PRIVATE_NO_STORE_HEADERS },
  );
}
