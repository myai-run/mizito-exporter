import { ExportedUser, ExportedTask, Task } from "../types.js";
import { usersManager } from "./users-manager.js";
import { projectManager } from "./project-manager.js";
import { fileManager } from "./file-manager.js";

class TaskManager {
  tasks: ExportedTask[] = [];
  cachedTasks: ExportedTask[] = [];

  async parseTasks(tasks: Task[]): Promise<ExportedTask[]> {
    const exportedTasks: ExportedTask[] = [];
    for (const task of tasks) {
      const project = projectManager.getProjectById(task.project);
      const owner = usersManager.getUserById(task.owner);
      const assignees = (task.assignee ?? [])
        .filter((assigneeId) => assigneeId !== task.owner)
        .map((assigneeId) => usersManager.getUserById(assigneeId))
        .filter((assignee): assignee is ExportedUser => Boolean(assignee));

      const attachmentUrls: string[] = [];
      for (const attachment of task.attachments ?? []) {
        const document = attachment.media?.document;
        if (!document) continue;
        const savedPath = await fileManager.download(
          document.content,
          document.content_key,
          document.name,
        );
        if (savedPath) attachmentUrls.push(savedPath);
      }

      exportedTasks.push({
        mizito_id: task._id,
        title: task.title,
        start_date: task.deadline_start,
        finish_date: task.deadline,
        owner: owner as ExportedUser,
        assignee: assignees,
        workspace: project?.workspace ?? { name: "Unknown Workspace", mizito_id: "" },
        project: project ?? {
          mizito_id: task.project,
          title: "Unknown Project",
          members: [],
          workspace: { name: "Unknown Workspace", mizito_id: "" },
          boards: [],
        },
        board: project?.boards.find((board) => board.mizito_id === task.kanban_board) ?? null,
        attachment_url: attachmentUrls,
        comments: [],
      });
    }
    return exportedTasks;
  }

  async setTasks(tasks: Task[]): Promise<ExportedTask[]> {
    this.cachedTasks = [...this.cachedTasks, ...this.tasks];
    this.tasks = await this.parseTasks(tasks);
    return this.tasks;
  }

  getAllCachedTasks(): ExportedTask[] {
    const seen = new Set<string>();
    return [...this.cachedTasks, ...this.tasks].filter((task) => {
      if (seen.has(task.mizito_id)) return false;
      seen.add(task.mizito_id);
      return true;
    });
  }
}

const taskManager = new TaskManager();
export { taskManager };
