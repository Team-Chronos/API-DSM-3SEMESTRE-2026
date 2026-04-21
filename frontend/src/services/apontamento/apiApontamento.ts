import axios from "axios";

const apiApontamento = axios.create({
  baseURL: "http://localhost:8082", 
});

export default apiApontamento