import "server-only";

import { NextResponse } from "next/server";
import {
  RadarPersistenceError,
} from "@/app/utils/personalized-radar/repository.server";
import {
  RadarEntitlementError,
  RadarValidationError,
} from "@/app/utils/personalized-radar/validation";

export const RADAR_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
} as const;

export function radarJson<T>(body: T, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: RADAR_NO_STORE_HEADERS,
  });
}

export function radarError(status: number, code: string, message: string) {
  return radarJson({ status: "error", code, message }, status);
}

export function radarErrorResponse(error: unknown) {
  if (error instanceof RadarValidationError) {
    return radarError(400, error.code, error.message);
  }
  if (error instanceof RadarEntitlementError) {
    return radarError(403, error.code, error.message);
  }
  if (error instanceof RadarPersistenceError) {
    return radarError(error.status, error.code, error.message);
  }
  return radarError(
    500,
    "RADAR_INTERNAL_ERROR",
    "The Radar request could not be completed",
  );
}

export async function readRadarJson(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new RadarValidationError("Request body must be valid JSON");
  }
}

