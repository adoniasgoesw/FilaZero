import { useState, useEffect, useCallback } from 'react';
import logger from '../utils/logger.js';

// Hook customizado para cache de API
export const useApiCache = (key, fetchFunction, options = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por padrão
    enabled = true,
    onError = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Verificar se o cache ainda é válido
  const isCacheValid = useCallback(() => {
    if (!lastFetch || !data) return false;
    return Date.now() - lastFetch < ttl;
  }, [lastFetch, data, ttl]);

  // Função para buscar dados
  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Se não for forçado e o cache for válido, retornar dados em cache
    if (!force && isCacheValid()) {
      logger.debug('Retornando dados do cache', { key });
      return data;
    }

    try {
      setLoading(true);
      setError(null);
      
      logger.debug('Buscando dados da API', { key });
      const result = await fetchFunction();
      
      setData(result);
      setLastFetch(Date.now());
      setLoading(false);
      
      logger.success('Dados carregados com sucesso', { key });
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar dados';
      setError(errorMessage);
      setLoading(false);
      
      logger.error('Erro ao carregar dados', { key, error: err });
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    }
  }, [enabled, isCacheValid, data, key, fetchFunction, onError, ttl]);

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    setLastFetch(null);
    logger.debug('Cache invalidado', { key });
  }, [key]);

  // Função para atualizar dados
  const updateData = useCallback((newData) => {
    setData(newData);
    setLastFetch(Date.now());
    logger.debug('Dados atualizados no cache', { key });
  }, [key]);

  // Função para limpar cache
  const clearCache = useCallback(() => {
    setData(null);
    setLastFetch(null);
    setError(null);
    logger.debug('Cache limpo', { key });
  }, [key]);

  // Carregar dados automaticamente
  useEffect(() => {
    if (enabled && !isCacheValid()) {
      fetchData();
    }
  }, [enabled, isCacheValid, fetchData]);

  return {
    data,
    loading,
    error,
    lastFetch,
    isCacheValid: isCacheValid(),
    fetchData,
    invalidateCache,
    updateData,
    clearCache,
    refetch: () => fetchData(true)
  };
};

export default useApiCache;
