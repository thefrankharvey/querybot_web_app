import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "../supabase/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("agent_matches")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

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
  // Expecting single agent or array of agents:
  // { name, email?, agency?, agency_url?, index_id?, query_tracker?, pub_marketplace?, match_score? }

  // Accept single or array payload
  const agents = Array.isArray(body) ? body : [body];
  const insertPayloads = agents.map((agent) => ({
    ...agent,
    user_id: userId,
  }));

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("agent_matches")
    .insert(insertPayloads)
    .select("*"); // return inserted rows

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ created: data }, { status: 201 });
}
