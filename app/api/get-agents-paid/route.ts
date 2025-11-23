import { NextRequest, NextResponse } from "next/server";
import type { AgentQueryPayload } from "@/app/types";

/**
 * GET /api/get-agents-paid
 *
 * Query params:
 * - limit (optional): number of results to return
 * - last_index (optional): pagination cursor
 *
 * Body: AgentQueryPayload (JSON)
 */
export async function GET(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    // Parse query parameters
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit");
    const last_index = url.searchParams.get("last_index");
    const payloadParam = url.searchParams.get("payload");

    // Parse payload from query param (workaround for browser GET + body restriction)
    if (!payloadParam) {
      return NextResponse.json(
        { error: "Payload is required" },
        { status: 400 }
      );
    }

    const body: AgentQueryPayload = JSON.parse(payloadParam);

    // Validate required field
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate that at least one of comps/target_audience/themes is provided
    const hasRequiredField =
      (body.comps && body.comps.length > 0) ||
      body.target_audience ||
      (body.themes && body.themes.length > 0);

    if (!hasRequiredField) {
      return NextResponse.json(
        {
          error:
            "At least one of comps, target_audience, or themes must be provided",
        },
        { status: 400 }
      );
    }

    // Build external API URL with query params
    const externalUrl = new URL(
      "http://querybot-api.onrender.com/get-agents-paid"
    );
    if (limit) {
      externalUrl.searchParams.set("limit", limit);
    }
    if (last_index) {
      externalUrl.searchParams.set("last_index", last_index);
    }

    // Forward request to external API using GET with body
    // (server-side fetch allows this, unlike browser fetch)
    const externalRes = await fetch(externalUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      keepalive: true,
    });

    const data = await externalRes.json();

    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error(
      "============== GET /api/get-agents-paid Error ==============",
      error
    );

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
