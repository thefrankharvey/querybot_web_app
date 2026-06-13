import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "../../supabase/server";
import { AGENT_MATCHES_TABLE, DEFAULT_PROJECT_NAME } from "@/app/constants";

type DeletedAgentMatch = {
  id: string;
  index_id: string | null;
};

function normalizeProjectName(projectName?: string | null) {
  const trimmed = projectName?.trim();
  return trimmed || DEFAULT_PROJECT_NAME;
}

async function parseDeleteProjectBody(req: Request) {
  try {
    return (await req.json()) as { projectName?: unknown };
  } catch {
    return null;
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseDeleteProjectBody(req);

  if (!body || typeof body.projectName !== "string") {
    return NextResponse.json(
      { error: "Invalid payload: projectName must be a string" },
      { status: 400 },
    );
  }

  const projectName = normalizeProjectName(body.projectName);
  const supabase = createServerSupabase();
  const deletedAgentMatches: DeletedAgentMatch[] = [];

  const deleteProjectNameRows = async (projectNames: string[]) => {
    const { data, error } = await supabase
      .from(AGENT_MATCHES_TABLE)
      .delete()
      .eq("user_id", userId)
      .in("project_name", projectNames)
      .select("id,index_id");

    if (error) {
      throw error;
    }

    deletedAgentMatches.push(...(data ?? []));
  };

  try {
    if (projectName === DEFAULT_PROJECT_NAME) {
      await deleteProjectNameRows([DEFAULT_PROJECT_NAME, ""]);

      const { data, error } = await supabase
        .from(AGENT_MATCHES_TABLE)
        .delete()
        .eq("user_id", userId)
        .is("project_name", null)
        .select("id,index_id");

      if (error) {
        throw error;
      }

      deletedAgentMatches.push(...(data ?? []));
    } else {
      await deleteProjectNameRows([projectName]);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete project",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    deleted: deletedAgentMatches.length,
    deletedAgents: deletedAgentMatches,
  });
}
