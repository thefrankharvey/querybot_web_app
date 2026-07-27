import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createServerSupabase } from "@/app/api/supabase/server";
import { AGENT_MATCHES_TABLE } from "@/app/constants";

const MAX_DELETE_ROWS = 200;

type DeleteRowsPayload = {
  projectName?: unknown;
  rowIds?: unknown;
};

function normalizeRowIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((rowId): rowId is string => typeof rowId === "string")
        .map((rowId) => rowId.trim())
        .filter(Boolean),
    ),
  );
}

export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: DeleteRowsPayload;
  try {
    payload = (await req.json()) as DeleteRowsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rowIds = normalizeRowIds(payload.rowIds);
  if (rowIds.length === 0 || rowIds.length > MAX_DELETE_ROWS) {
    return NextResponse.json(
      { error: `Select between 1 and ${MAX_DELETE_ROWS} rows` },
      { status: 400 },
    );
  }

  const projectName =
    typeof payload.projectName === "string"
      ? payload.projectName.trim()
      : "";
  const supabase = createServerSupabase();
  let deleteQuery = supabase
    .from(AGENT_MATCHES_TABLE)
    .delete()
    .eq("user_id", userId)
    .in("id", rowIds);

  if (projectName) {
    deleteQuery = deleteQuery.eq("project_name", projectName);
  }

  const { data, error } = await deleteQuery.select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ deletedRows: data ?? [] });
}
