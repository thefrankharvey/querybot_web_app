import { AgentChangeSourceContractError } from "@/app/utils/personalized-radar/source-events";

export type WatchedDispatchCursor = {
  sourceCursor: string | null;
  eventOffset: number;
};

export function encodeWatchedDispatchCursor(cursor: WatchedDispatchCursor): string {
  return Buffer.from(JSON.stringify({ v: 1, ...cursor }), "utf8").toString(
    "base64url",
  );
}

export function decodeWatchedDispatchCursor(
  value: string | null,
): WatchedDispatchCursor {
  if (!value) return { sourceCursor: null, eventOffset: 0 };
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      v?: unknown;
      sourceCursor?: unknown;
      eventOffset?: unknown;
    };
    if (
      parsed.v !== 1 ||
      (parsed.sourceCursor !== null && typeof parsed.sourceCursor !== "string") ||
      !Number.isInteger(parsed.eventOffset) ||
      Number(parsed.eventOffset) < 0 ||
      Number(parsed.eventOffset) > 200
    ) {
      throw new Error("invalid");
    }
    return {
      sourceCursor: parsed.sourceCursor as string | null,
      eventOffset: Number(parsed.eventOffset),
    };
  } catch {
    throw new AgentChangeSourceContractError("Dispatch cursor is invalid");
  }
}
