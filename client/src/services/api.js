// src/services/api.js
import axios from "axios";

// URL da API - usar localhost:3001 como padrão se não estiver definida
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const API = axios.create({
  baseURL: API_URL,
  // Não definir Content-Type padrão para permitir multipart/form-data
});

// Interceptor para debug
API.interceptors.request.use(
  (config) => {
    console.log('🚀 Requisição sendo enviada:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

export default API;
