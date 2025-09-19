import axios, { AxiosError } from "axios";

export type ApiErrorResponse = {
  error: string;
};

const api = axios.create({
  baseURL: "https://korddyfirebases.onrender.com/api/v1/",
  withCredentials: true, // cookies cross-domain
  headers: {
    Accept: "application/json", // mantém só Accept
  },
});

// Interceptor para remover Content-Type apenas quando for upload
api.interceptors.request.use((config) => {
  // Detecta se é um FormData
  if (config.data instanceof FormData) {
    // Deixa o browser definir o Content-Type correto com boundary
    if (config.headers) {
      delete config.headers["Content-Type"];
    }
  } else {
    // Para JSON, adiciona
    if (config.headers) config.headers["Content-Type"] = "application/json";
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