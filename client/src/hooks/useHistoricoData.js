import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import api from '../services/api';

// Estados globais para cache e controle de carregamento
const globalHistoricoCache = new Map(); // { `${estabelecimentoId}-${caixaId}-${tipo}`: dados }
const globalLoadingState = new Map(); // { `${estabelecimentoId}-${caixaId}-${tipo}`: boolean }
const globalErrorState = new Map(); // { `${estabelecimentoId}-${caixaId}-${tipo}`: string }
const listeners = new Set(); // Listeners para notificar mudanças

// Função para notificar todos os listeners
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Função para buscar dados históricos
const fetchHistoricoData = async (estabelecimentoId, caixaId, tipo) => {
  if (!estabelecimentoId || !caixaId || !tipo) return;

  const cacheKey = `${estabelecimentoId}-${caixaId}-${tipo}`;
  
  // Se já está carregando, não fazer nova requisição
  if (globalLoadingState.get(cacheKey)) {
    return;
  }

  try {
    globalLoadingState.set(cacheKey, true);
    globalErrorState.set(cacheKey, null);
    
    // Notificar listeners IMEDIATAMENTE para mostrar loading
    notifyListeners();

    console.log(`🔄 Buscando dados históricos: ${tipo} para caixa:`, caixaId);
    
    let response;
    let data;
    
    switch (tipo) {
      case 'pedidos':
        response = await api.get(`/historico-pedidos/${estabelecimentoId}?caixa_id=${encodeURIComponent(caixaId)}`);
        data = response.success ? (Array.isArray(response.data) ? response.data : (response.data?.itens || [])) : [];
        break;
        
      case 'pagamentos':
        response = await api.get(`/pagamentos/historico/caixa/${caixaId}?estabelecimento_id=${estabelecimentoId}`);
        if (response && response.success) {
          data = {
            pagamentos: response.data?.data?.pagamentos || response.data?.pagamentos || [],
            resumo: response.data?.data?.resumo || response.data?.resumo || [],
            totalGeral: response.data?.data?.total_geral || response.data?.total_geral || 0,
            totalPagamentos: response.data?.data?.total_pagamentos || response.data?.total_pagamentos || 0
          };
        } else {
          data = { pagamentos: [], resumo: [], totalGeral: 0, totalPagamentos: 0 };
        }
        break;
        
      case 'movimentacoes':
        response = await api.get(`/movimentacoes-caixa/${caixaId}?page=1&limit=100`);
        data = response.success ? (response.data.movimentacoes || response.data || []) : [];
        break;
        
      default:
        data = [];
    }

    globalHistoricoCache.set(cacheKey, data);
    console.log(`✅ Dados históricos carregados (${tipo}):`, Array.isArray(data) ? data.length : 'objeto');
    
  } catch (err) {
    console.error(`❌ Erro ao carregar dados históricos (${tipo}):`, err);
    globalErrorState.set(cacheKey, err.message);
    globalHistoricoCache.set(cacheKey, tipo === 'pagamentos' ? { pagamentos: [], resumo: [], totalGeral: 0, totalPagamentos: 0 } : []);
  } finally {
    globalLoadingState.set(cacheKey, false);
    // Notificar listeners IMEDIATAMENTE após carregar
    notifyListeners();
  }
};

// Função para invalidar cache
const invalidateCache = (estabelecimentoId, caixaId, tipo) => {
  const cacheKey = `${estabelecimentoId}-${caixaId}-${tipo}`;
  globalHistoricoCache.delete(cacheKey);
  globalLoadingState.delete(cacheKey);
  globalErrorState.delete(cacheKey);
};

// Função para atualizar dados específicos
const updateHistoricoData = (estabelecimentoId, caixaId, tipo, newData) => {
  const cacheKey = `${estabelecimentoId}-${caixaId}-${tipo}`;
  globalHistoricoCache.set(cacheKey, newData);
  notifyListeners();
};

// Hook personalizado para usar dados históricos
export const useHistoricoData = (estabelecimentoId, caixaId, tipo) => {
  const [data, setData] = useState(tipo === 'pagamentos' ? { pagamentos: [], resumo: [], totalGeral: 0, totalPagamentos: 0 } : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listenerRef = useRef();

  // Função para atualizar estado local
  const updateLocalState = useCallback(() => {
    if (estabelecimentoId && caixaId && tipo) {
      const cacheKey = `${estabelecimentoId}-${caixaId}-${tipo}`;
      setData(globalHistoricoCache.get(cacheKey) || (tipo === 'pagamentos' ? { pagamentos: [], resumo: [], totalGeral: 0, totalPagamentos: 0 } : []));
      setLoading(globalLoadingState.get(cacheKey) || false);
      setError(globalErrorState.get(cacheKey) || null);
    }
  }, [estabelecimentoId, caixaId, tipo]);

  // Configurar listener para mudanças globais
  useLayoutEffect(() => {
    listenerRef.current = updateLocalState;
    listeners.add(listenerRef.current);
    
    // Atualizar estado inicial IMEDIATAMENTE
    updateLocalState();
    
    // Se não há dados em cache, buscar
    if (estabelecimentoId && caixaId && tipo && !globalHistoricoCache.has(`${estabelecimentoId}-${caixaId}-${tipo}`) && !globalLoadingState.get(`${estabelecimentoId}-${caixaId}-${tipo}`)) {
      // Usar setTimeout com 0 para não bloquear a renderização
      setTimeout(() => fetchHistoricoData(estabelecimentoId, caixaId, tipo), 0);
    }

    return () => {
      listeners.delete(listenerRef.current);
    };
  }, [estabelecimentoId, caixaId, tipo, updateLocalState]);

  // Função para forçar refresh
  const refresh = useCallback(() => {
    if (estabelecimentoId && caixaId && tipo) {
      invalidateCache(estabelecimentoId, caixaId, tipo);
      fetchHistoricoData(estabelecimentoId, caixaId, tipo);
    }
  }, [estabelecimentoId, caixaId, tipo]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

// Funções globais para controle de cache
export const historicoDataManager = {
  fetch: fetchHistoricoData,
  update: updateHistoricoData,
  invalidate: invalidateCache,
  
  // Função para carregar todos os tipos de dados históricos
  loadAll: async (estabelecimentoId, caixaId) => {
    if (!estabelecimentoId || !caixaId) return;
    
    console.log('🚀 Carregando todos os dados históricos em background...');
    
    // Carregar todos os tipos em paralelo
    const promises = [
      fetchHistoricoData(estabelecimentoId, caixaId, 'pedidos'),
      fetchHistoricoData(estabelecimentoId, caixaId, 'pagamentos'),
      fetchHistoricoData(estabelecimentoId, caixaId, 'movimentacoes')
    ];
    
    await Promise.all(promises);
    console.log('✅ Todos os dados históricos carregados em background');
  },
  
  // Função para invalidar todos os caches de um caixa
  invalidateAll: (estabelecimentoId, caixaId) => {
    if (!estabelecimentoId || !caixaId) return;
    
    ['pedidos', 'pagamentos', 'movimentacoes'].forEach(tipo => {
      invalidateCache(estabelecimentoId, caixaId, tipo);
    });
  }
};
