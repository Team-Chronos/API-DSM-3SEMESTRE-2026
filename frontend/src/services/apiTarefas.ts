import axios from "axios";

const API_BASE = "/api/tarefas"; 

const apiTarefas = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

apiTarefas.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiTarefas.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiTarefas;