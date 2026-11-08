import "dotenv/config";
import {
  getProjectsList,
  getTasksByProjectId,
  getUsersList,
  getWorkspaces,
  getWorkspaceToken,
} from "../src/services/api.js";
import { exporterClient, dlClient, tokenManager } from "../src/services/exporterClient.js";
import type { Task } from "../src/types.js";

const preview = (value: unknown, max = 600) => {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

async function main() {
  const workspaces = (await getWorkspaces()).data.workspaces;

  let taskWithAttachment: Task | undefined;
  let commentWithAttachment: unknown;
  let sampleUserPhoto: unknown;

  for (const workspace of workspaces) {
    const token = (await getWorkspaceToken(workspace._id)).data.token;
    tokenManager.setToken(token);

    if (!sampleUserPhoto) {
      const users = (await getUsersList()).data.users;
      sampleUserPhoto = users.find((user) => user.photo)?.photo;
    }

    const projects = (await getProjectsList()).data.projects;
    for (const project of projects) {
      if (taskWithAttachment && commentWithAttachment) break;
      const tasks = (await getTasksByProjectId(project._id)).data;
      if (!Array.isArray(tasks)) continue;

      if (!taskWithAttachment) {
        taskWithAttachment = tasks.find((task) => task.attachments?.length);
      }

      if (!commentWithAttachment) {
        for (const task of tasks.filter((t) => t.has_comments).slice(0, 15)) {
          const comments = (
            await exporterClient().post("/api/tasks/getComments", { token: task.access_token })
          ).data as { attachments?: unknown[] }[];
          const found = Array.isArray(comments)
            ? comments.find((comment) => comment.attachments?.length)
            : undefined;
          if (found) {
            commentWithAttachment = found;
            break;
          }
        }
      }
    }
    if (taskWithAttachment && commentWithAttachment) break;
  }

  console.log("sample_user_photo", preview(sampleUserPhoto));
  console.log("task_attachments", preview(taskWithAttachment?.attachments, 1500));
  console.log("comment_with_attachment", preview(commentWithAttachment, 1500));

  const content = taskWithAttachment?.attachments?.[0]?.media?.document?.content;
  if (content) {
    const linkResp = await exporterClient().post("/api/content/getDownloadLink", { content });
    console.log("download_link_response", preview(linkResp.data));

    const data = linkResp.data as Record<string, unknown>;
    const identifier = (data.token ?? data.link ?? data.url ?? data.identifier) as string | undefined;
    if (identifier) {
      const fileResp = await dlClient().get(`/${identifier}`, { responseType: "arraybuffer" });
      console.log("cdn_status", fileResp.status, fileResp.headers["content-type"], fileResp.headers["content-disposition"]);
      console.log("cdn_bytes", (fileResp.data as ArrayBuffer).byteLength);
    }
  }
}

main().catch((err) => {
  console.error(err?.response?.status, err?.response?.data ?? err);
  process.exit(1);
});
