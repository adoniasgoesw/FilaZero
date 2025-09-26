import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import api from '../services/api';
import { 
  emitProdutoEvent, 
  emitCategoriaEvent, 
  emitClienteEvent, 
  emitPagamentoEvent, 
  emitCaixaEvent, 
  emitComplementoEvent,
  CACHE_EVENTS 
} from '../services/cacheEvents';

const CacheContext = createContext();

// Tipos de cache
const CACHE_TYPES = {
  PRODUTOS: 'produtos',
  CATEGORIAS: 'categorias',
  CLIENTES: 'clientes',
  PAGAMENTOS: 'pagamentos',
  CAIXAS: 'caixas',
  HISTORICO_PEDIDOS: 'historico_pedidos',
  HISTORICO_PAGAMENTOS: 'historico_pagamentos',
  HISTORICO_MOVIMENTACOES: 'historico_movimentacoes',
  COMPLEMENTOS: 'complementos',
  CATEGORIAS_COMPLEMENTOS: 'categorias_complementos'
};

// Ações do cache
const CACHE_ACTIONS = {
  SET_DATA: 'SET_DATA',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  CLEAR_CACHE: 'CLEAR_CACHE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  INVALIDATE_CACHE: 'INVALIDATE_CACHE'
};

// Estado inicial do cache
const initialState = {
  data: {
    [CACHE_TYPES.PRODUTOS]: [],
    [CACHE_TYPES.CATEGORIAS]: [],
    [CACHE_TYPES.CLIENTES]: [],
    [CACHE_TYPES.PAGAMENTOS]: [],
    [CACHE_TYPES.CAIXAS]: [],
    [CACHE_TYPES.HISTORICO_PEDIDOS]: [],
    [CACHE_TYPES.HISTORICO_PAGAMENTOS]: [],
    [CACHE_TYPES.HISTORICO_MOVIMENTACOES]: [],
    [CACHE_TYPES.COMPLEMENTOS]: [],
    [CACHE_TYPES.CATEGORIAS_COMPLEMENTOS]: []
  },
  loading: {
    [CACHE_TYPES.PRODUTOS]: false,
    [CACHE_TYPES.CATEGORIAS]: false,
    [CACHE_TYPES.CLIENTES]: false,
    [CACHE_TYPES.PAGAMENTOS]: false,
    [CACHE_TYPES.CAIXAS]: false,
    [CACHE_TYPES.HISTORICO_PEDIDOS]: false,
    [CACHE_TYPES.HISTORICO_PAGAMENTOS]: false,
    [CACHE_TYPES.HISTORICO_MOVIMENTACOES]: false,
    [CACHE_TYPES.COMPLEMENTOS]: false,
    [CACHE_TYPES.CATEGORIAS_COMPLEMENTOS]: false
  },
  errors: {},
  lastFetch: {},
  cacheExpiry: 5 * 60 * 1000 // 5 minutos
};

// Reducer do cache
const cacheReducer = (state, action) => {
  switch (action.type) {
    case CACHE_ACTIONS.SET_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.type]: action.payload.data
        },
        loading: {
          ...state.loading,
          [action.payload.type]: false
        },
        lastFetch: {
          ...state.lastFetch,
          [action.payload.type]: Date.now()
        },
        errors: {
          ...state.errors,
          [action.payload.type]: null
        }
      };

    case CACHE_ACTIONS.ADD_ITEM:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.type]: [...state.data[action.payload.type], action.payload.item]
        }
      };

    case CACHE_ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.type]: state.data[action.payload.type].map(item =>
            item.id === action.payload.item.id ? action.payload.item : item
          )
        }
      };

    case CACHE_ACTIONS.DELETE_ITEM:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.type]: state.data[action.payload.type].filter(item =>
            item.id !== action.payload.itemId
          )
        }
      };

    case CACHE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.loading
        }
      };

    case CACHE_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: false
        },
        errors: {
          ...state.errors,
          [action.payload.type]: action.payload.error
        }
      };

    case CACHE_ACTIONS.CLEAR_CACHE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.type]: []
        },
        lastFetch: {
          ...state.lastFetch,
          [action.payload.type]: null
        }
      };

    case CACHE_ACTIONS.INVALIDATE_CACHE:
      return {
        ...state,
        lastFetch: {
          ...state.lastFetch,
          [action.payload.type]: null
        }
      };

    default:
      return state;
  }
};

