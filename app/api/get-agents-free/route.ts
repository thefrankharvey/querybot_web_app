import { NextRequest, NextResponse } from "next/server";
import { WQH_API_URL } from "@/app/constants";

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
}

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
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
    };

    const externalRes = await fetch(`${WQH_API_URL}/get-agents-free`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true,
    });

    const data = await externalRes.json();

    return NextResponse.json(data, { status: externalRes.status });
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
