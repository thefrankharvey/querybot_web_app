import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/app/api/supabase/server";
import { isDashboardProjectId } from "@/app/utils/project-dashboard-route";
import { profileTraits } from "@/app/utils/project-profile";
import {
  ProjectProfileError,
  requestWriterProfile,
} from "@/app/utils/project-profile.server";
import { getWriterEmail } from "@/lib/wqh-history-auth";
import { linkLegacySearchProfile } from "@/app/utils/smart-match-profile-link.server";
import { SmartMatchProjectError } from "@/app/utils/smart-match-projects.server";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const user = await currentUser();
  if (!user || user.id !== userId) return json({ error: "Unauthorized" }, 401);
  const email = getWriterEmail(user);
  if (!email) return json({ error: "An email address is required." }, 422);
  const body = await req.json().catch(() => null);
  const projectId = body?.projectId;
  if (typeof projectId !== "string" || !isDashboardProjectId(projectId))
    return json({ error: "Provide a valid project creation ID." }, 400);

  try {
    const store = createServerSupabase();
    // The browser reuses this UUID when retrying a failed creation. Ignore an
    // existing row rather than overwriting a title, profile, or another owner.
    const inserted = await store.from("dashboard_projects").upsert(
      {
        id: projectId,
        user_id: userId,
        scope_key: `manual:${projectId}`,
        project_name: "My Project",
        writer_project_id: null,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (inserted.error) throw new Error("Project creation failed");
    const loaded = await store
      .from("dashboard_projects")
      .select("id,project_name,writer_project_id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .maybeSingle();
    if (loaded.error) throw new Error("Project read failed");
    if (!loaded.data) return json({ error: "Project not found" }, 404);
    const project = loaded.data;
    let profile = await requestWriterProfile(project, email);
    if (!profile.revision) {
      profile = await requestWriterProfile(project, email, {
        expected_revision: null,
        traits: profileTraits(profile.form),
      });
    }
    if (!profile.writerProjectId) throw new Error("Profile creation failed");
    if (!project.writer_project_id) {
      await linkLegacySearchProfile(
        userId,
        project.id,
        profile.writerProjectId,
      );
    }
    return json(
      {
        project: {
          id: project.id,
          project_name: project.project_name,
          writer_project_id: profile.writerProjectId,
        },
        profile,
      },
      201,
    );
  } catch (error) {
    if (
      error instanceof ProjectProfileError ||
      error instanceof SmartMatchProjectError
    )
      return json({ error: error.message }, error.status);
    console.error("[create-project] Request failed");
    return json(
      {
        error:
          "Unable to finish creating your project. Try again to continue with the same project.",
      },
      503,
    );
  }
}
