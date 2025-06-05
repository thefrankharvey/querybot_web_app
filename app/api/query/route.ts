import { NextRequest, NextResponse } from "next/server";

// Define the structure of form data
export interface QueryFormData {
  email: string;
  genre: string;
  subgenres: string[];
  target_audience: string;
  comps: { title: string; author: string }[] | string[];
  themes: string[] | string;
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
      format: "comics",
    };

    // {
    //   "email": "john@example.com",
    //   "genre": "Historical Fiction",
    //   "subgenres": ["Espionage", "Political", "Fantasy", "Romance"],
    //   "target_audience": "middle grade",
    //   "comps": ["The Book Thief", "Number the Stars"],
    //   "themes": ["Friendship", "Courage", "Loyalty"],
    //   "synopsis": "A young spy in WWII France uncovers secrets that could save her family.",
    //   "query_letter": "Dear Agent, I am submitting my manuscript for your consideration...",
    //   "manuscript": "Once upon a time in war-torn Europe, a girl named Elise...",
    //   "enable_ai": true,
    //   "non_fiction": true,
    //   "format": "comics"
    //   }

    console.log("============== Form Data Object ==============", formDataObj);

    // const test = {
    //   email: "john@example.com",
    //   genre: "historical fiction",
    //   subgenres: ["espionage", "political thriller"],
    //   target_audience: "middle grade",
    //   comps: ["the book thief", "number the stars"],
    //   themes: ["friendship", "courage", "loyalty"],
    //   synopsis:
    //     "A young spy in WWII France uncovers secrets that could save her family.",
    //   query_letter:
    //     "Dear Agent, I am submitting my manuscript for your consideration...",
    //   manuscript: "Once upon a time in war-torn Europe, a girl named Elise...",
    //   enable_ai: true,
    //   non_fiction: true,
    //   format: "comics",
    // };

    const externalRes = await fetch(
      `http://querybot-api.onrender.com/submit-form?limit=21&last_index=0`,
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
