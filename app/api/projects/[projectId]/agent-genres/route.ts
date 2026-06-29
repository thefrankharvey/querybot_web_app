import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { getWqhApiUrl } from "@/lib/config";
import { getGenresThemesSummary } from "@/app/utils/agent-match-genres";

type WriterProjectAgentsResponse =
  | {
      status: "success";
      writer_project_id: string;
      agents: unknown[];
    }
  | {
      status: "error";
      message: string;
    };

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getAgentIndexId(agent: unknown) {
  if (!agent || typeof agent !== "object") return null;

  const source = agent as {
    agent_id?: unknown;
    id?: unknown;
    index_id?: unknown;
  };
  return (
    getString(source.agent_id) ||
    getString(source.index_id) ||
    getString(source.id) ||
    null
  );
}

async function getCurrentUserEmail() {
  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress?.trim();

  if (primaryEmail) {
    return primaryEmail;
  }

  return user?.emailAddresses?.[0]?.emailAddress?.trim() || null;
}

async function parseApiJson<TResponse>(
  response: Response,
): Promise<TResponse | null> {
  try {
    return (await response.json()) as TResponse;
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = await getCurrentUserEmail();

  if (!email) {
    return NextResponse.json(
      { error: "Unable to resolve current user email" },
      { status: 400 },
    );
  }

  const { projectId } = await params;
  const writerProjectId = projectId.trim();

  if (!writerProjectId) {
    return NextResponse.json(
      { error: "writer_project_id is required" },
      { status: 400 },
    );
  }

  const baseUrl = getWqhApiUrl().replace(/\/$/, "");
  const query = new URLSearchParams({
    email,
    writer_project_id: writerProjectId,
  });
  const response = await fetch(
    `${baseUrl}/get-writer-project-agents?${query.toString()}`,
    { cache: "no-store" },
  );
  const body = await parseApiJson<WriterProjectAgentsResponse>(response);

  if (!response.ok || body?.status !== "success") {
    return NextResponse.json(
      {
        error:
          body?.status === "error"
            ? body.message
            : "Failed to fetch writer project agent matches",
      },
      { status: response.status || 502 },
    );
  }

  const genresThemesByIndexId: Record<string, string> = {};

  for (const agent of body.agents) {
    const indexId = getAgentIndexId(agent);
    if (!indexId) continue;

    const summary = getGenresThemesSummary(agent as Parameters<
      typeof getGenresThemesSummary
    >[0]);
    if (summary) {
      genresThemesByIndexId[indexId] = summary;
    }
  }

  return NextResponse.json({ genresThemesByIndexId });
}
