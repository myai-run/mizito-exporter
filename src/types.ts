/* ============================================================================
 * Mizito — shared domain types
 * Covers: Users, Projects, Tasks
 * ==========================================================================*/

/* ----------------------------------------------------------------------------
 * Shared primitives
 * --------------------------------------------------------------------------*/

export type ObjectId = string;
export type ISODateString = string;
export type UserStatusKind = "userStatusOnline" | "userStatusOffline";

/* ----------------------------------------------------------------------------
 * Users
 * --------------------------------------------------------------------------*/

export interface PhotoVariant {
  content: string;
  w: number;
  h: number;
  size: number;
  content_key: string;
}

export interface UserPhoto {
  photo_large?: PhotoVariant;
  photo_medium?: PhotoVariant;
}

export interface UserStatus {
  _: UserStatusKind;
  was_online?: ISODateString;
}

export interface WorkStatus {
  last_working_on_title?: string | null;
  last_working_on_date?: ISODateString | null;
}

export interface User {
  _id: ObjectId;
  first_name: string;
  last_name?: string;
  photo?: UserPhoto;
  status: UserStatus;
  role: number;
  email?: string;
  phone?: string;
  username?: string;
  work_status: WorkStatus;
  online_status_mode: number;
  online_status_text?: string;
  workspace_role_name?: string;
  workspace_id?: ObjectId;
  deleted: boolean;
  invited: boolean;
  guest_contacts: boolean;
  birthdate?: ISODateString;
}

export interface UserStatusOrder {
  user_id: ObjectId;
  order: number;
}

export interface UsersPayload {
  users: User[];
  user_status: UserStatusOrder[];
}

/* ----------------------------------------------------------------------------
 * Projects
 * --------------------------------------------------------------------------*/

export type ProjectColor =
  | "grey"
  | "light-blue"
  | "purple"
  | "brown"
  | "green"
  | "blue"
  | "red"
  | "red-dark"
  | "orange";

export type KanbanColor =
  | "green2"
  | "green"
  | "yellow"
  | "orange"
  | "blue"
  | "purple"
  | "brown"
  | "red-dark"
  | "light-blue";

export type AutomationStatus = "off" | "on";

export interface KanbanBoard {
  _id: ObjectId;
  title: string;
  color: KanbanColor;
}

export interface Project {
  _id: ObjectId;
  title: string;
  owner: ObjectId;
  color: ProjectColor;
  deleted: boolean;
  labels: ObjectId[];
  is_advanced: boolean;
  members_admin?: ObjectId[];
  gantt_viewers?: ObjectId[];
  monitoring_viewers?: ObjectId[];
  advanced_tasks_edit_only_admins?: boolean | null;
  advanced_duplicate_confirm?: boolean | null;
  advanced_public_create_task?: boolean | null;
  advanced_tasks_has_weight?: boolean | null;
  advanced_project_summary_with_weight?: boolean;
  advanced_tasks_prevent_snooze_by_users?: boolean | null;
  advanced_minutes?: number | boolean | null;
  advanced_has_deadline?: boolean | null;
  advanced_support_gantt?: boolean | null;
  advanced_support_automation_status?: AutomationStatus;
  kanban_boards: KanbanBoard[];
  kanban_boards_processed: boolean;
  dialog: ObjectId;
  archived: boolean;
}

export interface ProjectStatus {
  project_id: ObjectId;
  order: number;
}

export interface ProjectsPayload {
  projects: Project[];
  project_status: ProjectStatus[];
}

export interface ProjectBase {
  _id: ObjectId;
  title: string;
  owner: ObjectId;
  color: ProjectColor;
  deleted: boolean;
  labels: ObjectId[];
  members_admin?: ObjectId[];
  gantt_viewers?: ObjectId[];
  monitoring_viewers?: ObjectId[];
  kanban_boards: KanbanBoard[];
  kanban_boards_processed: boolean;
  dialog: ObjectId;
  archived: boolean;
}

export interface AdvancedProject extends ProjectBase {
  is_advanced: true;
  advanced_tasks_edit_only_admins?: boolean | null;
  advanced_duplicate_confirm?: boolean | null;
  advanced_public_create_task?: boolean | null;
  advanced_tasks_has_weight?: boolean | null;
  advanced_project_summary_with_weight?: boolean;
  advanced_tasks_prevent_snooze_by_users?: boolean | null;
  advanced_minutes?: number | boolean | null;
  advanced_has_deadline?: boolean | null;
  advanced_support_gantt?: boolean | null;
  advanced_support_automation_status?: AutomationStatus;
}

export interface BasicProject extends ProjectBase {
  is_advanced: false;
}

export type ProjectUnion = AdvancedProject | BasicProject;

/* ----------------------------------------------------------------------------
 * Tasks
 * --------------------------------------------------------------------------*/

export interface MessageDocument {
  _id: ObjectId;
  name: string;
  content: string;
  size: number;
  content_key: string;
}

export interface MessageMediaDocument {
  _: "messageMediaDocument";
  document: MessageDocument;
}

