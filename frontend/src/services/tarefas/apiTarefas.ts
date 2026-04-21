import axios from "axios";

const apiTarefas = axios.create({
  baseURL: "http://localhost:8089", 
});

export default apiTarefas