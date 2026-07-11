import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import {
  isAgentMessagingProfileAvailable,
  normalizeAgentMessagingIds,
} from "@/app/utils/agent-messaging-availability";
import { getWqhApiUrl } from "@/lib/config";

const MAX_AGENT_IDS = 50;

type AgentProfileResponse =
  | {
      status: "success";
      agent: {
        profile_id?: unknown;
        user_id?: unknown;
        is_active?: unknown;
      };
    }
  | {
      status: "error";
      message?: string;
    };

async function readAgentProfileResponse(response: Response) {
  try {
    return (await response.json()) as AgentProfileResponse;
  } catch {
    return null;
  }
}

async function isAgentAvailableForMessaging(agentId: string) {
  const externalUrl = new URL(
    `${getWqhApiUrl().replace(/\/$/, "")}/get-agent-profile`,
  );
  externalUrl.searchParams.set("lookup_by", "id");
  externalUrl.searchParams.set("value", agentId);

  const response = await fetch(externalUrl, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return false;
  }

  const body = await readAgentProfileResponse(response);

  if (!response.ok || body?.status !== "success") {
    throw new Error(
      body?.status === "error" && body.message
        ? body.message
        : "Failed to check agent messaging availability",
    );
  }

  return isAgentMessagingProfileAvailable(body.agent);
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agentIds = normalizeAgentMessagingIds(
    request.nextUrl.searchParams.getAll("agentId"),
  );

  if (agentIds.length > MAX_AGENT_IDS) {
    return NextResponse.json(
      { error: `A maximum of ${MAX_AGENT_IDS} agent IDs is allowed` },
      { status: 400 },
    );
  }

  try {
    const availability = await Promise.all(
      agentIds.map(async (agentId) => ({
        agentId,
        isAvailable: await isAgentAvailableForMessaging(agentId),
      })),
    );

    return NextResponse.json(
      {
        availableAgentIds: availability
          .filter(({ isAvailable }) => isAvailable)
          .map(({ agentId }) => agentId),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("AGENT MESSAGING AVAILABILITY ERROR", error);

    return NextResponse.json(
      { error: "Failed to check agent messaging availability" },
      { status: 502 },
    );
  }
}
