import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWqhApiUrl } from "@/lib/config";

// Define the structure of the payload
export interface GetAgentsFreePayload {
  email: string;
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

    // Get last_index, status, and country_code from URL parameters
    const url = new URL(req.url);
    const last_index = url.searchParams.get("last_index") || "0";
    const status = url.searchParams.get("status") || "";
    const country_code = url.searchParams.get("country_code") || "";
    const jsonData = await req.json();

    const payload: GetAgentsFreePayload = {
      email: jsonData.email || "",
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
      async_sheet: false,
    };

    // Build query string with optional status and country_code parameters
    const statusQuery = status ? `&status=${status}` : "";
    const countryQuery = country_code ? `&country_code=${country_code}` : "";

    const externalRes = await fetch(
      `${getWqhApiUrl()}/get-agents-free?last_index=${last_index}${statusQuery}${countryQuery}`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true,
      }
    );

    const data = await externalRes.json();

    const sanitizedData =
      data && typeof data === "object"
        ? Object.fromEntries(
            Object.entries(data as Record<string, unknown>).filter(
              ([key]) => key !== "task_id"
            )
          )
        : data;

    return NextResponse.json(sanitizedData, { status: externalRes.status });
  } catch (error) {
    console.error("============== API Error ==============", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
