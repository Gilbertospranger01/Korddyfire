// utils/api.ts
import axios, { AxiosInstance, AxiosResponse } from "axios";

export interface ApiErrorResponse {
  detail?: string;
  error?: string;
  message?: string;
  [key: string]: string | string[] | undefined;
}

const API_BASE = "https://korddyfirebases.onrender.com/api/v1/";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  withCredentials: true, // permite enviar cookies
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => config, // sem token manual, cookie será enviado automaticamente
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
);

export default api;