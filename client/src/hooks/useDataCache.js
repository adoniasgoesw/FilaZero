import { useState, useEffect, useCallback, useRef } from 'react';
import cacheManager from '../utils/cacheManager.js';
import logger from '../utils/logger.js';

// Hook especializado para cache de dados - resolve delay entre servidores
export const useDataCache = (cacheKey, fetchFunction, options = {}) => {
  const {
    ttl = 30 * 60 * 1000, // 30 minutos por padrão
    autoRefresh = true, // Atualizar automaticamente
    refreshInterval = 5 * 60 * 1000, // 5 minutos
    immediate = true, // Carregar imediatamente
    onDataUpdate = null, // Callback quando dados são atualizados
    onError = null, // Callback de erro
    dependencies = [] // Dependências para recarregar
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  
  const refreshTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Função para buscar dados
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Gerar chave de cache
      const key = cacheManager.generateKey(cacheKey);
      
      let result;
      
      if (forceRefresh) {
        // Forçar busca da API
        logger.debug('Forçando busca da API', { cacheKey });
        result = await fetchFunction();
        cacheManager.set(key, result, ttl);
        setFromCache(false);
      } else {
        // Tentar cache primeiro, depois API
        result = await cacheManager.getWithFallback(key, fetchFunction, ttl);
        setFromCache(result.fromCache);
      }

      if (isMountedRef.current) {
        setData(result.data || result);
        setLastUpdated(Date.now());
        
        if (onDataUpdate) {
          onDataUpdate(result.data || result);
        }
        
        logger.success('Dados carregados com sucesso', { 
          cacheKey, 
          fromCache: result.fromCache || false,
          dataSize: JSON.stringify(result.data || result).length
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        logger.error('Erro ao carregar dados', { cacheKey, error: err });
        
        if (onError) {
          onError(err);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, fetchFunction, ttl, onDataUpdate, onError, ...dependencies]);

  // Função para atualizar dados no cache
  const updateCache = useCallback((newData) => {
    try {
      const key = cacheManager.generateKey(cacheKey);
      cacheManager.syncData(cacheKey, '', newData, ttl);
      
      setData(newData);
      setLastUpdated(Date.now());
      setFromCache(false);
      
      logger.success('Cache atualizado', { cacheKey, dataSize: JSON.stringify(newData).length });
      
      if (onDataUpdate) {
        onDataUpdate(newData);
      }
      
      return true;
    } catch (error) {
      logger.error('Erro ao atualizar cache', { cacheKey, error });
      return false;
    }
  }, [cacheKey, ttl, onDataUpdate]);

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    try {
      cacheManager.clearByType(cacheKey);
      setData(null);
      setLastUpdated(null);
      setFromCache(false);
      
      logger.debug('Cache invalidado', { cacheKey });
      return true;
    } catch (error) {
      logger.error('Erro ao invalidar cache', { cacheKey, error });
      return false;
    }
  }, [cacheKey]);

  // Função para recarregar dados
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Função para pré-carregar dados
  const preload = useCallback(async () => {
    try {
      const key = cacheManager.generateKey(cacheKey);
      
      if (!cacheManager.has(key)) {
        logger.debug('Pré-carregando dados', { cacheKey });
        await cacheManager.preloadData(cacheKey, fetchFunction, ttl);
      }
    } catch (error) {
      logger.warn('Erro ao pré-carregar dados', { cacheKey, error });
    }
  }, [cacheKey, fetchFunction, ttl]);

  // Configurar auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        if (isMountedRef.current) {
          logger.debug('Auto-refresh executado', { cacheKey });
          fetchData();
        }
      }, refreshInterval);

      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, cacheKey, fetchData]);

  // Carregar dados iniciais
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Retornar dados e funções
  return {
    // Estado
    data,
    loading,
    error,
    lastUpdated,
    fromCache,
    
    // Funções
    fetchData,
    updateCache,
    invalidateCache,
    refresh,
    preload,
    
    // Utilitários
    hasData: !!data,
    isLoading: loading,
    hasError: !!error,
    isFromCache: fromCache,
    
    // Estatísticas
    cacheStats: cacheManager.getStats(),
    
    // Função para verificar se cache é válido
    isCacheValid: () => {
      const key = cacheManager.generateKey(cacheKey);
      return cacheManager.has(key);
    }
  };
};

export default useDataCache;