// Provider do CacheContext
export const CacheProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cacheReducer, initialState);

  // Verificar se o cache está expirado
  const isCacheExpired = useCallback((type) => {
    const lastFetch = state.lastFetch[type];
    if (!lastFetch) return true;
    return Date.now() - lastFetch > state.cacheExpiry;
  }, [state.lastFetch, state.cacheExpiry]);

  // Buscar dados da API
  const fetchData = useCallback(async (type, endpoint, params = {}) => {
    try {
      console.log(`🔍 fetchData: ${type}`, { endpoint, params });
      dispatch({ type: CACHE_ACTIONS.SET_LOADING, payload: { type, loading: true } });
      
      const response = await api.get(endpoint, { params });
      console.log(`📡 Resposta da API para ${type}:`, response);
      
      // Verificar se a resposta tem a estrutura esperada
      let data = [];
      if (response.success && response.data) {
        // Se response.data é um array, usar diretamente
        if (Array.isArray(response.data)) {
          data = response.data;
        }
        // Se response.data tem uma propriedade com o nome do tipo, usar ela
        else if (response.data[type] && Array.isArray(response.data[type])) {
          data = response.data[type];
        }
        // Se response.data tem uma propriedade 'produtos', 'categorias', etc.
        else if (response.data.produtos && Array.isArray(response.data.produtos)) {
          data = response.data.produtos;
        }
        else if (response.data.categorias && Array.isArray(response.data.categorias)) {
          data = response.data.categorias;
        }
        else if (response.data.clientes && Array.isArray(response.data.clientes)) {
          data = response.data.clientes;
        }
        else if (response.data.caixas && Array.isArray(response.data.caixas)) {
          data = response.data.caixas;
        }
        else if (response.data.pontosAtendimento && Array.isArray(response.data.pontosAtendimento)) {
          data = response.data.pontosAtendimento;
        }
        else if (response.data.complementos && Array.isArray(response.data.complementos)) {
          data = response.data.complementos;
        }
        else if (response.data.categoriasComplementos && Array.isArray(response.data.categoriasComplementos)) {
          data = response.data.categoriasComplementos;
        }
        else if (response.data.pagamentos && Array.isArray(response.data.pagamentos)) {
          data = response.data.pagamentos;
        }
        else {
          console.warn(`⚠️ Estrutura de resposta inesperada para ${type}:`, response.data);
          data = [];
        }
      } else {
        console.warn(`⚠️ Resposta sem sucesso para ${type}:`, response);
        data = [];
      }
      
      console.log(`✅ Dados processados para ${type}:`, data.length, 'itens');
      
      dispatch({ type: CACHE_ACTIONS.SET_DATA, payload: { type, data } });
      
      return data;
    } catch (error) {
      console.error(`❌ Erro ao buscar ${type}:`, error);
      
      // Se for erro 500, erro de servidor, ou erro de rede, retornar array vazio em vez de lançar erro
      if (error.message && (
        error.message.includes('500') || 
        error.message.includes('Erro interno do servidor') ||
        error.message.includes('Network Error') ||
        error.message.includes('Failed to fetch')
      )) {
        console.warn(`⚠️ Erro do servidor/rede para ${type}, retornando array vazio`);
        dispatch({ type: CACHE_ACTIONS.SET_DATA, payload: { type, data: [] } });
        return [];
      }
      
      // Para outros erros, também retornar array vazio para não quebrar a aplicação
      console.warn(`⚠️ Erro ao buscar ${type}, retornando array vazio:`, error.message);
      dispatch({ type: CACHE_ACTIONS.SET_DATA, payload: { type, data: [] } });
      return [];
    }
  }, []);

  // Buscar dados com cache
  const getData = useCallback(async (type, endpoint, params = {}, forceRefresh = false) => {
    // Se não forçar refresh e cache não estiver expirado, retornar dados do cache
    if (!forceRefresh && !isCacheExpired(type) && state.data[type].length > 0) {
      return state.data[type];
    }

    // Buscar dados da API
    return await fetchData(type, endpoint, params);
  }, [state.data, isCacheExpired, fetchData]);

  // Adicionar item ao cache
  const addItem = useCallback((type, item) => {
    dispatch({ type: CACHE_ACTIONS.ADD_ITEM, payload: { type, item } });
    
    // Emitir evento específico baseado no tipo
    switch (type) {
      case CACHE_TYPES.PRODUTOS:
        emitProdutoEvent.criado(item);
        break;
      case CACHE_TYPES.CATEGORIAS:
        emitCategoriaEvent.criada(item);
        break;
      case CACHE_TYPES.CLIENTES:
        emitClienteEvent.criado(item);
        break;
      case CACHE_TYPES.PAGAMENTOS:
        emitPagamentoEvent.criado(item);
        break;
      case CACHE_TYPES.CAIXAS:
        emitCaixaEvent.criado(item);
        break;
      case CACHE_TYPES.COMPLEMENTOS:
        emitComplementoEvent.criado(item);
        break;
    }
  }, []);

  // Atualizar item no cache
  const updateItem = useCallback((type, item) => {
    dispatch({ type: CACHE_ACTIONS.UPDATE_ITEM, payload: { type, item } });
    
    // Emitir evento específico baseado no tipo
    switch (type) {
      case CACHE_TYPES.PRODUTOS:
        emitProdutoEvent.atualizado(item);
        break;
      case CACHE_TYPES.CATEGORIAS:
        emitCategoriaEvent.atualizada(item);
        break;
      case CACHE_TYPES.CLIENTES:
        emitClienteEvent.atualizado(item);
        break;
      case CACHE_TYPES.PAGAMENTOS:
        emitPagamentoEvent.atualizado(item);
        break;
      case CACHE_TYPES.CAIXAS:
        emitCaixaEvent.atualizado(item);
        break;
      case CACHE_TYPES.COMPLEMENTOS:
        emitComplementoEvent.atualizado(item);
        break;
    }
  }, []);

  // Remover item do cache
  const removeItem = useCallback((type, itemId) => {
    dispatch({ type: CACHE_ACTIONS.DELETE_ITEM, payload: { type, itemId } });
    
    // Emitir evento específico baseado no tipo
    switch (type) {
      case CACHE_TYPES.PRODUTOS:
        emitProdutoEvent.deletado(itemId);
        break;
      case CACHE_TYPES.CATEGORIAS:
        emitCategoriaEvent.deletada(itemId);
        break;
      case CACHE_TYPES.CLIENTES:
        emitClienteEvent.deletado(itemId);
        break;
      case CACHE_TYPES.PAGAMENTOS:
        emitPagamentoEvent.deletado(itemId);
        break;
      case CACHE_TYPES.CAIXAS:
        emitCaixaEvent.deletado(itemId);
        break;
      case CACHE_TYPES.COMPLEMENTOS:
        emitComplementoEvent.deletado(itemId);
        break;
    }
  }, []);

  // Limpar cache
  const clearCache = useCallback((type) => {
    dispatch({ type: CACHE_ACTIONS.CLEAR_CACHE, payload: { type } });
  }, []);

  // Invalidar cache (forçar refresh na próxima busca)
  const invalidateCache = useCallback((type) => {
    dispatch({ type: CACHE_ACTIONS.INVALIDATE_CACHE, payload: { type } });
  }, []);

  // Obter dados do cache
  const getCachedData = useCallback((type) => {
    return state.data[type] || [];
  }, [state.data]);

  // Verificar se está carregando
  const isLoading = useCallback((type) => {
    return state.loading[type] || false;
  }, [state.loading]);

  // Obter erro
  const getError = useCallback((type) => {
    return state.errors[type] || null;
  }, [state.errors]);

  // Context value
  const value = {
    // Dados
    data: state.data,
    
    // Métodos de busca
    getData,
    getCachedData,
    
    // Métodos de manipulação
    addItem,
    updateItem,
    removeItem,
    clearCache,
    invalidateCache,
    
    // Estados
    isLoading,
    getError,
    
    // Tipos de cache
    CACHE_TYPES
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

// Hook para usar o cache
export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache deve ser usado dentro de um CacheProvider');
  }
  return context;
};

