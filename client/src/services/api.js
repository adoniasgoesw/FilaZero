// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Função para fazer requisições HTTP
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // Adicionar Content-Type apenas se não for FormData
  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Adicionar token de autenticação se existir e garantir persistência "para sempre"
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    try {
      // Renovar a presença do token para manter sessão viva no navegador
      localStorage.setItem('token', token);
    } catch {
      // ignore persistence errors
    }
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
};

// Métodos HTTP padrão
const api = {
  get: async (endpoint) => {
    return apiRequest(endpoint, { method: 'GET' });
  },
  
  post: async (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },
  
  put: async (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },
  
  delete: async (endpoint) => {
    return apiRequest(endpoint, { method: 'DELETE' });
  }
};

// Função de login
export const login = async (credentials) => {
  return apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// Função para salvar dados de autenticação
export const setAuthData = (token, usuario) => {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
};

// Função para buscar sugestões de imagens
export const buscarImagens = async (query) => {
  if (!query || query.trim().length < 2) {
    return { success: true, imagens: [] };
  }
  
  return apiRequest(`/buscar-imagens?q=${encodeURIComponent(query.trim())}`, {
    method: 'GET',
  });
};

export default api;
