import { ExportedProject, Project, ExportedUser } from "../types.js";
import { usersManager } from "./users-manager.js";
import { workspaceManager } from "./workspace-manager.js";

class ProjectManager {
  projects: ExportedProject[] = [];
  cachedProjects: ExportedProject[] = [];

  parseProjects(projects: Project[], workspaceId: string): ExportedProject[] {
    const workspace =
      workspaceManager.getWorkspaceByID(workspaceId) ?? {
        name: "Unknown Workspace",
        mizito_id: workspaceId,
      };

    return projects.map((project) => ({
      mizito_id: project._id,
      title: project.title,
      members: (project.members_admin ?? [])
        .map((memberId) => usersManager.getUserById(memberId))
        .filter((member): member is ExportedUser => Boolean(member)),
      workspace,
      boards: (project.kanban_boards ?? []).map((board) => ({
        mizito_id: board._id,
        title: board.title,
      })),
    }));
  }

  constructor(projects: Project[]) {
    this.projects = projects.length ? this.parseProjects(projects, "") : [];
  }

  setProjects(projects: Project[], workspaceId: string) {
    this.cachedProjects = [...this.cachedProjects, ...this.projects];
    this.projects = this.parseProjects(projects, workspaceId);
  }

  getAllCachedProjects(): ExportedProject[] {
    const seen = new Set<string>();
    return [...this.cachedProjects, ...this.projects].filter((project) => {
      if (seen.has(project.mizito_id)) return false;
      seen.add(project.mizito_id);
      return true;
    });
  }

  getProjectById(id: string): ExportedProject | undefined {
    return this.getAllCachedProjects().find((project) => project.mizito_id === id);
  }
}

const projectManager = new ProjectManager([]);
export { projectManager };
