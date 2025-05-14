import { NextRequest, NextResponse } from "next/server";

// Define the structure of form data
interface QueryFormData {
  email: string;
  genre: string;
  subgenres: string[];
  special_audience: string;
  target_audience: string;
  comps: { title: string; author: string }[] | string[];
  themes: string[] | string;
  synopsis: string;
  manuscript?: string; // Now always a string, not a file
  query_letter?: string;
}

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    const jsonData = await req.json();

    const formDataObj: QueryFormData = {
      email: jsonData.email || "",
      genre: jsonData.genre || "",
      subgenres: Array.isArray(jsonData.subgenres) ? jsonData.subgenres : [],
      special_audience: jsonData.special_audience || "",
      target_audience: jsonData.target_audience || "",
      comps: Array.isArray(jsonData.comps) ? jsonData.comps : [],
      themes: Array.isArray(jsonData.themes)
        ? jsonData.themes
        : typeof jsonData.themes === "string"
        ? jsonData.themes
        : "",
      synopsis: jsonData.synopsis || "",
      manuscript: jsonData.manuscript || "",
      query_letter: "",
    };

    console.log("Processing query with JSON data:", Object.keys(formDataObj));

    const externalRes = await fetch(
      "http://querybot-api.onrender.com/submit-form",
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

// Increase the request body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
