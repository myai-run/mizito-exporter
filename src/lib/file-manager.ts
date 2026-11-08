import fs from "fs";
import path from "path";
import { getDownloadIdentifierByContent, getFileByIdentifier } from "../services/api.js";

const EXPORTED_FILES_DIR = "exported-files";

const sanitizeFileName = (name: string) =>
  name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim();

const fileNameFromDisposition = (disposition?: string): string | undefined => {
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

class FileManager {
  // content_key -> saved relative path
  downloadedFiles = new Map<string, string>();

  async download(content: string, contentKey: string, fileName?: string): Promise<string> {
    const cached = this.downloadedFiles.get(contentKey);
    if (cached) return cached;

    try {
      const identifier = (await getDownloadIdentifierByContent(content)).data;
      const resp = await getFileByIdentifier(identifier);
      const name =
        fileName ?? fileNameFromDisposition(resp.headers["content-disposition"]) ?? "file";

      const relativePath = path.posix.join(
        EXPORTED_FILES_DIR,
        sanitizeFileName(`${contentKey}-${name}`),
      );
      const outputPath = path.resolve(process.cwd(), relativePath);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, Buffer.from(resp.data));

      this.downloadedFiles.set(contentKey, relativePath);
      return relativePath;
    } catch (e) {
      console.log(`Downloading file failed (${fileName ?? contentKey}): `, (e as Error).message);
      return "";
    }
  }
}

const fileManager = new FileManager();
export { fileManager };
