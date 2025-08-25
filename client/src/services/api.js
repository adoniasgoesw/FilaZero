// src/servers/API.js
import axios from "axios";

// URL da API definida no .env.*
// Exemplo: import.meta.env.VITE_API_URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