// Hooks específicos para cada tipo de dados
export const useProdutos = (estabelecimentoId) => {
  const { getData, getCachedData, addItem, updateItem, removeItem, isLoading, getError, CACHE_TYPES } = useCache();
  
  const loadProdutos = useCallback(async (forceRefresh = false) => {
    if (!estabelecimentoId) return [];
    return await getData(CACHE_TYPES.PRODUTOS, `/produtos/${estabelecimentoId}`, {}, forceRefresh);
  }, [estabelecimentoId, getData, CACHE_TYPES.PRODUTOS]);
  
  const addProduto = (produto) => addItem(CACHE_TYPES.PRODUTOS, produto);
  const updateProduto = (produto) => updateItem(CACHE_TYPES.PRODUTOS, produto);
  const removeProduto = (produtoId) => removeItem(CACHE_TYPES.PRODUTOS, produtoId);
  
  return {
    produtos: getCachedData(CACHE_TYPES.PRODUTOS),
    loadProdutos,
    addProduto,
    updateProduto,
    removeProduto,
    isLoading: isLoading(CACHE_TYPES.PRODUTOS),
    error: getError(CACHE_TYPES.PRODUTOS)
  };
};

export const useCategorias = (estabelecimentoId) => {
  const { getData, getCachedData, addItem, updateItem, removeItem, isLoading, getError, CACHE_TYPES } = useCache();
  
  const loadCategorias = useCallback(async (forceRefresh = false) => {
    if (!estabelecimentoId) {
      console.warn('⚠️ useCategorias: estabelecimentoId não fornecido');
      return [];
    }
    
    try {
      console.log('🔄 useCategorias: Carregando categorias para estabelecimento:', estabelecimentoId);
      return await getData(CACHE_TYPES.CATEGORIAS, `/categorias/${estabelecimentoId}`, {}, forceRefresh);
    } catch (error) {
      console.warn('⚠️ useCategorias: Erro ao carregar categorias, retornando array vazio:', error.message);
      // Em caso de erro, retornar array vazio em vez de quebrar a aplicação
      return [];
    }
  }, [estabelecimentoId, getData, CACHE_TYPES.CATEGORIAS]);
  
  const addCategoria = (categoria) => addItem(CACHE_TYPES.CATEGORIAS, categoria);
  const updateCategoria = (categoria) => updateItem(CACHE_TYPES.CATEGORIAS, categoria);
  const removeCategoria = (categoriaId) => removeItem(CACHE_TYPES.CATEGORIAS, categoriaId);
  
  return {
    categorias: getCachedData(CACHE_TYPES.CATEGORIAS),
    loadCategorias,
    addCategoria,
    updateCategoria,
    removeCategoria,
    isLoading: isLoading(CACHE_TYPES.CATEGORIAS),
    error: getError(CACHE_TYPES.CATEGORIAS)
  };
};

