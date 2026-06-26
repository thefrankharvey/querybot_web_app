import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getWqhTraitsApiUrl } from "@/lib/config";
import {
  isTraitType,
  isValidSanitizedTraitValue,
  sanitizeTraitValue,
} from "@/lib/traits";

type ApiErrorResponse = {
  status?: "error";
  message?: string;
  error?: string;
};

type UpstreamJsonResult =
  | {
      ok: true;
      data: unknown;
    }
  | {
      ok: false;
      message: string;
      status: number;
    };

export async function GET(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const traitsApiBaseUrl = getWqhTraitsApiUrl().replace(/\/$/, "");
    const externalUrl = new URL(`${traitsApiBaseUrl}/get-traits`);

    for (const key of ["type", "q", "limit"]) {
      const value = searchParams.get(key);
      if (value) {
        externalUrl.searchParams.set(key, value);
      }
    }

    const externalRes = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const parsedResponse = await readUpstreamJson(
      externalRes,
      externalUrl.toString(),
    );

    if (!parsedResponse.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: parsedResponse.message,
        },
        { status: parsedResponse.status },
      );
    }

    return NextResponse.json(parsedResponse.data, {
      status: externalRes.status,
    });
  } catch (error) {
    console.error("Traits API GET error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch traits",
      },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { type?: unknown; value?: unknown };
    const rawType = typeof body.type === "string" ? body.type.trim() : "";

    if (!isTraitType(rawType)) {
      return NextResponse.json(
        { status: "error", message: "Invalid trait type" },
        { status: 400 },
      );
    }

    if (typeof body.value !== "string") {
      return NextResponse.json(
        { status: "error", message: "Trait value is required" },
        { status: 400 },
      );
    }

    const value = sanitizeTraitValue(rawType, body.value);

    if (!isValidSanitizedTraitValue(value)) {
      return NextResponse.json(
        { status: "error", message: "Trait value is required" },
        { status: 400 },
      );
    }

    const traitsApiBaseUrl = getWqhTraitsApiUrl().replace(/\/$/, "");
    const externalUrl = `${traitsApiBaseUrl}/create-trait`;

    const externalRes = await fetch(externalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: rawType, value }),
      signal: controller.signal,
    });

    const parsedResponse = await readUpstreamJson(externalRes, externalUrl);

    if (!parsedResponse.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: parsedResponse.message,
        },
        { status: parsedResponse.status },
      );
    }

    return NextResponse.json(parsedResponse.data, {
      status: externalRes.status,
    });
  } catch (error) {
    console.error("Traits API POST error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create trait",
      },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readUpstreamJson(
  response: Response,
  endpointUrl: string,
): Promise<UpstreamJsonResult> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLocaleLowerCase().includes("application/json")) {
    await response.text().catch(() => "");

    return {
      ok: false,
      message: `Traits API endpoint unavailable at ${endpointUrl}`,
      status: 502,
    };
  }

  try {
    return {
      ok: true,
      data: (await response.json()) as ApiErrorResponse,
    };
  } catch {
    return {
      ok: false,
      message: `Traits API returned invalid JSON at ${endpointUrl}`,
      status: 502,
    };
  }
}
