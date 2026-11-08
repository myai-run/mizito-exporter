import * as XLSX from "xlsx";
import * as fs from "fs";
import path from "path";

XLSX.set_fs(fs);

const dir = path.resolve("exported-data");
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".xlsx"))) {
  const wb = XLSX.readFile(path.join(dir, file));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  console.log(`\n==== ${file} rows=${rows.length} ====`);
  console.log("header:", JSON.stringify(rows[0]));
  for (const row of rows.slice(1, 12)) console.log(JSON.stringify(row));
  if (rows.length > 12) console.log(`... +${rows.length - 12} more`);

  const body = rows.slice(1);
  const empty = body.reduce(
    (n, row) => n + row.filter((c) => c === undefined || c === null || c === "").length,
    0,
  );
  const unknownWs = body.filter((row) =>
    row.some((c) => typeof c === "string" && c.includes("Unknown Workspace")),
  ).length;
  console.log(`empty_cells=${empty} unknown_workspace_rows=${unknownWs}`);
}
