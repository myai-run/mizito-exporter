import "dotenv/config";
import {
  getProjectsList,
  getTasksByProjectId,
  getUsersList,
  getWorkspaces,
  getWorkspaceToken,
} from "../src/services/api.js";
import { tokenManager } from "../src/services/exporterClient.js";

async function main() {
  const wsPayload = (await getWorkspaces()).data;
  console.log("active_wid", wsPayload.wid);
  console.log(
    "workspaces",
    wsPayload.workspaces.map((w) => ({
      id: w._id,
      title: w.title,
      active: w.active,
    })),
  );

  const projects = (await getProjectsList()).data.projects;
  console.log("projects_count", projects.length);
  console.log(
    "sample_projects",
    projects.slice(0, 5).map((p) => ({
      id: p._id,
      title: p.title,
      owner: p.owner,
      owner_is_wid: p.owner === wsPayload.wid,
      members_admin: p.members_admin,
    })),
  );

  const users = (await getUsersList()).data.users;
  console.log("users_count", users.length);
  console.log(
    "sample_users",
    users.slice(0, 5).map((u) => ({
      id: u._id,
      name: `${u.first_name} ${u.last_name ?? ""}`.trim(),
      workspace_id: u.workspace_id,
      username: u.username,
    })),
  );

  if (projects[0]) {
    const tasksResp = await getTasksByProjectId(projects[0]._id);
    const tasks = tasksResp.data as unknown;
    console.log("tasks_typeof", typeof tasks, Array.isArray(tasks));
    console.log(
      "tasks_keys",
      tasks && typeof tasks === "object" ? Object.keys(tasks as object) : null,
    );
    const list = Array.isArray(tasks)
      ? tasks
      : ((tasks as { tasks?: unknown[] })?.tasks ?? []);
    console.log("tasks_count", list.length);
    console.log(
      "sample_task",
      list[0]
        ? {
            id: (list[0] as { _id: string })._id,
            title: (list[0] as { title: string }).title,
            project: (list[0] as { project: string }).project,
            owner: (list[0] as { owner: string }).owner,
            assignee: (list[0] as { assignee: string[] }).assignee,
          }
        : null,
    );
  }

  const second = wsPayload.workspaces.find((w) => !w.active) ?? wsPayload.workspaces[1];
  if (second) {
    const tok = (await getWorkspaceToken(second._id)).data.token;
    tokenManager.setToken(tok);
    const p2 = (await getProjectsList()).data.projects;
    const u2 = (await getUsersList()).data.users;
    console.log("after_switch", {
      workspace: second.title,
      wid: second._id,
      projects: p2.length,
      users: u2.length,
      sample_owner: p2[0]?.owner,
      owner_is_new_wid: p2[0]?.owner === second._id,
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
