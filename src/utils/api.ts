import axios, { AxiosError } from "axios";

export type ApiErrorResponse = {
  error: string;
};

const api = axios.create({
  baseURL: "https://korddyfirebases.onrender.com/api/v1/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});

api.interceptors.request.use((config) => {
  const isUpload = config.headers["Content-Type"] === "multipart/form-data";
  if (isUpload) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.request.responseType === "blob") {
      return response;
    }
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    return Promise.reject(error);
  }
);

export default api;
