import "dotenv/config";
import { getProjectsList, getTasksByProjectId, getUsersList } from "../src/services/api.js";
import { exporterClient, dlClient } from "../src/services/exporterClient.js";

const download = async (label: string, content: string) => {
  const link = (await exporterClient().post("/api/content/getDownloadLink", { content })).data;
  console.log(`${label}_link_type`, typeof link);
  const resp = await dlClient().get(`/${link}`, { responseType: "arraybuffer", validateStatus: () => true });
  const bytes = Buffer.from(resp.data as ArrayBuffer);
  console.log(`${label}_cdn`, resp.status, resp.headers["content-type"], resp.headers["content-disposition"], bytes.length);
  if (bytes.length < 300) console.log(`${label}_body`, bytes.toString("utf8"));
};

async function main() {
  const users = (await getUsersList()).data.users;
  const photo = users.find((user) => user.photo?.photo_large)?.photo?.photo_large;
  if (photo) await download("photo", photo.content);

  const projects = (await getProjectsList()).data.projects;
  for (const project of projects) {
    const tasks = (await getTasksByProjectId(project._id)).data;
    const attachment = tasks.find((task) => task.attachments?.length)?.attachments[0];
    if (attachment) {
      console.log("attachment_name", attachment.media.document.name, attachment.media.document.size);
      await download("attachment", attachment.media.document.content);
      break;
    }
  }
}

main().catch((err) => {
  console.error(err?.response?.status, err?.response?.data ?? err);
  process.exit(1);
});
