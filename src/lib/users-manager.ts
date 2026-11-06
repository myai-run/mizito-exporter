import { ExportedUser, User } from "../types.js";

class UsersManager {
    users: ExportedUser[] = []

    parseUsers(mizitoUsers: User[]) {
        return  mizitoUsers.map(user => ({
            name: user.username ?? "",
            mizito_id: user._id
        }))
    }

    constructor(mizitoUsers: User[]){
        this.users = this.parseUsers(mizitoUsers)
    }

    setUsers(mizitoUsers: User[]) {
        this.users = this.parseUsers(mizitoUsers)
    }
}

const usersManager = new UsersManager([])
export {
    usersManager
}