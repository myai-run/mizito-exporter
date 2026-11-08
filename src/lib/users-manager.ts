import { ExportedUser, User } from "../types.js";
import { workspaceManager } from "./workspace-manager.js";
import { fileManager } from "./file-manager.js";

class UsersManager {
  users: ExportedUser[] = [];
  cachedUsers: ExportedUser[] = [];

  async parseUsers(mizitoUsers: User[], workspaceId?: string): Promise<ExportedUser[]> {
    const users: ExportedUser[] = [];
    for (const user of mizitoUsers) {
      const photo = user.photo?.photo_large ?? user.photo?.photo_medium;
      users.push({
        phone: user.username ?? "",
        fullname: `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim(),
        mizito_id: user._id,
        workspace:
          workspaceManager.getWorkspaceByID(user.workspace_id ?? workspaceId ?? "") ?? null,
        profile_url: photo ? await fileManager.download(photo.content, photo.content_key) : "",
      });
    }
    return users;
  }

  async setUsers(mizitoUsers: User[], workspaceId?: string) {
    this.cachedUsers = [...this.cachedUsers, ...this.users];
    this.users = await this.parseUsers(mizitoUsers, workspaceId);
  }

  getAllCachedUsers(): ExportedUser[] {
    const seen = new Set<string>();
    return [...this.cachedUsers, ...this.users].filter((user) => {
      const key = `${user.mizito_id}:${user.workspace?.mizito_id ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  getUserById(id: string): ExportedUser | undefined {
    // Prefer an exact id match from the most recently processed workspace batch.
    return (
      this.users.find((user) => user.mizito_id === id) ??
      [...this.cachedUsers].reverse().find((user) => user.mizito_id === id)
    );
  }
}

const usersManager = new UsersManager();
export { usersManager };
