import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import {
  AgentMessagingProfileError,
  ensureAgentMessagingProfile,
  fetchAgentMessagingProfileByLegacyId,
  type AgentMessagingProfileRow,
} from "@/app/utils/agent-messaging-profile.server";
import { getWqhApiUrl, getWqhMessagingApiSecret } from "@/lib/config";
import { getAccountMetadata } from "@/lib/clerk-metadata";

type CreateAgentProfileResponse =
  | { status: "success"; agent: AgentMessagingProfileRow }
  | { status: "error"; message?: string };

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as CreateAgentProfileResponse;
  } catch {
    return null;
  }
}

function getCurrentEmail(user: Awaited<ReturnType<typeof currentUser>>) {
  return (
    user?.primaryEmailAddress?.emailAddress?.trim() ||
    user?.emailAddresses[0]?.emailAddress?.trim() ||
    null
  );
}

export async function POST(req: NextRequest) {
  const controller = new AbortController();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user || getAccountMetadata(user).accountType !== "agent") {
      return NextResponse.json(
        { error: "Only agent accounts can create agent profiles" },
        { status: 403 },
      );
    }

    const email = getCurrentEmail(user);
    if (!email) {
      return NextResponse.json(
        { error: "A verified email is required to create an agent profile" },
        { status: 400 },
      );
    }

    const payload = await req.json();

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    const legacyAgentId = getString(
      (payload as Record<string, unknown>).legacy_agent_id,
    );

    const headers = new Headers({ "Content-Type": "application/json" });
    const messagingSecret = getWqhMessagingApiSecret();
    if (messagingSecret) {
      headers.set("X-WQH-Messaging-Key", messagingSecret);
    }

    const externalRes = await fetch(
      `${getWqhApiUrl().replace(/\/$/, "")}/create-agent-profile`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    const data = await readJson(externalRes);

    let profile = data?.status === "success" ? data.agent : null;

    // Creation and messaging enrollment are separate backend operations. If a
    // retry finds the profile already created, finish its enrollment instead
    // of leaving the agent permanently stuck behind a 409 response.
    if (!profile && externalRes.status === 409 && legacyAgentId) {
      profile = await fetchAgentMessagingProfileByLegacyId(legacyAgentId);
    }

    if (!profile) {
      return NextResponse.json(
        data ?? { status: "error", message: "Invalid profile API response" },
        { status: externalRes.status || 502 },
      );
    }

    const enrolledProfile = await ensureAgentMessagingProfile({
      email,
      profile,
    });

    return NextResponse.json(
      { status: "success", agent: enrolledProfile },
      { status: externalRes.ok ? externalRes.status : 200 },
    );
  } catch (error) {
    console.error("CREATE AGENT PROFILE API ERROR: ", error);

    if (error instanceof AgentMessagingProfileError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "CREATE AGENT PROFILE API ERROR",
      },
      { status: 500 },
    );
  }
}
