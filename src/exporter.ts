import {
  getComments,
  getProjectsList,
  getTasksByProjectId,
  getUsersList,
  getWorkspaces,
  getWorkspaceToken,
} from "./services/api.js";
import type { ExportedTask, Task, WorkspaceSummary } from "./types.js";
import { usersManager } from "./lib/users-manager.js";
import { workspaceManager } from "./lib/workspace-manager.js";
import { projectManager } from "./lib/project-manager.js";
import { taskManager } from "./lib/task-manager.js";
import { commentManager } from "./lib/comment-manager.js";
import { tokenManager } from "./services/exporterClient.js";
import {
  createCommentExcel,
  createProjectExcel,
  createTaskExcel,
  createUserExcel,
  createWorkspaceExcel,
} from "./utils/excel-utils.js";

const getWorkspaceList = async (): Promise<WorkspaceSummary[]> => {
  const resp = await getWorkspaces();
  return resp?.data?.workspaces ?? [];
};

const switchToWorkspace = async (workspaceId: string): Promise<void> => {
  const resp = await getWorkspaceToken(workspaceId);
  const token = resp?.data?.token;
  if (!token) {
    throw new Error(`No token returned when switching to workspace ${workspaceId}`);
  }
  tokenManager.setToken(token);
};

const processTaskComments = async (task: Task, exportedTask: ExportedTask): Promise<void> => {
  if (task.has_comments === false && !task.has_comments_with_deleted) return;
  try {
    const commentsResponse = await getComments(task.access_token);
    const comments = Array.isArray(commentsResponse.data) ? commentsResponse.data : [];
    exportedTask.comments = await commentManager.addComments(comments, exportedTask);
  } catch (e) {
    console.log(`Fetching comments failed (${task.title}): `, (e as Error).message);
  }
};

const processWorkspace = async (workspace: WorkspaceSummary): Promise<void> => {
  console.log(`-- Processing workspace: ${workspace.title} (${workspace._id}) --`);
  await switchToWorkspace(workspace._id);

  const usersResponse = await getUsersList();
  await usersManager.setUsers(usersResponse.data.users, workspace._id);

  const projectsResponse = await getProjectsList();
  const workSpaceProjects = projectsResponse?.data?.projects ?? [];
  console.log(`   projects: ${workSpaceProjects.length}`);
  projectManager.setProjects(workSpaceProjects, workspace._id);

  for (const project of workSpaceProjects) {
    const tasksResponse = await getTasksByProjectId(project._id);
    const tasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
    console.log(`   tasks in "${project.title}": ${tasks.length}`);
    const exportedTasks = await taskManager.setTasks(tasks);

    for (let i = 0; i < tasks.length; i++) {
      await processTaskComments(tasks[i], exportedTasks[i]);
    }
  }
};

export const startTheExtraction = async () => {
  console.log("Process Started --");

  const workspaces = await getWorkspaceList();
  workspaceManager.setWorkspaces(workspaces);
  createWorkspaceExcel(workspaceManager.workspaces);

  for (const workspace of workspaces) {
    try {
      await processWorkspace(workspace);
    } catch (e) {
      console.log(`Processing workspace failed (${workspace.title}): `, e);
    }
  }

  createUserExcel(usersManager.getAllCachedUsers());
  createProjectExcel(projectManager.getAllCachedProjects());
  createTaskExcel(taskManager.getAllCachedTasks());
  createCommentExcel(commentManager.getAllCachedComments());

  console.log("Process Ended --");
};
