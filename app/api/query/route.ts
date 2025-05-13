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

    const externalResJson = await externalRes.json();

    return NextResponse.json(externalResJson, {
      status: externalRes.status,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
