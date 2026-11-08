import * as XLSX from "xlsx";
import * as fs from "fs";
import path from "path";

XLSX.set_fs(fs);

const check = (file: string) => {
  const wb = XLSX.readFile(path.resolve("exported-data", file));
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]]);
  const withUrls = rows.filter((row) => String(row["Attachment URLs"] ?? "").trim());
  const urls = withUrls.flatMap((row) => String(row["Attachment URLs"]).split("\n").filter(Boolean));
  const missing = urls.filter((url) => !fs.existsSync(path.resolve(url)));

  console.log(`\n==== ${file} ====`);
  console.log(`rows=${rows.length} rows_with_attachments=${withUrls.length} urls=${urls.length} missing_on_disk=${missing.length}`);
  for (const row of withUrls.slice(0, 5)) {
    console.log(JSON.stringify({ title: row["Title"] ?? row["Comment"], urls: row["Attachment URLs"] }));
  }
  if (missing.length) console.log("missing:", missing.slice(0, 5));
};

check("tasks.xlsx");
check("comments.xlsx");
