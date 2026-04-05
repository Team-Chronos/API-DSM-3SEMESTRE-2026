import Axios from "axios";

export const ApiTarefas = Axios.create({
  baseURL: "http://localhost:8089",
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ApiUsuarios = Axios.create({
  baseURL: "http://localhost:8089", 
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

export default ApiTarefas;