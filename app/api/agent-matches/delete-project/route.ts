import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createServerSupabase } from "../../supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";
import { getProjectScope } from "@/app/utils/project-scope";

type SavedAgentProjectRow = {
  id: string;
  index_id: string | null;
  project_name: string | null;
  writer_project_id: string | null;
};

async function parseDeleteProjectBody(req: Request) {
  try {
    return (await req.json()) as {
      projectName?: unknown;
      writerProjectId?: unknown;
    };
  } catch {
    return null;
  }
}

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const body = await parseDeleteProjectBody(req);

  if (!body || typeof body.projectName !== "string") {
    return jsonResponse(
      { error: "Invalid payload: projectName must be a string" },
      400,
    );
  }

  if (
    body.writerProjectId !== undefined &&
    body.writerProjectId !== null &&
    typeof body.writerProjectId !== "string"
  ) {
    return jsonResponse(
      { error: "Invalid payload: writerProjectId must be a string or null" },
      400,
    );
  }

  const targetScope = getProjectScope({
    projectName: body.projectName,
    writerProjectId:
      typeof body.writerProjectId === "string" ? body.writerProjectId : null,
  });
  const supabase = createServerSupabase();
  const { data: candidateRows, error: candidateError } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .select("id,index_id,project_name,writer_project_id")
    .eq("user_id", userId);

  if (candidateError) {
    return jsonResponse({ error: candidateError.message }, 400);
  }

  const matchingRows = ((candidateRows ?? []) as SavedAgentProjectRow[]).filter(
    (row) =>
      getProjectScope({
        projectName: row.project_name,
        writerProjectId: row.writer_project_id,
      }).key === targetScope.key,
  );
  const rowIds = matchingRows.map((row) => row.id);

  if (rowIds.length === 0) {
    return jsonResponse({ deleted: 0, deletedAgents: [] });
  }

  const { data: deletedRows, error: deleteError } = await supabase
    .from(AGENT_MATCHES_TABLE)
    .delete()
    .eq("user_id", userId)
    .in("id", rowIds)
    .select("id,index_id");

  if (deleteError) {
    return jsonResponse({ error: deleteError.message }, 400);
  }

  return jsonResponse({
    deleted: deletedRows?.length ?? 0,
    deletedAgents: deletedRows ?? [],
  });
}
