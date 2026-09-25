import { getWqhApiEndpoint } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getWriterEmail, getWqhHistoryHeaders } from "@/lib/wqh-history-auth";

import {
  resolveSmartMatchWriterProjectId,
  SmartMatchProjectError,
} from "@/app/utils/smart-match-projects.server";

// Define the structure of the payload
export interface GetAgentsPaidPayload {
  email: string;
  project_name?: string;
  writer_project_id?: string | null;
  genre?: string;
  subgenres?: string[];
  target_audience?: string;
  comps?: string[];
  themes?: string[];
  synopsis?: string;
  query_letter?: string;
  manuscript?: string;
  non_fiction?: boolean;
  enable_ai?: boolean;
  format?: string;
  async_sheet?: boolean;
}

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = getWriterEmail(user);
    if (!email) {
      return NextResponse.json(
        { error: "An email address is required" },
        { status: 422 },
      );
    }
    const historyHeaders = getWqhHistoryHeaders();
    if (!historyHeaders) {
      return NextResponse.json(
        { error: "Smart Match service is not configured" },
        { status: 503 },
      );
    }

    // Get last_index, status, and country_code from URL parameters
    const url = new URL(req.url);
    const last_index = url.searchParams.get("last_index") || "0";
    const status = url.searchParams.get("status") || "";
    const country_code = url.searchParams.get("country_code") || "";
    const jsonData = await req.json();

    const payload: GetAgentsPaidPayload = {
      email,
      project_name:
        typeof jsonData.project_name === "string"
          ? jsonData.project_name
          : undefined,
      writer_project_id: await resolveSmartMatchWriterProjectId({
        userId,
        writerProjectId: jsonData.writer_project_id,
        projectName: jsonData.project_name,
      }),
      genre: jsonData.genre,
      subgenres: Array.isArray(jsonData.subgenres)
        ? jsonData.subgenres
        : undefined,
      target_audience: jsonData.target_audience,
      comps: Array.isArray(jsonData.comps) ? jsonData.comps : undefined,
      themes: Array.isArray(jsonData.themes) ? jsonData.themes : undefined,
      synopsis: jsonData.synopsis,
      query_letter: jsonData.query_letter,
      manuscript: jsonData.manuscript,
      non_fiction: jsonData.non_fiction,
      enable_ai: jsonData.enable_ai,
      format: jsonData.format,
      async_sheet: true,
    };

    // Build query string with optional status and country_code parameters
    const statusQuery = status ? `&status=${status}` : "";
    const countryQuery = country_code ? `&country_code=${country_code}` : "";

    const externalRes = await fetch(
      `${getWqhApiEndpoint("get-agents-paid")}?limit=21&last_index=${last_index}${statusQuery}${countryQuery}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...historyHeaders,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        keepalive: true,
      },
    );

    const data = await externalRes.json();
    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    if (error instanceof SmartMatchProjectError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("============== API Error ==============", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