export interface TaskAttachment {
  _id: ObjectId;
  media: MessageMediaDocument;
}

export interface ChecklistItem {
  _id: ObjectId;
  checked: boolean;
  title: string;
  checked_at?: ISODateString;
  checked_by?: ObjectId;
}

export interface TaskComment {
  _id: ObjectId;
  comment: string;
  attachments: TaskAttachment[];
  mention: ObjectId[];
  replied_comment_id: ObjectId | null;
  comment_at: ISODateString;
  comment_owner: ObjectId;
  edited: boolean;
  deleted: boolean;
  can_edit?: boolean;
}

export interface TaskCustomParam {
  [key: string]: unknown;
}

export interface Task {
  _id: ObjectId;
  title: string;
  notes: string;
  owner: ObjectId;
  assignee: ObjectId[];
  assignee_last: ObjectId[];
  responsible: ObjectId | null;
  progress: number;
  created_at: ISODateString;
  modified_at: ISODateString;
  completed_by: ObjectId[];
  completed_at: ISODateString | null;
  alarm_options: null;
  project: ObjectId;
  labels: ObjectId[];
  attachments: TaskAttachment[];
  has_attachments: boolean;
  is_repeat: null;
  is_repeat_child: boolean;
  alarm_at: ISODateString | null;
  sort_date: ISODateString | null;
  deadline_used: boolean;
  has_deadline: boolean;
  has_deadline_start: boolean;
  deadline_start?: ISODateString | null;
  deadline?: ISODateString | null;
  deleted: boolean;
  kanban_board: ObjectId;
  kanban_weight: number;
  checklist: ChecklistItem[];
  dialog: ObjectId;
  dialog_message: ObjectId;
  in_minute: boolean;
  completed: boolean;
  custom_params?: TaskCustomParam[];
  has_workflow: boolean;
  is_form_request: boolean;
  access_token: string;
  last_comment?: TaskComment;
  has_comments?: boolean;
  has_comments_with_deleted?: boolean;
}

export type TasksPayload = Task[];

/* ============================================================================
 * Workspace types
 * Mirrors the `workspace` / session payload.
 * ==========================================================================*/

/** Accent/wallpaper identifiers used by the workspace dashboard. */
export type WorkspaceWallpaper = "back-pattern" | (string & {});

/** A workspace entry in the user's workspace switcher. */
export interface WorkspaceSummary {
  _id: ObjectId;
  title: string;
  /** Whether this is the currently-selected workspace. */
  active: boolean;
}

/** Per-user UI preferences scoped to the workspace context. */
export interface WorkspaceOptions {
  support_btn_used: boolean;
  totp_intro_seen: boolean;
  hide_dashboard_workspaces: boolean;
}

/** The full authenticated user + workspace context payload. */
export interface WorkspacePayload {
  /** User `_id` (the authenticated user). */
  uid: ObjectId;
  /** Currently-active workspace `_id`. */
  wid: ObjectId;

  verified: boolean;
  phone: string;

  /* ---- Plan / billing flags ---- */
  plan_upgrade_need: boolean;
  plan_is_demo: boolean;
  plan_ds_near_ex: boolean;
  plan_ds_ex: boolean;
  plan_storage_almost_full: boolean;
  is_enterprise_plan: boolean;
  is_guest: boolean;
  remain_days: number;

  dashboard_admin_message: string;

  user_register_date: ISODateString;
  workspace_create_date: ISODateString;

  access_workspace_role_names: boolean;
  wallpaper: WorkspaceWallpaper;
  options: WorkspaceOptions;

  workspaces: WorkspaceSummary[];

  client_version: string;

  /* ---- Access flags ---- */
  access_project_creator: boolean;
  access_chat_group_creator: boolean;
  access_crm_creator: boolean;
  access_admin: boolean;
}

// -- Exported data types
export interface ExportedWorkspace{
  name: string;
  mizito_id: string;
}

export interface ExportedUser{
  phone: string;
  fullname: string
  mizito_id: string;
  workspace: ExportedWorkspace | null;
  profile_url: string;
}

export interface ExportedTaskComment{
  mizito_id: string;
  task: ExportedTask;
  content: string;
  creator: ExportedUser | null;
  mentioned_users: ExportedUser[];
  replied_comment_id: string | null;
  comment_at: string;
  edited: boolean;
  deleted: boolean;
  attachment_url: string[];
}

export interface ExportedBoard{
  mizito_id: string;
  title: string;
}

export interface ExportedTask {
  mizito_id: string;
  workspace: ExportedWorkspace;
  project: ExportedProject;
  board: ExportedBoard | null;
  title: string;
  start_date: string | null | undefined;
  finish_date: string | null | undefined;
  assignee: ExportedUser[];
  owner: ExportedUser;
  attachment_url: string[];
  comments: ExportedTaskComment[];
}

export interface ExportedProject{
  mizito_id: string;
  title: string;
  members: ExportedUser[];
  workspace: ExportedWorkspace;
  boards: ExportedBoard[];
}