import { tokenManager } from "./services/exporterClient.js";
import { getProjectsList, getTasksByProjectId, getUsersList, getWorkspaces, getWorkspaceToken } from "./services/api.js"
import type { WorkspaceSummary } from "./types.js"
import { workspaceManager } from "./lib/workspace-manager.js";

const getWorkspaceList = async (): Promise<WorkspaceSummary[]> => {
    const resp = await getWorkspaces()
    return resp?.data?.workspaces;
}

const processWorkspace = async (_workspace_id: string): Promise<void> => {
    const resp = await getProjectsList();
    console.log("-- Project List --")
    // console.log(resp.data)
    const workSpaceProjects = resp?.data?.projects
    for(let i=0; i < workSpaceProjects.length; i++){
        const tasksResponse = await getTasksByProjectId(workSpaceProjects[i]._id)
        console.log("-- Tasks List --")
        console.log(tasksResponse.data)
    }
    // console.log(resp.data)
    // TODO: extract users/projects/tasks for this workspace

}

export const startTheExtraction = async () => {
    console.log("Process Started --")
    // first call getWorkspaces with the user's initial token, the active workspace is going to have active:true
    const workspaces = await getWorkspaceList();
    workspaceManager.setWorkspaces(workspaces)
    const { data: usersData } = await getUsersList()
    console.log(usersData)
    
    // upon going to the other workspace, call getWorkspace token with the previous token and the workspace id, get the new token and do the extraction
    // for(let i=0; i < workspaces.length; i++){
    //     try{
    //         await processWorkspace(workspaces[i]._id)
    //     }catch(e){
    //         console.log("Processing workspace failed: ", e)
    //     }finally{
    //         if(i == workspaces.length - 1) return;
    //         const resp = await getWorkspaceToken(workspaces[i+1]._id)
    //         const newWorkspaceToken = resp?.data?.token
    //         tokenManager.setToken(newWorkspaceToken)
    //     }
    // }

    

    // when list is finished, just log the finish process
    console.log("Process Ended --")
}