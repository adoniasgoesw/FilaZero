// src/services/CacheService.js
import API from './api';

class CacheService {
  constructor() {
    this.cache = null;
    this.setCache = null;
  }

  // Inicializar o serviço com as funções de cache
  initialize(cacheFunctions) {
    this.cache = cacheFunctions;
    this.setCache = cacheFunctions.setCacheItem;
  }

  // Buscar dados com cache inteligente
  async fetchWithCache(endpoint, cacheKey, options = {}) {
    const {
      ttlMinutes = 30,
      forceRefresh = false,
      invalidateOnSuccess = false,
      transformData = null
    } = options;

    try {
      // 1. Tentar buscar do cache primeiro (se não for force refresh)
      if (!forceRefresh) {
        const cachedData = this.cache?.getCacheItem(cacheKey);
        if (cachedData) {
          console.log(`⚡ Dados carregados do cache: ${cacheKey}`);
          return {
            data: cachedData,
            fromCache: true,
            timestamp: Date.now()
          };
        }
      }

      // 2. Se não estiver no cache, buscar da API
      console.log(`🌐 Buscando dados da API: ${endpoint}`);
      const response = await API.get(endpoint);
      
      if (response.data) {
        let processedData = response.data;
        
        // Aplicar transformação se fornecida
        if (transformData && typeof transformData === 'function') {
          processedData = transformData(response.data);
        }

        // 3. Salvar no cache
        if (this.setCache) {
          this.setCache(cacheKey, processedData, ttlMinutes);
        }

        // 4. Invalidar cache relacionado se necessário
        if (invalidateOnSuccess) {
          this.invalidateRelatedCache(cacheKey);
        }

        console.log(`✅ Dados carregados da API e salvos no cache: ${cacheKey}`);
        return {
          data: processedData,
          fromCache: false,
          timestamp: Date.now()
        };
      }

      throw new Error('Resposta da API vazia');
    } catch (error) {
      console.error(`❌ Erro ao buscar dados: ${endpoint}`, error);
      
      // Em caso de erro, tentar retornar dados do cache mesmo expirados
      const staleData = this.cache?.getCacheItem(cacheKey);
      if (staleData) {
        console.log(`⚠️ Retornando dados expirados do cache: ${cacheKey}`);
        return {
          data: staleData,
          fromCache: true,
          timestamp: Date.now(),
          stale: true
        };
      }
      
      throw error;
    }
  }

  // Salvar dados e atualizar cache
  async saveWithCache(endpoint, data, cacheKey, options = {}) {
    const {
      method = 'POST',
      invalidateCache = true,
      updateCache = true,
      ttlMinutes = 30
    } = options;

    try {
      console.log(`💾 Salvando dados: ${endpoint}`);
      
      // 1. Salvar no banco de dados
      let response;
      if (method === 'POST') {
        response = await API.post(endpoint, data);
      } else if (method === 'PUT') {
        response = await API.put(endpoint, data);
      } else if (method === 'DELETE') {
        response = await API.delete(endpoint);
      }

      if (response.data) {
        // 2. Atualizar cache se necessário
        if (updateCache && this.setCache) {
          this.setCache(cacheKey, response.data, ttlMinutes);
          console.log(`💾 Cache atualizado: ${cacheKey}`);
        }

        // 3. Invalidar cache relacionado se necessário
        if (invalidateCache) {
          this.invalidateRelatedCache(cacheKey);
        }

        console.log(`✅ Dados salvos com sucesso: ${endpoint}`);
        return response.data;
      }

      throw new Error('Resposta da API vazia');
    } catch (error) {
      console.error(`❌ Erro ao salvar dados: ${endpoint}`, error);
      throw error;
    }
  }

  // Invalidar cache relacionado
  invalidateRelatedCache(cacheKey) {
    if (!this.cache) return;

    // Invalidar cache baseado no tipo de dados
    if (cacheKey.includes('products')) {
      this.cache.invalidateProducts();
    } else if (cacheKey.includes('categories')) {
      this.cache.invalidateCategories();
    } else if (cacheKey.includes('complementos')) {
      this.cache.invalidateComplementos();
    } else if (cacheKey.includes('users')) {
      this.cache.invalidateUsers();
    } else if (cacheKey.includes('clients')) {
      this.cache.invalidateClients();
    } else if (cacheKey.includes('payments')) {
      this.cache.invalidatePayments();
    }

    console.log(`🗑️ Cache relacionado invalidado para: ${cacheKey}`);
  }

  // Buscar produtos com cache
  async fetchProducts(forceRefresh = false) {
    return this.fetchWithCache('/produtos', 'products', {
      ttlMinutes: 60,
      forceRefresh,
      invalidateOnSuccess: false,
      transformData: (data) => data.produtos || data
    });
  }

  // Buscar categorias com cache
  async fetchCategories(forceRefresh = false) {
    return this.fetchWithCache('/categorias', 'categories', {
      ttlMinutes: 60,
      forceRefresh,
      invalidateOnSuccess: false,
      transformData: (data) => data.categorias || data
    });
  }

