import assert from "node:assert/strict";
import ExcelJS from "exceljs";

const exportUrl =
  process.env.PROJECT_DASHBOARD_EXPORT_URL ??
  "http://localhost:3000/api/project-dashboard/export";
const authCookie = process.env.PROJECT_DASHBOARD_EXPORT_COOKIE;

if (!authCookie) {
  console.warn(
    "PROJECT_DASHBOARD_EXPORT_COOKIE is not set; the authenticated export route may return 401.",
  );
}

const rows = [
  {
    id: "row-1",
    cardId: "row-1",
    index_id: "agent-1",
    isPlaceholder: false,
    name: "Agent One",
    fitRating: "perfect",
    agency_url: "agency.example.com",
    wqh_profile_link: "https://writequeryhook.com/agent-matches/0",
    query_tracker: "https://querytracker.example.com/agent-one",
    pub_marketplace: "publishersmarketplace.com/agent-one",
    email: "agent@example.com",
    query_sent_date: "2026-06-01",
    pages_requested_date: "",
    rejected_date: "",
    offer_date: "",
    notes: "Follow up after eight weeks.",
  },
  {
    id: "placeholder:0",
    cardId: "",
    index_id: null,
    isPlaceholder: true,
    name: "Should not export",
    fitRating: "neutral",
    agency_url: "",
    wqh_profile_link: "",
    query_tracker: "",
    pub_marketplace: "",
    email: "",
    query_sent_date: "",
    pages_requested_date: "",
    rejected_date: "",
    offer_date: "",
    notes: "",
  },
];

const response = await fetch(exportUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(authCookie ? { Cookie: authCookie } : {}),
  },
  body: JSON.stringify({
    projectName: "Export Verification",
    rows,
  }),
});

assert.equal(
  response.status,
  200,
  `Expected export route to return 200, got ${response.status}: ${await response.text()}`,
);
assert.match(
  response.headers.get("content-type") ?? "",
  /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/,
);
assert.match(
  response.headers.get("content-disposition") ?? "",
  /export-verification-query-dashboard\.xlsx/,
);

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(Buffer.from(await response.arrayBuffer()));

const worksheet = workbook.getWorksheet("Query Dashboard");
assert.ok(worksheet, "Expected Query Dashboard worksheet");
assert.deepEqual(worksheet.getRow(1).values.slice(1), [
  "Name",
  "Fit Rating",
  "Agency website link",
  "WQH Profile link",
  "Query Tracker link",
  "PubMarketplace link",
  "Email",
  "Query Sent",
  "Pages Requested",
  "Rejected",
  "Offer",
  "Notes",
]);
assert.equal(worksheet.rowCount, 2, "Expected header plus one real row");

const dataRow = worksheet.getRow(2);
assert.equal(dataRow.getCell(1).value, "Agent One");
assert.equal(dataRow.getCell(2).value, "Perfect Fit");
assert.deepEqual(dataRow.getCell(3).value, {
  text: "agency.example.com",
  hyperlink: "http://agency.example.com",
});
assert.deepEqual(dataRow.getCell(4).value, {
  text: "https://writequeryhook.com/agent-matches/0",
  hyperlink: "https://writequeryhook.com/agent-matches/0",
});
assert.equal(dataRow.getCell(8).numFmt, "yyyy-mm-dd");
assert.ok(dataRow.getCell(8).value instanceof Date);
assert.equal(dataRow.getCell(12).value, "Follow up after eight weeks.");

console.log("Project dashboard export verification passed.");
