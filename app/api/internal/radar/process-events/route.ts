import { timingSafeEqual } from "node:crypto";

import {
  radarError,
  radarJson,
} from "@/app/utils/personalized-radar/api.server";
import { getRadarFeatureFlags } from "@/app/utils/personalized-radar/feature-flags.server";
import {
  RadarProcessorError,
  runRadarEventProcessor,
} from "@/app/utils/personalized-radar/process-events.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function validAuthorization(value: string | null, secret: string) {
  if (!value?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(value.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  if (!getRadarFeatureFlags().fanoutProcessor) {
    return radarError(503, "RADAR_PROCESSOR_DISABLED", "Radar fan-out is disabled");
  }
  const secret = process.env.RADAR_PROCESSOR_SECRET?.trim();
  if (!secret) {
    return radarError(503, "RADAR_PROCESSOR_MISCONFIGURED", "Radar fan-out is unavailable");
  }
  if (!validAuthorization(request.headers.get("authorization"), secret)) {
    return radarError(401, "RADAR_PROCESSOR_UNAUTHORIZED", "Processor authentication failed");
  }
  try {
    return radarJson({ status: "success", summary: await runRadarEventProcessor() });
  } catch (error) {
    return radarError(
      error instanceof RadarProcessorError ? error.status : 500,
      "RADAR_PROCESSOR_FAILED",
      "Radar fan-out failed",
    );
  }
}

export async function GET() {
  return new Response(null, {
    status: 405,
    headers: { Allow: "POST", "Cache-Control": "private, no-store" },
  });
}

