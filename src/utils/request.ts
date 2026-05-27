import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// // 请求拦截器
// service.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => Promise.reject(error)
// )

// // 响应拦截器
// service.interceptors.response.use(
//   (response: AxiosResponse) => {
//     const res = response.data
//     if (res.code !== 200) {
//       ElMessage.error(res.message || 'Error')
//       return Promise.reject(new Error(res.message || 'Error'))
//     }
//     return res
//   },
//   (error) => {
//     ElMessage.error(error.message || 'Request Error')
//     return Promise.reject(error)
//   }
// )

// 封装通用请求方法
export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service(config)
}

// 封装GET请求
export function get<T = any>(url: string, params?: object): Promise<T> {
  return request({ method: 'get', url, params })
}

// 封装POST请求 
export function post<T = any>(url: string, data?: object, headers?: AxiosRequestConfig['headers']): Promise<T> {
  return request({ method: 'post', url, data, headers })
}
