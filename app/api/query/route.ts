import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    const body = await req.json();
    const externalRes = await fetch(
      "http://querybot-api.onrender.com/submit-form",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        keepalive: true,
      }
    );

    if (!externalRes.ok) {
      throw new Error(
        `External API responded with status: ${externalRes.status}`
      );
    }

    console.log("EXTERNAL RES: ", externalRes.body);

    const jsonData = await externalRes.json();
    console.log("JSON RESPONSE BODY:", jsonData);

    // return NextResponse.json(data, { status: externalRes.status });
  } catch (error: unknown) {
    console.error("Error:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timed out after 5 minutes" },
          { status: 504 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
