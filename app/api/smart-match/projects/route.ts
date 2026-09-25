import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  fetchSmartMatchProjects,
  SmartMatchProjectError,
} from "@/app/utils/smart-match-projects.server";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return NextResponse.json(
      { projects: await fetchSmartMatchProjects(userId) },
      {
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load projects",
      },
      {
        status: error instanceof SmartMatchProjectError ? error.status : 500,
      },
    );
  }
}
