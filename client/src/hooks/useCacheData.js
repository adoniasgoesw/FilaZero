// src/hooks/useCacheData.js
import { useState, useEffect, useCallback } from 'react';
import { useCache } from '../contexts/CacheContext';
import cacheService from '../services/CacheService';

export const useCacheData = (dataType, options = {}) => {
  const {
    autoFetch = true,
    forceRefresh = false,
    ttlMinutes = 60,
    transformData = null
  } = options;

  const cache = useCache();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  // Inicializar o serviço de cache
  useEffect(() => {
    if (cache) {
      cacheService.initialize(cache);
    }
  }, [cache]);

  // Função para buscar dados
  const fetchData = useCallback(async (force = false) => {
    if (!cacheService.cache) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      
      switch (dataType) {
        case 'products':
          result = await cacheService.fetchProducts(force);
          break;
        case 'categories':
          result = await cacheService.fetchCategories(force);
          break;
        case 'complementos':
          result = await cacheService.fetchComplementos(force);
          break;
        case 'users':
          result = await cacheService.fetchUsers(force);
          break;
        case 'clients':
          result = await cacheService.fetchClients(force);
          break;
        case 'payments':
          result = await cacheService.fetchPayments(force);
          break;
        default:
          throw new Error(`Tipo de dados não suportado: ${dataType}`);
      }

      if (result) {
        let processedData = result.data;
        
        // Aplicar transformação se fornecida
        if (transformData && typeof transformData === 'function') {
          processedData = transformData(result.data);
        }

        setData(processedData);
        setLastUpdated(result.timestamp);
        setFromCache(result.fromCache);
        
        console.log(`✅ Dados carregados (${dataType}):`, {
          fromCache: result.fromCache,
          stale: result.stale || false,
          count: Array.isArray(processedData) ? processedData.length : 'N/A'
        });
      }
    } catch (err) {
      console.error(`❌ Erro ao buscar dados (${dataType}):`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dataType, transformData]);

  // Função para salvar dados
  const saveData = useCallback(async (dataToSave, isUpdate = false) => {
    if (!cacheService.cache) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      
      switch (dataType) {
        case 'products':
          result = await cacheService.saveProduct(dataToSave, isUpdate);
          break;
        case 'categories':
          result = await cacheService.saveCategory(dataToSave, isUpdate);
          break;
        case 'complementos':
          result = await cacheService.saveComplemento(dataToSave, isUpdate);
          break;
        default:
          throw new Error(`Tipo de dados não suportado para salvamento: ${dataType}`);
      }

      if (result) {
        // Atualizar dados locais
        await fetchData(true);
        console.log(`✅ Dados salvos com sucesso (${dataType})`);
        return result;
      }
    } catch (err) {
      console.error(`❌ Erro ao salvar dados (${dataType}):`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dataType, fetchData]);

  // Função para deletar dados
  const deleteData = useCallback(async (id) => {
    if (!cacheService.cache) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = `/${dataType}/${id}`;
      const result = await cacheService.deleteItem(endpoint, dataType);
      
      if (result) {
        // Atualizar dados locais
        await fetchData(true);
        console.log(`✅ Dados deletados com sucesso (${dataType})`);
        return result;
      }
    } catch (err) {
      console.error(`❌ Erro ao deletar dados (${dataType}):`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dataType, fetchData]);

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    if (!cache) return;

    switch (dataType) {
      case 'products':
        cache.invalidateProducts();
        break;
      case 'categories':
        cache.invalidateCategories();
        break;
      case 'complementos':
        cache.invalidateComplementos();
        break;
      case 'users':
        cache.invalidateUsers();
        break;
      case 'clients':
        cache.invalidateClients();
        break;
      case 'payments':
        cache.invalidatePayments();
        break;
      default:
        cache.invalidateAll();
    }

    console.log(`🗑️ Cache invalidado para: ${dataType}`);
  }, [cache, dataType]);

  // Função para forçar refresh
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Buscar dados automaticamente ao montar
  useEffect(() => {
    if (autoFetch && cacheService.cache) {
      fetchData(forceRefresh);
    }
  }, [autoFetch, forceRefresh, fetchData]);

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
    saveData,
    deleteData,
    invalidateCache,
    refresh,
    
    // Utilitários
    isEmpty: !data || (Array.isArray(data) && data.length === 0),
    isStale: fromCache && lastUpdated && (Date.now() - lastUpdated > ttlMinutes * 60 * 1000)
  };
};

// Hooks específicos para cada tipo de dados
export const useProducts = (options = {}) => useCacheData('products', { ...options, ttlMinutes: 60 });
export const useCategories = (options = {}) => useCacheData('categories', { ...options, ttlMinutes: 60 });
export const useComplementos = (options = {}) => useCacheData('complementos', { ...options, ttlMinutes: 60 });
export const useUsers = (options = {}) => useCacheData('users', { ...options, ttlMinutes: 30 });
export const useClients = (options = {}) => useCacheData('clients', { ...options, ttlMinutes: 30 });
export const usePayments = (options = {}) => useCacheData('payments', { ...options, ttlMinutes: 30 });
