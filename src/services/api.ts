import type { AxiosResponse } from "axios"
import { exporterClient, dlClient } from "./exporterClient.js"
import type { Project, Task, TaskComment, User, WorkspacePayload } from "../types.js"

export const getWorkspaceToken = async (workspace_id: string): Promise<AxiosResponse<{ token: string }>>  => {
    return exporterClient().post("/api/workspace/switch", { workspace_id })
}

export const getWorkspaces = async (): Promise<AxiosResponse<WorkspacePayload>>  => {
    return exporterClient().post("/api/workspace/userid")
}

export const getComments = async (taskAccessToken: string): Promise<AxiosResponse<TaskComment[]>>  => {
    return exporterClient().post("/api/tasks/getComments", { token: taskAccessToken })
}


export const getUsersList = async (): Promise<AxiosResponse<{ users: User[] }>>  => {
    return exporterClient().post("/api/workspace/getUsers")
}

export const getProjectsList = async (): Promise<AxiosResponse<{ projects: Project[] }>>  => {
    return exporterClient().post("/api/projects/getList")
}

export const getTasksByProjectId = async (project_id: string): Promise<AxiosResponse<Task[]>>  => {
    return exporterClient().post("/api/tasks/upcoming", { kanban: true, project_id })
}

export const getDownloadIdentifierByContent = async (content: string): Promise<AxiosResponse<string>>  => {
    return exporterClient().post("/api/content/getDownloadLink", { content })
}

export const getFileByIdentifier = async (identifier: string): Promise<AxiosResponse<ArrayBuffer>>  => {
    return dlClient().get(`/${identifier}`, { responseType: "arraybuffer" })
}
