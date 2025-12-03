import { WQH_API_URL } from "@/app/constants";
import { NextRequest, NextResponse } from "next/server";

// Define the structure of form data
export interface QueryFormData {
  email: string;
  genre: string;
  subgenres: string[];
  target_audience: string;
  comps: string[];
  themes: string[];
  synopsis: string;
  manuscript?: string; // Now always a string, not a file
  query_letter?: string;
  enable_ai: boolean;
  non_fiction: boolean;
  format: string;
}

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    // Get last_index from URL parameters
    const url = new URL(req.url);
    const last_index = url.searchParams.get("last_index") || "0";
    const jsonData = await req.json();

    const formDataObj: QueryFormData = {
      email: jsonData.email || "",
      genre: jsonData.genre || "",
      subgenres: Array.isArray(jsonData.subgenres) ? jsonData.subgenres : [],
      target_audience: jsonData.target_audience || "",
      comps: Array.isArray(jsonData.comps) ? jsonData.comps : [],
      themes: Array.isArray(jsonData.themes)
        ? jsonData.themes
        : typeof jsonData.themes === "string"
        ? jsonData.themes
        : "",
      synopsis: jsonData.synopsis || "",
      manuscript: jsonData.manuscript || "",
      query_letter: jsonData.query_letter || "",
      enable_ai: jsonData.enable_ai || false,
      non_fiction: jsonData.non_fiction || false,
      format: jsonData.format || "",
    };

    const externalRes = await fetch(
      `${WQH_API_URL}/submit-form?limit=21&last_index=${last_index}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObj),
        signal: controller.signal,
        keepalive: true,
      }
    );

    console.log(
      "============== JSON.stringify(formDataObj) ==============",
      JSON.stringify(formDataObj)
    );
    console.log("============== EXTERNAL RES ==============", externalRes);

    const data = await externalRes.json();

    console.log("============== DATA ==============", data);

    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.log("============== API Error ==============", error);
    console.error("============== API Error ==============", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// Increase the request body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
