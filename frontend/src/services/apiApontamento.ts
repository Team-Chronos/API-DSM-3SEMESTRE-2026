import axios from "axios";

const GATEWAY_URL = "http://localhost:8080"; 

const apiApontamento = axios.create({
  baseURL: `${GATEWAY_URL}/apontamento`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiApontamento.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiApontamento.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiApontamento;
