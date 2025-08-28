// Sistema de Cache Inteligente para resolver delay entre servidores
class CacheManager {
  constructor() {
    this.cachePrefix = 'filaZero_cache_';
    this.defaultTTL = 30 * 60 * 1000; // 30 minutos
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB
    this.init();
  }

  // Inicializar o sistema de cache
  init() {
    this.cleanupExpiredCache();
    this.monitorStorage();
  }

  // Gerar chave de cache
  generateKey(type, identifier = '') {
    return `${this.cachePrefix}${type}_${identifier}`;
  }

  // Salvar dados no cache
  set(key, data, ttl = this.defaultTTL) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl,
        expiresAt: Date.now() + ttl
      };

      // Salvar no localStorage para persistência
      localStorage.setItem(key, JSON.stringify(cacheItem));
      
      // Salvar no sessionStorage para acesso rápido
      sessionStorage.setItem(key, JSON.stringify(cacheItem));

      // Verificar tamanho do cache
      this.checkCacheSize();
      
      return true;
    } catch (error) {
      console.warn('Erro ao salvar no cache:', error);
      return false;
    }
  }

  // Obter dados do cache
  get(key) {
    try {
      // Primeiro tentar sessionStorage (mais rápido)
      let cacheItem = sessionStorage.getItem(key);
      
      if (!cacheItem) {
        // Se não estiver no sessionStorage, tentar localStorage
        cacheItem = localStorage.getItem(key);
      }

      if (!cacheItem) {
        return null;
      }

      const parsed = JSON.parse(cacheItem);
      
      // Verificar se o cache expirou
      if (Date.now() > parsed.expiresAt) {
        this.remove(key);
        return null;
      }

      // Atualizar timestamp de acesso
      parsed.lastAccessed = Date.now();
      
      // Sincronizar com sessionStorage para acesso rápido
      sessionStorage.setItem(key, JSON.stringify(parsed));
      
      return parsed.data;
    } catch (error) {
      console.warn('Erro ao ler do cache:', error);
      this.remove(key);
      return null;
    }
  }

  // Verificar se dados existem no cache
  has(key) {
    return this.get(key) !== null;
  }

  // Remover item do cache
  remove(key) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Erro ao remover do cache:', error);
      return false;
    }
  }

  // Limpar cache por tipo
  clearByType(type) {
    try {
      const keys = Object.keys(localStorage);
      const keysToRemove = keys.filter(key => key.startsWith(`${this.cachePrefix}${type}`));
      
      keysToRemove.forEach(key => {
        this.remove(key);
      });

      return keysToRemove.length;
    } catch (error) {
      console.warn('Erro ao limpar cache por tipo:', error);
      return 0;
    }
  }

  // Limpar todo o cache
  clear() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      cacheKeys.forEach(key => {
        this.remove(key);
      });

      return cacheKeys.length;
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
      return 0;
    }
  }

  // Obter estatísticas do cache
  getStats() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      let totalSize = 0;
      let expiredCount = 0;
      let validCount = 0;
      const types = {};

      cacheKeys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          const itemSize = JSON.stringify(item).length;
          totalSize += itemSize;

          if (Date.now() > item.expiresAt) {
            expiredCount++;
          } else {
            validCount++;
          }

          // Contar por tipo
          const type = key.split('_')[1];
          types[type] = (types[type] || 0) + 1;
        } catch (e) {
          // Item corrompido
        }
      });

      return {
        totalItems: cacheKeys.length,
        validItems: validCount,
        expiredItems: expiredCount,
        totalSize: this.formatBytes(totalSize),
        types
      };
    } catch (error) {
      console.warn('Erro ao obter estatísticas do cache:', error);
      return null;
    }
  }

  // Verificar tamanho do cache
  checkCacheSize() {
    try {
      const stats = this.getStats();
      if (stats && this.parseBytes(stats.totalSize) > this.maxCacheSize) {
        this.cleanupOldestCache();
      }
    } catch (error) {
      console.warn('Erro ao verificar tamanho do cache:', error);
    }
  }

  // Limpar cache expirado
  cleanupExpiredCache() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      cacheKeys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (Date.now() > item.expiresAt) {
            this.remove(key);
          }
        } catch (e) {
          // Item corrompido, remover
          this.remove(key);
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar cache expirado:', error);
    }
  }

  // Limpar cache mais antigo
  cleanupOldestCache() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      const items = cacheKeys.map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          return { key, timestamp: item.timestamp || 0 };
        } catch (e) {
          return { key, timestamp: 0 };
        }
      });

      // Ordenar por timestamp (mais antigo primeiro)
      items.sort((a, b) => a.timestamp - b.timestamp);

      // Remover 20% dos itens mais antigos
      const itemsToRemove = Math.ceil(items.length * 0.2);
      
      for (let i = 0; i < itemsToRemove; i++) {
        this.remove(items[i].key);
      }
    } catch (error) {
      console.warn('Erro ao limpar cache antigo:', error);
    }
  }

  // Monitorar uso de storage
  monitorStorage() {
    try {
      const checkStorage = () => {
        const used = JSON.stringify(localStorage).length;
        const max = 5 * 1024 * 1024; // 5MB (limite seguro)
        
        if (used > max * 0.8) { // 80% do limite
          this.cleanupOldestCache();
        }
      };

      // Verificar a cada 5 minutos
      setInterval(checkStorage, 5 * 60 * 1000);
    } catch (error) {
      console.warn('Erro ao monitorar storage:', error);
    }
  }

  // Formatar bytes para leitura
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Converter string de bytes para número
  parseBytes(bytesString) {
    const match = bytesString.match(/^([\d.]+)\s*(\w+)$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    const units = { 'B': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
    return value * (units[unit] || 1);
  }

  // Pré-carregar dados no cache
  preloadData(type, fetchFunction, ttl = this.defaultTTL) {
    try {
      const key = this.generateKey(type);
      
      // Se já existe no cache, não precisa pré-carregar
      if (this.has(key)) {
        return Promise.resolve(this.get(key));
      }

      // Buscar dados e salvar no cache
      return fetchFunction().then(data => {
        this.set(key, data, ttl);
        return data;
      });
    } catch (error) {
      console.warn('Erro ao pré-carregar dados:', error);
      return Promise.reject(error);
    }
  }

  // Sincronizar cache com dados atualizados
  syncData(type, identifier, newData, ttl = this.defaultTTL) {
    try {
      const key = this.generateKey(type, identifier);
      this.set(key, newData, ttl);
      
      // Invalidar caches relacionados
      this.invalidateRelatedCache(type);
      
      return true;
    } catch (error) {
      console.warn('Erro ao sincronizar cache:', error);
      return false;
    }
  }

  // Invalidar cache relacionado
  invalidateRelatedCache(type) {
    try {
      const keys = Object.keys(localStorage);
      const relatedKeys = keys.filter(key => 
        key.startsWith(this.cachePrefix) && 
        (key.includes(type) || key.includes('list') || key.includes('all'))
      );
      
      relatedKeys.forEach(key => {
        this.remove(key);
      });
    } catch (error) {
      console.warn('Erro ao invalidar cache relacionado:', error);
    }
  }

  // Obter dados com fallback para cache
  async getWithFallback(key, fetchFunction, ttl = this.defaultTTL) {
    try {
      // Primeiro tentar obter do cache
      let data = this.get(key);
      
      if (data) {
        // Dados encontrados no cache, retornar imediatamente
        return { data, fromCache: true };
      }

      // Se não estiver no cache, buscar da API
      data = await fetchFunction();
      
      // Salvar no cache para próximas consultas
      this.set(key, data, ttl);
      
      return { data, fromCache: false };
    } catch (error) {
      console.warn('Erro ao obter dados com fallback:', error);
      throw error;
    }
  }
}

// Instância global do cache manager
const cacheManager = new CacheManager();

export default cacheManager;
