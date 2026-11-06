import { ExportedWorkspace, WorkspaceSummary } from "../types.js";

class WorkspaceManager {
    workspaces: ExportedWorkspace[] = []

    parseWorkspaces(workspaces: WorkspaceSummary[]) {
        return  workspaces.map(workspace => ({
            name: workspace.title,
            mizito_id: workspace._id
        }))
    }

    constructor(workspaces: WorkspaceSummary[]){
        this.workspaces = this.parseWorkspaces(workspaces)
    }

    setWorkspaces(workspaces: WorkspaceSummary[]) {
        this.workspaces = this.parseWorkspaces(workspaces)
    }

    getWorkspaceByID(id: string): ExportedWorkspace {
        return this.workspaces.filter(workspace => workspace.mizito_id === id)?.[0]
    }
}

const workspaceManager = new WorkspaceManager([])
export {
    workspaceManager
}