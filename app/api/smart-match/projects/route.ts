import { auth, currentUser } from "@clerk/nextjs/server";
import { getWriterEmail } from "@/lib/wqh-history-auth";
import { NextResponse } from "next/server";
import {
  fetchSmartMatchProjects,
  SmartMatchProjectError,
} from "@/app/utils/smart-match-projects.server";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  if (!user || user.id !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const email = getWriterEmail(user);
  if (!email) {
    return NextResponse.json(
      { error: "Unable to resolve current user email" },
      { status: 422 },
    );
  }

  try {
    return NextResponse.json(
      { projects: await fetchSmartMatchProjects(email) },
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
