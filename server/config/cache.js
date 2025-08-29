// server/config/cache.js
import dotenv from 'dotenv';

dotenv.config();

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 300; // 5 minutos em segundos
    
    // Limpar cache em memória a cada hora
    setInterval(() => this.cleanupMemoryCache(), 60 * 60 * 1000);
    
    console.log('🧠 Sistema de cache em memória inicializado');
  }

  // Gerar chave de cache
  generateKey(prefix, identifier) {
    return `${prefix}:${identifier}`;
  }

  // Salvar no cache
  async set(key, data, ttl = this.defaultTTL) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: ttl * 1000 // Converter para milissegundos
      };

      // Salvar em memória
      this.memoryCache.set(key, cacheData);

      console.log(`💾 Cache salvo: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar no cache:', error);
      return false;
    }
  }

  // Buscar do cache
  async get(key) {
    try {
      // Buscar em memória
      const memoryData = this.memoryCache.get(key);
      if (memoryData && !this.isExpired(memoryData)) {
        console.log(`⚡ Cache hit (memória): ${key}`);
        return memoryData.data;
      }

      console.log(`❌ Cache miss: ${key}`);
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar do cache:', error);
      return null;
    }
  }

  // Verificar se cache expirou
  isExpired(cacheData) {
    const now = Date.now();
    const expirationTime = cacheData.timestamp + cacheData.ttl;
    return now > expirationTime;
  }

  // Deletar do cache
  async delete(key) {
    try {
      // Remover da memória
      this.memoryCache.delete(key);

      console.log(`🗑️ Cache deletado: ${key}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar do cache:', error);
      return false;
    }
  }

  // Deletar múltiplas chaves por padrão
  async deletePattern(pattern) {
    try {
      const keysToDelete = [];

      // Encontrar chaves em memória
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }

      // Deletar da memória
      keysToDelete.forEach(key => this.memoryCache.delete(key));

      console.log(`🗑️ Cache deletado (padrão): ${pattern} (${keysToDelete.length} chaves)`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar padrão do cache:', error);
      return false;
    }
  }

  // Limpar cache em memória
  cleanupMemoryCache() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, value] of this.memoryCache.entries()) {
      if (this.isExpired(value)) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cache em memória limpo: ${cleanedCount} chaves removidas`);
    }
  }

  // Estatísticas do cache
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      redisConnected: false, // Sempre false para cache em memória
      timestamp: new Date().toISOString(),
      type: 'memory-only'
    };
  }

  // Limpar todo o cache
  async clear() {
    try {
      this.memoryCache.clear();

      console.log('🧹 Todo o cache foi limpo');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return false;
    }
  }
}

// Instância global do cache
const cacheManager = new CacheManager();

export default cacheManager;