export const useClientes = (estabelecimentoId) => {
  const { getData, getCachedData, addItem, updateItem, removeItem, isLoading, getError, CACHE_TYPES } = useCache();
  
  const loadClientes = useCallback(async (forceRefresh = false) => {
    if (!estabelecimentoId) return [];
    return await getData(CACHE_TYPES.CLIENTES, `/clientes/${estabelecimentoId}`, {}, forceRefresh);
  }, [estabelecimentoId, getData, CACHE_TYPES.CLIENTES]);
  
  const addCliente = (cliente) => addItem(CACHE_TYPES.CLIENTES, cliente);
  const updateCliente = (cliente) => updateItem(CACHE_TYPES.CLIENTES, cliente);
  const removeCliente = (clienteId) => removeItem(CACHE_TYPES.CLIENTES, clienteId);
  
  return {
    clientes: getCachedData(CACHE_TYPES.CLIENTES),
    loadClientes,
    addCliente,
    updateCliente,
    removeCliente,
    isLoading: isLoading(CACHE_TYPES.CLIENTES),
    error: getError(CACHE_TYPES.CLIENTES)
  };
};

export const useCaixas = (estabelecimentoId) => {
  const { getData, getCachedData, addItem, updateItem, removeItem, isLoading, getError, CACHE_TYPES } = useCache();
  
  const loadCaixas = useCallback(async (forceRefresh = false) => {
    if (!estabelecimentoId) return [];
    return await getData(CACHE_TYPES.CAIXAS, `/caixas/${estabelecimentoId}`, {}, forceRefresh);
  }, [estabelecimentoId, getData, CACHE_TYPES.CAIXAS]);
  
  const addCaixa = (caixa) => addItem(CACHE_TYPES.CAIXAS, caixa);
  const updateCaixa = (caixa) => updateItem(CACHE_TYPES.CAIXAS, caixa);
  const removeCaixa = (caixaId) => removeItem(CACHE_TYPES.CAIXAS, caixaId);
  
  return {
    caixas: getCachedData(CACHE_TYPES.CAIXAS),
    loadCaixas,
    addCaixa,
    updateCaixa,
    removeCaixa,
    isLoading: isLoading(CACHE_TYPES.CAIXAS),
    error: getError(CACHE_TYPES.CAIXAS)
  };
};

