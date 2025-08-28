// src/services/api.js
import axios from "axios";
import logger from '../utils/logger.js';

// URL da API - usar localhost:3001 como padrão se não estiver definida
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

logger.info('Configuração da API carregada', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_URL: API_URL,
  MODE: import.meta.env.MODE
});

const API = axios.create({
  baseURL: API_URL,
  // Não definir Content-Type padrão para permitir multipart/form-data
  timeout: 30000, // Timeout de 30 segundos
});

// Interceptor para debug
API.interceptors.request.use(
  (config) => {
    logger.debug('Requisição sendo enviada', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    logger.error('Erro na requisição', error);
    return Promise.reject(error);
  }
);

// Interceptor para resposta
API.interceptors.response.use(
  (response) => {
    logger.debug('Resposta recebida', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    logger.error('Erro na resposta', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default API;
