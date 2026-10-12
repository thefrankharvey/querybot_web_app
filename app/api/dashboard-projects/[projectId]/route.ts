import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/app/api/supabase/server";
import { isDashboardProjectId } from "@/app/utils/project-dashboard-route";

import { getDashboardProject } from "@/app/utils/project-dashboard-data";
import {
  deleteWriterProfile,
  ProjectProfileError,
} from "@/app/utils/project-profile.server";
import { getWriterEmail } from "@/lib/wqh-history-auth";

type Context = { params: Promise<{ projectId: string }> };
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

export async function PATCH(req: Request, { params }: Context) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const { projectId } = await params;
  if (!isDashboardProjectId(projectId))
    return json({ error: "Project not found" }, 404);
  const body = await req.json().catch(() => null);
  const name =
    typeof body?.projectName === "string" ? body.projectName.trim() : "";
  if (!name || name.length > 120)
    return json(
      { error: "Enter a project name between 1 and 120 characters." },
      400,
    );

  const { data, error } = await createServerSupabase().rpc(
    "rename_dashboard_project",
    {
      p_user_id: userId,
      p_project_id: projectId,
      p_name: name,
    },
  );
  if (error)
    return json(
      {
        error:
          error.code === "23505"
            ? "A project with this name already exists. Choose another name."
            : "Unable to rename this project. Please try again.",
      },
      error.code === "23505" ? 409 : 500,
    );
  if (!data?.id) return json({ error: "Project not found" }, 404);
  return json({
    project: {
      id: data.id,
      project_name: data.project_name,
      writer_project_id: data.writer_project_id,
    },
  });
}

export async function DELETE(_req: Request, { params }: Context) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const { projectId } = await params;
  if (!isDashboardProjectId(projectId))
    return json({ error: "Project not found" }, 404);
  const user = await currentUser();
  if (!user || user.id !== userId) return json({ error: "Unauthorized" }, 401);
  const email = getWriterEmail(user);
  if (!email) return json({ error: "An email address is required." }, 422);
  try {
    const project = await getDashboardProject(projectId);
    if (!project) return json({ error: "Project not found" }, 404);
    // Delete upstream first. Keep the dashboard available for retry until both
    // services finish; the writer deletion is idempotent and blocks stale saves.
    await deleteWriterProfile(project, email);
    const { error } = await createServerSupabase().rpc(
      "delete_dashboard_project",
      { p_user_id: userId, p_project_id: projectId },
    );
    if (error)
      return json(
        {
          error:
            "Project traits and search history were deleted, but saved agents could not be removed. Try Delete project again to finish.",
        },
        503,
      );
    // A concurrent confirmed deletion may already have removed the dashboard.
    return json({ deleted: true });
  } catch (error) {
    if (error instanceof ProjectProfileError)
      return json({ error: error.message }, error.status);
    return json(
      { error: "Unable to delete this project. Please try again." },
      503,
    );
  }
}
