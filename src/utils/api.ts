import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/",
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

api.interceptors.response.use((response) => {
  if (response.request.responseType === "blob") {
    return response;
  }
  return response;
});

export default api;