  // Buscar complementos com cache
  async fetchComplementos(forceRefresh = false) {
    return this.fetchWithCache('/complementos', 'complementos', {
      ttlMinutes: 60,
      forceRefresh,
      invalidateOnSuccess: false,
      transformData: (data) => data.complementos || data
    });
  }

  // Buscar usuários com cache
  async fetchUsers(forceRefresh = false) {
    return this.fetchWithCache('/usuarios', 'users', {
      ttlMinutes: 30,
      forceRefresh,
      invalidateOnSuccess: false,
      transformData: (data) => data.usuarios || data
    });
  }

  // Buscar clientes com cache
  async fetchClients(forceRefresh = false) {
    return this.fetchWithCache('/clientes', 'clients', {
      ttlMinutes: 30,
      forceRefresh,
      invalidateOnSuccess: false,
      transformData: (data) => data.clientes || data
    });
  }

  // Buscar pagamentos com cache
  async fetchPayments(forceRefresh = false) {
    return this.fetchWithCache('/pagamentos', 'payments', {
      ttlMinutes: 30,
      forceRefresh,
      invalidateOnSuccess: false,
      transformData: (data) => data.pagamentos || data
    });
  }

  // Salvar produto e atualizar cache
  async saveProduct(productData, isUpdate = false) {
    const endpoint = isUpdate ? `/produtos/${productData.id}` : '/produtos';
    const method = isUpdate ? 'PUT' : 'POST';
    
    const result = await this.saveWithCache(endpoint, productData, 'products', {
      method,
      invalidateCache: true,
      updateCache: false,
      ttlMinutes: 60
    });

    // Atualizar cache de produtos
    if (this.cache) {
      const currentProducts = this.cache.getProducts() || [];
      let updatedProducts;
      
      if (isUpdate) {
        updatedProducts = currentProducts.map(p => 
          p.id === productData.id ? { ...p, ...productData } : p
        );
      } else {
        updatedProducts = [...currentProducts, result];
      }
      
      this.cache.setProducts(updatedProducts, 60);
    }

    return result;
  }

  // Salvar categoria e atualizar cache
  async saveCategory(categoryData, isUpdate = false) {
    const endpoint = isUpdate ? `/categorias/${categoryData.id}` : '/categorias';
    const method = isUpdate ? 'PUT' : 'POST';
    
    const result = await this.saveWithCache(endpoint, categoryData, 'categories', {
      method,
      invalidateCache: true,
      updateCache: false,
      ttlMinutes: 60
    });

    // Atualizar cache de categorias
    if (this.cache) {
      const currentCategories = this.cache.getCategories() || [];
      let updatedCategories;
      
      if (isUpdate) {
        updatedCategories = currentCategories.map(c => 
          c.id === categoryData.id ? { ...c, ...categoryData } : c
        );
      } else {
        updatedCategories = [...currentCategories, result];
      }
      
      this.cache.setCategories(updatedCategories, 60);
    }

    return result;
  }

  // Salvar complemento e atualizar cache
  async saveComplemento(complementoData, isUpdate = false) {
    const endpoint = isUpdate ? `/complementos/${complementoData.id}` : '/complementos';
    const method = isUpdate ? 'PUT' : 'POST';
    
    const result = await this.saveWithCache(endpoint, complementoData, 'complementos', {
      method,
      invalidateCache: true,
      updateCache: false,
      ttlMinutes: 60
    });

    // Atualizar cache de complementos
    if (this.cache) {
      const currentComplementos = this.cache.getComplementos() || [];
      let updatedComplementos;
      
      if (isUpdate) {
        updatedComplementos = currentComplementos.map(c => 
          c.id === complementoData.id ? { ...c, ...complementoData } : c
        );
      } else {
        updatedComplementos = [...currentComplementos, result];
      }
      
      this.cache.setComplementos(updatedComplementos, 60);
    }

    return result;
  }

  // Deletar item e invalidar cache
  async deleteItem(endpoint, cacheKey) {
    try {
      console.log(`🗑️ Deletando item: ${endpoint}`);
      
      const response = await API.delete(endpoint);
      
      if (response.data) {
        // Invalidar cache relacionado
        this.invalidateRelatedCache(cacheKey);
        
        console.log(`✅ Item deletado com sucesso: ${endpoint}`);
        return response.data;
      }

      throw new Error('Resposta da API vazia');
    } catch (error) {
      console.error(`❌ Erro ao deletar item: ${endpoint}`, error);
      throw error;
    }
  }

  // Estatísticas do cache
  getCacheStats() {
    if (!this.cache) return null;
    return this.cache.cacheStats;
  }

  // Limpar todo o cache
  clearAllCache() {
    if (this.cache) {
      this.cache.invalidateAll();
    }
  }
}

// Instância global do serviço de cache
const cacheService = new CacheService();

export default cacheService;
