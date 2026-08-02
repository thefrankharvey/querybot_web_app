import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "../../supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";

const PATCH_FIELDS = [
  "name",
  "email",
  "agency_url",
  "query_tracker",
  "pub_marketplace",
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

// Compatibility-only route. New code must mutate the saved row through
// /api/agent-match-records/[recordId], because index_id is not project-unique.
const LEGACY_ROUTE_HEADERS = {
  "Cache-Control": "private, no-store",
  Deprecation: "true",
  Warning:
    '299 - "Deprecated agent index route; use /api/agent-match-records/{recordId}"',
} as const;

function legacyJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: LEGACY_ROUTE_HEADERS,
  });
}

type PatchField = (typeof PATCH_FIELDS)[number];
type PatchPayload = Partial<Record<PatchField, unknown>>;

function sanitizePatchPayload(payload: unknown): PatchPayload | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const source = payload as Record<string, unknown>;
  const sanitized: PatchPayload = {};

  for (const field of PATCH_FIELDS) {
    if (field in source) {
      sanitized[field] = source[field];
    }
  }

  return sanitized;
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return legacyJson({ error: "Unauthorized" }, 401);
  }

  const { id } = await params;
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .delete()
    .eq("index_id", id)
    .eq("user_id", userId);

  if (error)
    return legacyJson({ error: error.message }, 400);
  return legacyJson({ ok: true });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return legacyJson({ error: "Unauthorized" }, 401);
  }

  const { id } = await params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .select("*")
    .eq("index_id", id)
    .eq("user_id", userId);

  if (error)
    return legacyJson({ error: error.message }, 400);
  return legacyJson({ agent_match: data?.[0] });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return legacyJson({ error: "Unauthorized" }, 401);
  }

  const { id } = await params;
  const body = await req.json();
  const updatePayload = sanitizePatchPayload(body);

  if (!updatePayload) {
    return legacyJson({ error: "Invalid payload: expected an object" }, 400);
  }

  if (Object.keys(updatePayload).length === 0) {
    return legacyJson({ error: "At least one updatable field is required" }, 400);
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .update(updatePayload)
    .eq("index_id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return legacyJson({ error: error.message }, 400);
  }

  return legacyJson({ updated: data });
}
