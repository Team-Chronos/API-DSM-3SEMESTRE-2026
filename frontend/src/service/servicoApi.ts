import Axios from "axios";

export const ApiTarefas = Axios.create({
  baseURL: "http://localhost:8089",
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< Updated upstream
export const ApiUsuarios = Axios.create({
  baseURL: "http://localhost:8089", 
  headers: {
    'Content-Type': 'application/json',
  },
});
=======
import type { AxiosInstance } from "axios";

const setupInterceptors = (client: AxiosInstance): AxiosInstance => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
  return client;
};
>>>>>>> Stashed changes

export const ApiResponsaveis = Axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    'Content-Type': 'application/json',
  },
});

export default ApiTarefas;