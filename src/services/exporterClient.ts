import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { TokenManager } from "../lib/token-manager.js";

const MIZITO_BASE_URL = "https://app.mizito.ir"
const DL_BASE_URL = "https://cdn1.mizito.ir/cdn/dl"
const MIZITO_TOKEN = process.env.INITIAL_TOKEN ?? ""
const MAX_RETRIES = 3

export const tokenManager = new TokenManager(MIZITO_TOKEN)

// Retries requests that failed at the network level (no HTTP response), e.g. socket hang ups.
const withNetworkRetry = (instance: AxiosInstance): AxiosInstance => {
    instance.interceptors.response.use(undefined, async (err: AxiosError) => {
        const config = err.config as (InternalAxiosRequestConfig & { retryCount?: number }) | undefined
        if (!config || err.response) return Promise.reject(err)

        config.retryCount = (config.retryCount ?? 0) + 1
        if (config.retryCount > MAX_RETRIES) return Promise.reject(err)

        await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount!))
        return instance(config)
    })
    return instance
}

const exporterClient = () => {
    const instance = axios.create({
        baseURL: MIZITO_BASE_URL
    })

    instance.interceptors.request.use(req => {
        const token = tokenManager.getToken()
        req.headers["x-token"] = token
        return req
    }, err => Promise.reject(err))

    return withNetworkRetry(instance)
}

const dlClient = () => {
    const instance = axios.create({
        baseURL: DL_BASE_URL
    })

    instance.interceptors.request.use(req => req, err => Promise.reject(err))

    return withNetworkRetry(instance)
}

export {
    exporterClient,
    dlClient
};
