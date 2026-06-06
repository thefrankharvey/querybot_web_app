import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "../../supabase/server";
import { AGENT_MATCHES_TABLE, DEFAULT_PROJECT_NAME } from "@/app/constants";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { data: nullProjectRows, error: nullProjectError } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .update({ project_name: DEFAULT_PROJECT_NAME })
    .eq("user_id", userId)
    .is("project_name", null)
    .select("id");

  if (nullProjectError)
    return NextResponse.json({ error: nullProjectError.message }, { status: 400 });

  const { data: blankProjectRows, error: blankProjectError } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .update({ project_name: DEFAULT_PROJECT_NAME })
    .eq("user_id", userId)
    .eq("project_name", "")
    .select("id");

  if (blankProjectError)
    return NextResponse.json({ error: blankProjectError.message }, { status: 400 });

  return NextResponse.json({
    updated: (nullProjectRows?.length ?? 0) + (blankProjectRows?.length ?? 0),
  });
}
