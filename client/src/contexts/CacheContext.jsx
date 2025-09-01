// src/contexts/CacheContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CacheContext = createContext();

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache deve ser usado dentro de um CacheProvider');
  }
  return context;
};

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
    lastUpdated: null
  });

  // Inicializar cache do localStorage ao carregar
  useEffect(() => {
    initializeCache();
  }, []);

  // Inicializar cache do localStorage
  const initializeCache = useCallback(() => {
    try {
      const savedCache = localStorage.getItem('filaZero_cache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        const cacheMap = new Map();
        
        // Converter objetos para Map e verificar expiração
        Object.entries(parsedCache).forEach(([key, value]) => {
          if (!isExpired(value)) {
            cacheMap.set(key, value);
          }
        });
        
        setCache(cacheMap);
        updateCacheStats();
        console.log('🧠 Cache inicializado do localStorage:', cacheMap.size, 'itens');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar cache:', error);
      localStorage.removeItem('filaZero_cache');
    }
  }, []);

  // Verificar se cache expirou
  const isExpired = useCallback((cacheItem) => {
    if (!cacheItem || !cacheItem.expiresAt) return true;
    return Date.now() > cacheItem.expiresAt;
  }, []);

  // Salvar no cache
  const setCacheItem = useCallback((key, data, ttlMinutes = 30) => {
    try {
      const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);
      const cacheItem = {
        data,
        expiresAt,
        createdAt: Date.now(),
        ttlMinutes
      };

      setCache(prevCache => {
        const newCache = new Map(prevCache);
        newCache.set(key, cacheItem);
        return newCache;
      });

      // Salvar no localStorage
      saveCacheToStorage();
      
      console.log(`💾 Cache salvo: ${key} (TTL: ${ttlMinutes}min)`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar no cache:', error);
      return false;
    }
  }, []);

  // Buscar do cache
  const getCacheItem = useCallback((key) => {
    try {
      const cacheItem = cache.get(key);
      
      if (cacheItem && !isExpired(cacheItem)) {
        // Cache hit
        setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
        console.log(`⚡ Cache hit: ${key}`);
        return cacheItem.data;
      }

      // Cache miss
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      console.log(`❌ Cache miss: ${key}`);
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar do cache:', error);
      return null;
    }
  }, [cache, isExpired]);

  // Deletar do cache
  const deleteCacheItem = useCallback((key) => {
    try {
      setCache(prevCache => {
        const newCache = new Map(prevCache);
        newCache.delete(key);
        return newCache;
      });

      saveCacheToStorage();
      console.log(`🗑️ Cache deletado: ${key}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar do cache:', error);
      return false;
    }
  }, []);

  // Deletar múltiplas chaves por padrão
  const deleteCachePattern = useCallback((pattern) => {
    try {
      const keysToDelete = [];
      
      cache.forEach((value, key) => {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => deleteCacheItem(key));
      
      console.log(`🗑️ Cache deletado (padrão): ${pattern} (${keysToDelete.length} chaves)`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar padrão do cache:', error);
      return false;
    }
  }, [cache, deleteCacheItem]);

  // Limpar todo o cache
  const clearCache = useCallback(() => {
    try {
      setCache(new Map());
      localStorage.removeItem('filaZero_cache');
      setCacheStats({ hits: 0, misses: 0, size: 0, lastUpdated: null });
      console.log('🧹 Todo o cache foi limpo');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return false;
    }
  }, []);

  // Salvar cache no localStorage
  const saveCacheToStorage = useCallback(() => {
    try {
      const cacheObject = {};
      cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      localStorage.setItem('filaZero_cache', JSON.stringify(cacheObject));
      updateCacheStats();
    } catch (error) {
      console.error('❌ Erro ao salvar cache no localStorage:', error);
    }
  }, [cache]);

  // Atualizar estatísticas do cache
  const updateCacheStats = useCallback(() => {
    setCacheStats(prev => ({
      ...prev,
      size: cache.size,
      lastUpdated: new Date().toISOString()
    }));
  }, [cache]);

  // Limpar cache expirado
  const cleanupExpiredCache = useCallback(() => {
    try {
      let cleanedCount = 0;
      
      setCache(prevCache => {
        const newCache = new Map();
        
        prevCache.forEach((value, key) => {
          if (!isExpired(value)) {
            newCache.set(key, value);
          } else {
            cleanedCount++;
          }
        });
        
        return newCache;
      });

      if (cleanedCount > 0) {
        saveCacheToStorage();
        console.log(`🧹 Cache limpo: ${cleanedCount} itens expirados removidos`);
      }
    } catch (error) {
      console.error('❌ Erro ao limpar cache expirado:', error);
    }
  }, [isExpired, saveCacheToStorage]);

  // Limpar cache expirado a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(cleanupExpiredCache, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cleanupExpiredCache]);

  // Salvar cache no localStorage sempre que mudar
  useEffect(() => {
    saveCacheToStorage();
  }, [cache, saveCacheToStorage]);

  const value = {
    // Operações básicas
    setCacheItem,
    getCacheItem,
    deleteCacheItem,
    deleteCachePattern,
    clearCache,
    
    // Utilitários
    cleanupExpiredCache,
    isExpired,
    
    // Estatísticas
    cacheStats,
    cacheSize: cache.size,
    
    // Cache específico
    getProducts: () => getCacheItem('products'),
    setProducts: (data) => setCacheItem('products', data, 60), // 1 hora
    
    getCategories: () => getCacheItem('categories'),
    setCategories: (data) => setCacheItem('categories', data, 60), // 1 hora
    
    getComplementos: () => getCacheItem('complementos'),
    setComplementos: (data) => setCacheItem('complementos', data, 60), // 1 hora
    
    getUsers: () => getCacheItem('users'),
    setUsers: (data) => setCacheItem('users', 30), // 30 minutos
    
    getClients: () => getCacheItem('clients'),
    setClients: (data) => setCacheItem('clients', data, 30), // 30 minutos
    
    getPayments: () => getCacheItem('payments'),
    setPayments: (data) => setCacheItem('payments', data, 30), // 30 minutos
    
    // Invalidação de cache
    invalidateProducts: () => deleteCachePattern('products'),
    invalidateCategories: () => deleteCachePattern('categories'),
    invalidateComplementos: () => deleteCachePattern('complementos'),
    invalidateUsers: () => deleteCachePattern('users'),
    invalidateClients: () => deleteCachePattern('clients'),
    invalidatePayments: () => deleteCachePattern('payments'),
    
    // Invalidação geral
    invalidateAll: () => clearCache()
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};