// Hook removido - pontos de atendimento agora são buscados diretamente da API

export const useComplementos = (estabelecimentoId) => {
  const { getData, getCachedData, addItem, updateItem, removeItem, isLoading, getError, CACHE_TYPES } = useCache();
  
  const loadComplementos = useCallback(async (forceRefresh = false) => {
    if (!estabelecimentoId) return [];
    return await getData(CACHE_TYPES.COMPLEMENTOS, `/complementos/${estabelecimentoId}`, {}, forceRefresh);
  }, [estabelecimentoId, getData, CACHE_TYPES.COMPLEMENTOS]);
  
  const addComplemento = (complemento) => addItem(CACHE_TYPES.COMPLEMENTOS, complemento);
  const updateComplemento = (complemento) => updateItem(CACHE_TYPES.COMPLEMENTOS, complemento);
  const removeComplemento = (complementoId) => removeItem(CACHE_TYPES.COMPLEMENTOS, complementoId);
  
  return {
    complementos: getCachedData(CACHE_TYPES.COMPLEMENTOS),
    loadComplementos,
    addComplemento,
    updateComplemento,
    removeComplemento,
    isLoading: isLoading(CACHE_TYPES.COMPLEMENTOS),
    error: getError(CACHE_TYPES.COMPLEMENTOS)
  };
};

export const useCategoriasComplementos = (estabelecimentoId) => {
  const { getData, getCachedData, addItem, updateItem, removeItem, isLoading, getError, CACHE_TYPES } = useCache();
  
  const loadCategoriasComplementos = useCallback(async (forceRefresh = false) => {
    if (!estabelecimentoId) return [];
    return await getData(CACHE_TYPES.CATEGORIAS_COMPLEMENTOS, `/categorias-complementos/${estabelecimentoId}`, {}, forceRefresh);
  }, [estabelecimentoId, getData, CACHE_TYPES.CATEGORIAS_COMPLEMENTOS]);
  
  const addCategoriaComplemento = (categoria) => addItem(CACHE_TYPES.CATEGORIAS_COMPLEMENTOS, categoria);
  const updateCategoriaComplemento = (categoria) => updateItem(CACHE_TYPES.CATEGORIAS_COMPLEMENTOS, categoria);
  const removeCategoriaComplemento = (categoriaId) => removeItem(CACHE_TYPES.CATEGORIAS_COMPLEMENTOS, categoriaId);
  
  return {
    categoriasComplementos: getCachedData(CACHE_TYPES.CATEGORIAS_COMPLEMENTOS),
    loadCategoriasComplementos,
    addCategoriaComplemento,
    updateCategoriaComplemento,
    removeCategoriaComplemento,
    isLoading: isLoading(CACHE_TYPES.CATEGORIAS_COMPLEMENTOS),
    error: getError(CACHE_TYPES.CATEGORIAS_COMPLEMENTOS)
  };
};

export const usePagamentos = (estabelecimentoId) => {
  const { getData, getCachedData, addItem, updateItem, removeItem, isLoading, getError, CACHE_TYPES } = useCache();
  
  const loadPagamentos = useCallback(async (forceRefresh = false) => {
    if (!estabelecimentoId) return [];
    return await getData(CACHE_TYPES.PAGAMENTOS, `/pagamentos/${estabelecimentoId}`, {}, forceRefresh);
  }, [estabelecimentoId, getData, CACHE_TYPES.PAGAMENTOS]);
  
  const addPagamento = (pagamento) => addItem(CACHE_TYPES.PAGAMENTOS, pagamento);
  const updatePagamento = (pagamento) => updateItem(CACHE_TYPES.PAGAMENTOS, pagamento);
  const removePagamento = (pagamentoId) => removeItem(CACHE_TYPES.PAGAMENTOS, pagamentoId);
  
  return {
    pagamentos: getCachedData(CACHE_TYPES.PAGAMENTOS),
    loadPagamentos,
    addPagamento,
    updatePagamento,
    removePagamento,
    isLoading: isLoading(CACHE_TYPES.PAGAMENTOS),
    error: getError(CACHE_TYPES.PAGAMENTOS)
  };
};

export default CacheContext;