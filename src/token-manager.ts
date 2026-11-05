export class TokenManager {
    token: string | null = null

    constructor(initialToken: string){
        this.token = initialToken
    }

    setToken(token: string){
        this.token = token
    }

    getToken(){
        return this.token;
    }
}