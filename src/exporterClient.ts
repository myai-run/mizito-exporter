import axios from "axios";
import { TokenManager } from "./token-manager.js";

const MIZITO_BASE_URL = "https://app.mizito.ir"
const DL_BASE_URL = "https://cdn1.mizito.ir/cdn/dl"
const MIZITO_TOKEN = ""

export const tokenManager = new TokenManager(MIZITO_TOKEN)

const exporterClient = () => {
    const instance = axios.create({
        baseURL: MIZITO_BASE_URL
    })

    instance.interceptors.request.use(req => {
        const token = tokenManager.getToken()
        req.headers["x-token"] = token
        return req
    }, err => Promise.reject(err))

    return instance
}

const dlClient = () => {
    const instance = axios.create({
        baseURL: DL_BASE_URL
    })

    instance.interceptors.request.use(req => req, err => Promise.reject(err))

    return instance
}

export {
    exporterClient,
    dlClient
};