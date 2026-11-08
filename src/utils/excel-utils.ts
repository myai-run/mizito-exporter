import * as XLSX from "xlsx/xlsx.mjs";
import {
  ExportedWorkspace,
  ExportedUser,
  ExportedTask,
  ExportedProject,
  ExportedTaskComment,
} from "../types.js";
import path from "path";

export const createExcelFile = (
  data: (string | number)[][],
  fileName: string,
  sheetName: string,
): void => {
  const outputPath = path.resolve(process.cwd(), "exported-data", `${fileName}.xlsx`);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  try {
    XLSX.writeFile(wb, outputPath);
  } catch (e) {
    console.log(`Writing ${outputPath} failed (is it open in Excel?): `, (e as Error).message);
  }
};

export const createWorkspaceExcel = (workspaces: ExportedWorkspace[]): void => {
  const data: (string | number)[][] = [
    ["Name", "Mizito ID"],
    ...workspaces.map((workspace) => [workspace.name, workspace.mizito_id]),
  ];
  createExcelFile(data, "workspaces", "Workspaces");
  console.log(`Workspace file created (${workspaces.length} rows).`);
};

export const createUserExcel = (users: ExportedUser[]): void => {
  const data: (string | number)[][] = [
    ["Phone", "Full Name", "Mizito ID", "Workspace", "Profile URL"],
    ...users.map((user) => [
      user.phone,
      user.fullname,
      user.mizito_id,
      user.workspace?.name ?? "",
      user.profile_url,
    ]),
  ];
  createExcelFile(data, "users", "Users");
  console.log(`User file created (${users.length} rows).`);
};

export const createProjectExcel = (projects: ExportedProject[]): void => {
  const data: (string | number)[][] = [
    ["Title", "Members", "Workspace", "Boards", "Mizito ID"],
    ...projects.map((project) => [
      project.title,
      project.members.map((member) => member.fullname).join(", "),
      project.workspace?.name ?? "",
      project.boards.map((board) => board.title).join(", "),
      project.mizito_id,
    ]),
  ];
  createExcelFile(data, "projects", "Projects");
  console.log(`Project file created (${projects.length} rows).`);
};

export const createTaskExcel = (tasks: ExportedTask[]): void => {
  const data: (string | number)[][] = [
    [
      "Title",
      "Project",
      "Board",
      "Workspace",
      "Owner",
      "Assignees",
      "Start Date",
      "Finish Date",
      "Attachment URLs",
      "Comments",
      "Mizito ID",
    ],
    ...tasks.map((task) => [
      task.title,
      task.project?.title ?? "",
      task.board?.title ?? "",
      task.workspace?.name ?? "",
      task.owner?.fullname ?? "",
      task.assignee.map((user) => user.fullname).join(", "),
      task.start_date ?? "",
      task.finish_date ?? "",
      task.attachment_url.join("\n"),
      task.comments.length,
      task.mizito_id,
    ]),
  ];
  createExcelFile(data, "tasks", "Tasks");
  console.log(`Task file created (${tasks.length} rows).`);
};

export const createCommentExcel = (comments: ExportedTaskComment[]): void => {
  const data: (string | number)[][] = [
    [
      "Comment",
      "Author",
      "Task",
      "Project",
      "Workspace",
      "Mentioned Users",
      "Commented At",
      "Reply To",
      "Edited",
      "Deleted",
      "Attachment URLs",
      "Task Mizito ID",
      "Mizito ID",
    ],
    ...comments.map((comment) => [
      comment.content,
      comment.creator?.fullname ?? "",
      comment.task.title,
      comment.task.project?.title ?? "",
      comment.task.workspace?.name ?? "",
      comment.mentioned_users.map((user) => user.fullname).join(", "),
      comment.comment_at,
      comment.replied_comment_id ?? "",
      comment.edited ? "Yes" : "No",
      comment.deleted ? "Yes" : "No",
      comment.attachment_url.join("\n"),
      comment.task.mizito_id,
      comment.mizito_id,
    ]),
  ];
  createExcelFile(data, "comments", "Comments");
  console.log(`Comment file created (${comments.length} rows).`);
};
