import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getProjectDashboardExportFilename,
  sanitizeProjectDashboardExportRows,
} from "@/app/utils/project-dashboard-export";
import { createProjectDashboardExportBuffer } from "@/app/utils/project-dashboard-export-workbook";

type ExportRequestPayload = {
  projectName?: unknown;
  rows?: unknown;
};

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: ExportRequestPayload;
  try {
    payload = (await req.json()) as ExportRequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rows = sanitizeProjectDashboardExportRows(payload.rows);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No dashboard rows to export" },
      { status: 400 },
    );
  }

  const filename = getProjectDashboardExportFilename(payload.projectName);
  const buffer = await createProjectDashboardExportBuffer(rows);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
