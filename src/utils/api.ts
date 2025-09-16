import axios, { AxiosError } from "axios";

export type ApiErrorResponse = {
  error: string;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/",
  withCredentials: true, // cookies cross-domain
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Remover Content-Type para upload multipart/form-data
  if (config.headers && config.headers["Content-Type"] === "multipart/form-data") {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;