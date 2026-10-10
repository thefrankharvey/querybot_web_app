import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getWriterEmail, getWqhHistoryHeaders } from "@/lib/wqh-history-auth";
import { getWqhApiEndpoint } from "@/lib/config";

import {
  resolveSmartMatchWriterProjectId,
  SmartMatchProjectError,
} from "@/app/utils/smart-match-projects.server";
import {
  getLegacySearchProject,
  linkLegacySearchProfile,
} from "@/app/utils/smart-match-profile-link.server";

import { ensureSmartMatchDashboardProject } from "@/app/utils/smart-match-dashboard.server";

// Define the structure of the payload
export interface GetAgentsFreePayload {
  email: string;
  project_name?: string;
  writer_project_id?: string | null;
  expected_profile_revision?: string;
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
    const legacyDashboardId = await getLegacySearchProject({
      userId,
      selection: jsonData.save_project,
      writerProjectId: jsonData.writer_project_id,
      projectName: jsonData.project_name,
      lastIndex: last_index,
    });

    const payload: GetAgentsFreePayload = {
      email,
      project_name:
        typeof jsonData.project_name === "string"
          ? jsonData.project_name
          : undefined,
      writer_project_id: await resolveSmartMatchWriterProjectId({
        userId,
        email,
        writerProjectId: jsonData.writer_project_id,
        projectName: jsonData.project_name,
      }),
      genre: jsonData.genre,
      expected_profile_revision:
        typeof jsonData.expected_profile_revision === "string"
          ? jsonData.expected_profile_revision
          : undefined,
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
      async_sheet: false,
    };

    // Build query string with optional status and country_code parameters
    const statusQuery = status ? `&status=${status}` : "";
    const countryQuery = country_code ? `&country_code=${country_code}` : "";

    const externalRes = await fetch(
      `${getWqhApiEndpoint("get-agents-free")}?last_index=${last_index}${statusQuery}${countryQuery}`,
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
    let dashboardProject;
    if (externalRes.ok && legacyDashboardId && Array.isArray(data?.matches)) {
      await linkLegacySearchProfile(
        userId,
        legacyDashboardId,
        data.writer_project_id,
      );
    }
    if (
      externalRes.ok &&
      last_index === "0" &&
      Array.isArray(data?.matches) &&
      data.matches.length > 0
    ) {
      dashboardProject = await ensureSmartMatchDashboardProject({
        userId,
        writerProjectId: data.writer_project_id,
        projectName: payload.project_name,
        dashboardProjectId:
          legacyDashboardId ?? jsonData.save_project?.dashboardProjectId,
      });
    }

    const sanitizedData =
      data && typeof data === "object"
        ? Object.fromEntries(
            Object.entries(data as Record<string, unknown>).filter(
              ([key]) => key !== "task_id",
            ),
          )
        : data;

    return NextResponse.json(
      dashboardProject
        ? { ...sanitizedData, dashboard_project: dashboardProject }
        : sanitizedData,
      { status: externalRes.status },
    );
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
