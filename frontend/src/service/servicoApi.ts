import axios from "axios";

const PROXY_BASE = "/api"; 

const setupInterceptors = (client: any) => {
  client.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
  return client;
};

export const ApiGateway = setupInterceptors(
  axios.create({
    baseURL: PROXY_BASE,
    headers: { "Content-Type": "application/json" },
  })
);

export const ApiTarefas = ApiGateway;
export const ApiProjeto = ApiGateway;
export const ApiLogin = ApiGateway;
export const ApiProfissionais = ApiGateway;

export default ApiGateway;