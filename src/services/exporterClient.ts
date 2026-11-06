import axios from "axios";
import { TokenManager } from "../lib/token-manager.js";

const MIZITO_BASE_URL = "https://app.mizito.ir"
const DL_BASE_URL = "https://cdn1.mizito.ir/cdn/dl"
const MIZITO_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMGE1NDRlYS0wNDlmLTRmYWEtOTliYS0wNjQxOTE3ZTE0ZjYiLCJpYXQiOjE3OTM5OTM1OTF9.Jyh84hHLhyWWWFmuUDJnX5yhJSIW0wG6eYH3Hhn8gK8"

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