import { NextResponse } from "next/server";
import { createServerSupabase } from "../supabase/server";

export async function GET() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("agent_matches")
    .select("*")
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ agent_matches: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  // Expecting { name, email?, agency?, agency_url?, index_id?, query_tracker?, pub_marketplace?, match_score? }
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("agent_matches")
    .insert([body])
    .select("*"); // return inserted rows

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ created: data }, { status: 201 });
}
