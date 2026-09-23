import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/app/api/supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";
import * as records from "@/app/api/agent-match-records/[id]/route";

type Context = { params: Promise<{ id: string }> };
// Legacy agent-ID requests remain valid only when they identify one saved row.
async function forward(
  req: Request,
  context: Context,
  method: "GET" | "PATCH" | "DELETE",
) {
  const { userId } = await auth();
  const headers = { "Cache-Control": "private, no-store", Deprecation: "true" };
  if (!userId)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers },
    );
  const { id } = await context.params;
  const { data, error } = await createServerSupabase()
    .from(AGENT_MATCHES_TABLE)
    .select("id")
    .eq("index_id", id)
    .eq("user_id", userId)
    .limit(2);
  if (error)
    return NextResponse.json(
      { error: "Unable to load saved agent" },
      { status: 500, headers },
    );
  if (!data?.length)
    return NextResponse.json(
      { error: "Saved agent not found" },
      { status: 404, headers },
    );
  if (data.length !== 1)
    return NextResponse.json(
      { error: "Use a saved record ID to select a project" },
      { status: 409, headers },
    );
  const response = await records[method](req, {
    params: Promise.resolve({ id: String(data[0].id) }),
  });
  response.headers.set("Deprecation", "true");
  return response;
}
export async function GET(req: Request, context: Context) {
  return forward(req, context, "GET");
}
export async function PATCH(req: Request, context: Context) {
  return forward(req, context, "PATCH");
}
export async function DELETE(req: Request, context: Context) {
  return forward(req, context, "DELETE");
}
