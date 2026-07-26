import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      status: "error",
      message: "Only the agent can update query status.",
    },
    { status: 403 },
  );
}
