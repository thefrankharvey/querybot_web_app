import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/app/api/supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";

const TEXT_FIELDS = new Set([
  "name",
  "email",
  "agency_url",
  "query_tracker",
  "pub_marketplace",
  "fit_rating",
  "column_name",
  "updated_date",
  "query_sent_date",
  "pages_requested_date",
  "rejected_date",
  "offer_date",
  "notes",
]);
type Context = { params: Promise<{ id: string }> };
function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
function databaseError(error: { code?: string }) {
  return error.code === "22P02"
    ? json({ error: "Saved agent not found" }, 404)
    : json({ error: "Unable to update saved agent" }, 500);
}

export async function GET(_req: Request, { params }: Context) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const { id } = await params;
  const { data, error } = await createServerSupabase()
    .from(AGENT_MATCHES_TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return databaseError(error);
  return data
    ? json({ agent_match: data })
    : json({ error: "Saved agent not found" }, 404);
}

export async function PATCH(req: Request, { params }: Context) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Unauthorized" }, 401);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    !Object.keys(body).length
  ) {
    return json({ error: "Provide at least one editable field" }, 400);
  }
  for (const [key, value] of Object.entries(body)) {
    if (key === "query_letter_ready") {
      if (value !== null && typeof value !== "boolean")
        return json({ error: "Invalid readiness value" }, 400);
    } else if (
      !TEXT_FIELDS.has(key) ||
      (value !== null && typeof value !== "string")
    ) {
      return json({ error: `Invalid field: ${key}` }, 400);
    }
  }
  const { id } = await params;
  const { data, error } = await createServerSupabase()
    .from(AGENT_MATCHES_TABLE)
    .update(body)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error) return databaseError(error);
  return data
    ? json({ updated: data })
    : json({ error: "Saved agent not found" }, 404);
}

export async function DELETE(_req: Request, { params }: Context) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const { id } = await params;
  const { data, error } = await createServerSupabase()
    .from(AGENT_MATCHES_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
  if (error) return databaseError(error);
  return data
    ? json({ deletedRecordId: data.id })
    : json({ error: "Saved agent not found" }, 404);
}
