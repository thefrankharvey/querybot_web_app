import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "../../supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { oldName?: unknown; newName?: unknown };

  if (typeof body.oldName !== "string" || typeof body.newName !== "string") {
    return NextResponse.json(
      { error: "Invalid payload: oldName and newName must be strings" },
      { status: 400 },
    );
  }

  const oldName = body.oldName.trim();
  const newName = body.newName.trim();

  if (!newName) {
    return NextResponse.json(
      { error: "newName must not be empty" },
      { status: 400 },
    );
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .update({ project_name: newName })
    .eq("user_id", userId)
    .eq("project_name", oldName)
    .select("id");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ updated: data?.length ?? 0 });
}
