import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/app/api/supabase/server";
import { getDashboardProject } from "@/app/utils/project-dashboard-data";
import {
  ProjectProfileError,
  requestWriterProfile,
} from "@/app/utils/project-profile.server";
import { getWriterEmail } from "@/lib/wqh-history-auth";

type Context = { params: Promise<{ projectId: string }> };
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

async function handle(req: Request, { params }: Context, save: boolean) {
  const { userId } = await auth();
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const user = await currentUser();
  if (!user || user.id !== userId) return json({ error: "Unauthorized" }, 401);
  const email = getWriterEmail(user);
  if (!email) return json({ error: "An email address is required." }, 422);
  try {
    const { projectId } = await params;
    const project = await getDashboardProject(projectId);
    if (!project) return json({ error: "Project not found" }, 404);
    const payload = save ? await req.json().catch(() => null) : undefined;
    if (
      save &&
      (!payload ||
        typeof payload !== "object" ||
        Array.isArray(payload) ||
        !Object.hasOwn(payload, "expected_revision"))
    ) {
      return json(
        { error: "Provide project traits and the saved profile revision." },
        400,
      );
    }
    const profile = await requestWriterProfile(
      project,
      email,
      save
        ? {
            expected_revision: payload.expected_revision,
            traits: payload.traits,
          }
        : undefined,
    );
    if (save && !project.writer_project_id && profile.writerProjectId) {
      // No schema changes: attach only the existing, owned legacy dashboard.
      // An upstream save is idempotently recoverable via the dashboard UUID.
      const { data, error } = await createServerSupabase()
        .from("dashboard_projects")
        .update({ writer_project_id: profile.writerProjectId })
        .eq("id", project.id)
        .eq("user_id", userId)
        .is("writer_project_id", null)
        .select("id")
        .maybeSingle();
      if (error || !data) {
        const latest = await getDashboardProject(project.id);
        if (latest?.writer_project_id !== profile.writerProjectId) {
          return json(
            {
              error:
                "Traits were saved, but the project link could not be updated. Reload this profile and save again.",
            },
            503,
          );
        }
      }
    }
    return json({ profile });
  } catch (error) {
    if (error instanceof ProjectProfileError)
      return json({ error: error.message }, error.status);
    console.error("[project-profile] Request failed");
    return json(
      { error: "Unable to load or save project traits. Please try again." },
      503,
    );
  }
}

export const GET = (req: Request, context: Context) =>
  handle(req, context, false);
export const PATCH = (req: Request, context: Context) =>
  handle(req, context, true);
