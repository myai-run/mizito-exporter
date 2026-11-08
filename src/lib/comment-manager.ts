import { ExportedTask, ExportedTaskComment, ExportedUser, TaskComment } from "../types.js";
import { usersManager } from "./users-manager.js";
import { fileManager } from "./file-manager.js";

class CommentManager {
  comments: ExportedTaskComment[] = [];

  async parseComments(comments: TaskComment[], task: ExportedTask): Promise<ExportedTaskComment[]> {
    const exportedComments: ExportedTaskComment[] = [];
    for (const comment of comments) {
      const attachmentUrls: string[] = [];
      for (const attachment of comment.attachments ?? []) {
        const document = attachment.media?.document;
        if (!document) continue;
        const savedPath = await fileManager.download(
          document.content,
          document.content_key,
          document.name,
        );
        if (savedPath) attachmentUrls.push(savedPath);
      }

      exportedComments.push({
        mizito_id: comment._id,
        task,
        content: comment.comment ?? "",
        creator: usersManager.getUserById(comment.comment_owner) ?? null,
        mentioned_users: (comment.mention ?? [])
          .map((userId) => usersManager.getUserById(userId))
          .filter((user): user is ExportedUser => Boolean(user)),
        replied_comment_id: comment.replied_comment_id,
        comment_at: comment.comment_at,
        edited: comment.edited,
        deleted: comment.deleted,
        attachment_url: attachmentUrls,
      });
    }
    return exportedComments;
  }

  async addComments(comments: TaskComment[], task: ExportedTask): Promise<ExportedTaskComment[]> {
    const parsed = await this.parseComments(comments, task);
    this.comments.push(...parsed);
    return parsed;
  }

  getAllCachedComments(): ExportedTaskComment[] {
    const seen = new Set<string>();
    return this.comments.filter((comment) => {
      if (seen.has(comment.mizito_id)) return false;
      seen.add(comment.mizito_id);
      return true;
    });
  }
}

const commentManager = new CommentManager();
export { commentManager };
