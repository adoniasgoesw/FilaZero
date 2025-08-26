// src/services/api.js
import axios from "axios";

// URL da API - usar localhost:3001 como padrão se não estiver definida
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
