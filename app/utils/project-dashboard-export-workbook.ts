import "server-only";

import ExcelJS from "exceljs";

import {
  PROJECT_DASHBOARD_EXPORT_COLUMNS,
  PROJECT_DASHBOARD_EXPORT_DATE_KEYS,
  PROJECT_DASHBOARD_EXPORT_LINK_KEYS,
  formatProjectDashboardExportUrl,
  getProjectDashboardExportFitRatingLabel,
  parseProjectDashboardExportDate,
  type ProjectDashboardExportColumnKey,
  type ProjectDashboardExportRow,
} from "@/app/utils/project-dashboard-export";

const HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1C4A4E" },
} as const;
const HEADER_FONT = {
  bold: true,
  color: { argb: "FFFFFFFF" },
} as const;
const BORDER_COLOR = { argb: "FFE2E8E8" };
const CELL_BORDER = {
  bottom: { style: "thin", color: BORDER_COLOR },
} as const;
const WRAPPED_KEYS = new Set<ProjectDashboardExportColumnKey>(["notes"]);

function getWorksheetRowValue(
  row: ProjectDashboardExportRow,
  key: ProjectDashboardExportColumnKey,
) {
  if (key === "fitRating") {
    return getProjectDashboardExportFitRatingLabel(row.fitRating);
  }

  if (PROJECT_DASHBOARD_EXPORT_DATE_KEYS.has(key)) {
    return parseProjectDashboardExportDate(row[key]) ?? null;
  }

  if (PROJECT_DASHBOARD_EXPORT_LINK_KEYS.has(key)) {
    const hyperlink = formatProjectDashboardExportUrl(row[key]);
    return hyperlink ? { text: row[key], hyperlink } : row[key];
  }

  return row[key];
}

export function createProjectDashboardExportWorkbook(
  rows: readonly ProjectDashboardExportRow[],
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Write Query Hook";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Query Dashboard", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  worksheet.columns = PROJECT_DASHBOARD_EXPORT_COLUMNS.map((column) => ({
    key: column.key,
    header: column.header,
    width: column.width,
  }));
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: PROJECT_DASHBOARD_EXPORT_COLUMNS.length },
  };

  const headerRow = worksheet.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.border = CELL_BORDER;
    cell.alignment = { horizontal: "left", vertical: "middle" };
  });

  for (const row of rows) {
    const worksheetRow = worksheet.addRow(
      Object.fromEntries(
        PROJECT_DASHBOARD_EXPORT_COLUMNS.map((column) => [
          column.key,
          getWorksheetRowValue(row, column.key),
        ]),
      ),
    );

    worksheetRow.height = 24;
    PROJECT_DASHBOARD_EXPORT_COLUMNS.forEach((column, columnIndex) => {
      const cell = worksheetRow.getCell(columnIndex + 1);
      cell.border = CELL_BORDER;
      cell.alignment = {
        horizontal: "left",
        vertical: "top",
        wrapText: WRAPPED_KEYS.has(column.key),
      };

      if (PROJECT_DASHBOARD_EXPORT_DATE_KEYS.has(column.key)) {
        cell.numFmt = "yyyy-mm-dd";
      }

      if (PROJECT_DASHBOARD_EXPORT_LINK_KEYS.has(column.key) && row[column.key]) {
        cell.font = { color: { argb: "FF0563C1" }, underline: true };
      }
    });
  }

  return workbook;
}

export async function createProjectDashboardExportBuffer(
  rows: readonly ProjectDashboardExportRow[],
) {
  const workbook = createProjectDashboardExportWorkbook(rows);
  return workbook.xlsx.writeBuffer();
}
