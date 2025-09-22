import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

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
  withCredentials: true, // permite envio de cookies cross-domain
  headers: {
    Accept: "application/json",
  },
});

// Interceptor para ajustar Content-Type
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // deixa o browser definir o Content-Type correto
    if (config.headers) delete config.headers["Content-Type"];
  } else {
    if (config.headers) config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Interceptor de resposta com tipagem de erro
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    return Promise.reject(error.response?.data || { error: error.message });
  }
);

export default api;