import { NextResponse } from "next/server";
import { createServerSupabase } from "../../supabase/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("agent_matches")
    .delete()
    .eq("index_id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("agent_matches")
    .select("*")
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ agent_match: data?.[0] });
}
