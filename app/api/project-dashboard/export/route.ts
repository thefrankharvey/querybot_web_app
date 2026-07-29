import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getProjectDashboardExportFilename,
  sanitizeProjectDashboardExportRows,
  type ProjectDashboardExportRow,
} from "@/app/utils/project-dashboard-export";
import { createProjectDashboardExportBuffer } from "@/app/utils/project-dashboard-export-workbook";

const FREE_QUERY_SPREADSHEET_FILENAME = "free-query-spreadsheet.xlsx";

type ExportRequestPayload = {
  projectName?: unknown;
  rows?: unknown;
};

async function createSpreadsheetResponse(
  rows: readonly ProjectDashboardExportRow[],
  filename: string,
) {
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

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return createSpreadsheetResponse([], FREE_QUERY_SPREADSHEET_FILENAME);
}

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
  return createSpreadsheetResponse(rows, filename);
}
