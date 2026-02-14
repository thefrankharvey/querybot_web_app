import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "../../supabase/server";

const TABLE_NAME = "agent_matches_duplicate";
const PATCH_FIELDS = [
  "fit_rating",
  "column_name",
  "updated_date",
  "notes",
  "query_letter_ready",
  "project_name",
] as const;

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
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("index_id", id)
    .eq("user_id", userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("index_id", id)
    .eq("user_id", userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ agent_match: data?.[0] });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const updatePayload = sanitizePatchPayload(body);

  if (!updatePayload) {
    return NextResponse.json(
      { error: "Invalid payload: expected an object" },
      { status: 400 }
    );
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { error: "At least one updatable field is required" },
      { status: 400 }
    );
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updatePayload)
    .eq("index_id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ updated: data });
}
