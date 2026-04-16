import Axios from "axios";

export const ApiTarefas = Axios.create({
  baseURL: "http://localhost:8089",  
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ApiProjeto = Axios.create({
  baseURL: "http://localhost:8084",  
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ApiResponsaveis = Axios.create({
  baseURL: "http://localhost:8081",  
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ApiLogin = Axios.create({
  baseURL: "http://localhost:8083",  
  headers: {
    'Content-Type': 'application/json',
  },
});

export default ApiTarefas;