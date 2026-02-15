import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "../supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";

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
  "column_name",
  "updated_date",
  "notes",
  "query_letter_ready",
  "project_name",
] as const;

type CreateField = (typeof CREATE_FIELDS)[number];
type CreatePayload = Partial<Record<CreateField, unknown>>;

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ agent_matches: data ?? [] });
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Accept single or array payload
  const agents = Array.isArray(body) ? body : [body];
  const insertPayloads = agents.map((agent) => {
    const sanitized = sanitizeCreatePayload(agent);

    if (!sanitized) {
      return null;
    }

    return {
      ...sanitized,
      user_id: userId,
    };
  });

  if (insertPayloads.some((payload) => payload === null)) {
    return NextResponse.json(
      { error: "Invalid payload: expected an object or array of objects" },
      { status: 400 },
    );
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .insert(
      insertPayloads as Array<
        CreatePayload & {
          user_id: string;
        }
      >,
    )
    .select("*"); // return inserted rows

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ created: data }, { status: 201 });
}
