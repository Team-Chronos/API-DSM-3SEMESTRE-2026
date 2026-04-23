import Axios from "axios";

const GATEWAY_URL = "http://localhost:8080";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
  Axios.create({
    baseURL: GATEWAY_URL,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const ApiTarefas = setupInterceptors(
  Axios.create({
    baseURL: `${GATEWAY_URL}/tarefas`,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const ApiProjeto = setupInterceptors(
  Axios.create({
    baseURL: `${GATEWAY_URL}/projeto`,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const ApiResponsaveis = setupInterceptors(
  Axios.create({
    baseURL: `${GATEWAY_URL}/profissionais`,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const ApiLogin = setupInterceptors(
  Axios.create({
    baseURL: `${GATEWAY_URL}/login`,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export default ApiGateway;
