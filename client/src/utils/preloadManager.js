import cacheManager from './cacheManager.js';
import logger from './logger.js';

// Sistema de Pré-carregamento Inteligente
class PreloadManager {
  constructor() {
    this.preloadQueue = new Map();
    this.isPreloading = false;
    this.preloadDelay = 1000; // 1 segundo de delay
    this.maxConcurrent = 3; // Máximo de 3 requisições simultâneas
    this.activeRequests = 0;
  }

  // Adicionar dados para pré-carregamento
  addToPreloadQueue(type, fetchFunction, priority = 'normal') {
    try {
      const key = cacheManager.generateKey(type);
      
      // Se já existe no cache, não precisa pré-carregar
      if (cacheManager.has(key)) {
        logger.debug('Dados já existem no cache, pulando pré-carregamento', { type });
        return false;
      }

      // Adicionar à fila de pré-carregamento
      this.preloadQueue.set(type, {
        fetchFunction,
        priority,
        addedAt: Date.now(),
        attempts: 0,
        maxAttempts: 3
      });

      logger.debug('Adicionado à fila de pré-carregamento', { type, priority });
      
      // Iniciar pré-carregamento se não estiver rodando
      this.startPreloading();
      
      return true;
    } catch (error) {
      logger.error('Erro ao adicionar à fila de pré-carregamento', { type, error });
      return false;
    }
  }

  // Iniciar processo de pré-carregamento
  startPreloading() {
    if (this.isPreloading || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    this.isPreloading = true;
    this.processPreloadQueue();
  }

  // Processar fila de pré-carregamento
  async processPreloadQueue() {
    try {
      while (this.preloadQueue.size > 0 && this.activeRequests < this.maxConcurrent) {
        // Ordenar por prioridade e tempo de adição
        const sortedItems = Array.from(this.preloadQueue.entries())
          .sort(([, a], [, b]) => {
            // Prioridade alta primeiro
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (b.priority === 'high' && a.priority !== 'high') return 1;
            
            // Depois por tempo de adição (mais antigo primeiro)
            return a.addedAt - b.addedAt;
          });

        const [type, item] = sortedItems[0];
        
        // Remover da fila
        this.preloadQueue.delete(type);
        
        // Executar pré-carregamento
        this.executePreload(type, item);
        
        // Pequeno delay entre requisições
        await this.delay(this.preloadDelay);
      }
    } catch (error) {
      logger.error('Erro ao processar fila de pré-carregamento', { error });
    } finally {
      this.isPreloading = false;
      
      // Se ainda há itens na fila, continuar processando
      if (this.preloadQueue.size > 0) {
        setTimeout(() => this.startPreloading(), 5000); // Tentar novamente em 5 segundos
      }
    }
  }

  // Executar pré-carregamento individual
  async executePreload(type, item) {
    try {
      this.activeRequests++;
      
      logger.debug('Executando pré-carregamento', { type, priority: item.priority });
      
      const data = await item.fetchFunction();
      
      // Salvar no cache
      const key = cacheManager.generateKey(type);
      cacheManager.set(key, data, 30 * 60 * 1000); // 30 minutos
      
      logger.success('Pré-carregamento concluído com sucesso', { 
        type, 
        dataSize: JSON.stringify(data).length 
      });
      
    } catch (error) {
      item.attempts++;
      
      if (item.attempts < item.maxAttempts) {
        // Recolocar na fila para tentar novamente
        logger.warn('Pré-carregamento falhou, tentando novamente', { 
          type, 
          attempts: item.attempts,
          error: error.message 
        });
        
        this.preloadQueue.set(type, item);
      } else {
        logger.error('Pré-carregamento falhou definitivamente', { 
          type, 
          maxAttempts: item.maxAttempts,
          error: error.message 
        });
      }
    } finally {
      this.activeRequests--;
      
      // Continuar processando se há mais itens
      if (this.preloadQueue.size > 0 && this.activeRequests < this.maxConcurrent) {
        this.processPreloadQueue();
      }
    }
  }

  // Pré-carregar dados específicos
  async preloadSpecific(type, fetchFunction, priority = 'high') {
    try {
      const key = cacheManager.generateKey(type);
      
      if (cacheManager.has(key)) {
        logger.debug('Dados já existem no cache', { type });
        return true;
      }

      logger.debug('Iniciando pré-carregamento específico', { type, priority });
      
      const data = await fetchFunction();
      cacheManager.set(key, data, 30 * 60 * 1000);
      
      logger.success('Pré-carregamento específico concluído', { type });
      return true;
      
    } catch (error) {
      logger.error('Erro no pré-carregamento específico', { type, error });
      return false;
    }
  }

  // Pré-carregar dados relacionados
  async preloadRelated(primaryType, relatedTypes, fetchFunctions) {
    try {
      logger.debug('Iniciando pré-carregamento de dados relacionados', { 
        primaryType, 
        relatedTypes 
      });

      const promises = relatedTypes.map(async (type, index) => {
        try {
          const key = cacheManager.generateKey(type);
          
          if (cacheManager.has(key)) {
            return { type, success: true, fromCache: true };
          }

          const data = await fetchFunctions[index]();
          cacheManager.set(key, data, 30 * 60 * 1000);
          
          return { type, success: true, fromCache: false };
        } catch (error) {
          logger.error('Erro ao pré-carregar tipo relacionado', { type, error });
          return { type, success: false, error: error.message };
        }
      });

      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const total = relatedTypes.length;
      
      logger.success('Pré-carregamento de dados relacionados concluído', { 
        successful, 
        total, 
        primaryType 
      });
      
      return { successful, total, results };
      
    } catch (error) {
      logger.error('Erro no pré-carregamento de dados relacionados', { 
        primaryType, 
        error 
      });
      return { successful: 0, total: relatedTypes.length, error: error.message };
    }
  }

  // Pré-carregar dados baseado na navegação
  preloadForNavigation(currentPage, nextPage) {
    try {
      const preloadMap = {
        'home': {
          types: ['profile', 'notifications'],
          priority: 'normal'
        },
        'produtos': {
          types: ['categorias', 'complementos'],
          priority: 'high'
        },
        'categorias': {
          types: ['produtos', 'complementos'],
          priority: 'high'
        },
        'clientes': {
          types: ['usuarios', 'pagamentos'],
          priority: 'normal'
        },
        'ajuste': {
          types: ['profile', 'configuracoes'],
          priority: 'high'
        }
      };

      const currentConfig = preloadMap[currentPage];
      const nextConfig = preloadMap[nextPage];

      if (currentConfig) {
        // Pré-carregar dados da página atual
        currentConfig.types.forEach(type => {
          this.addToPreloadQueue(type, this.getDefaultFetchFunction(type), currentConfig.priority);
        });
      }

      if (nextConfig) {
        // Pré-carregar dados da próxima página com prioridade alta
        nextConfig.types.forEach(type => {
          this.addToPreloadQueue(type, this.getDefaultFetchFunction(type), 'high');
        });
      }

      logger.debug('Pré-carregamento configurado para navegação', { 
        currentPage, 
        nextPage,
        currentTypes: currentConfig?.types || [],
        nextTypes: nextConfig?.types || []
      });

    } catch (error) {
      logger.error('Erro ao configurar pré-carregamento para navegação', { error });
    }
  }

  // Obter função de busca padrão (placeholder)
  getDefaultFetchFunction(type) {
    // Esta função deve ser substituída pelas funções reais da API
    return async () => {
      logger.warn('Função de busca padrão chamada', { type });
      return [];
    };
  }

  // Limpar fila de pré-carregamento
  clearPreloadQueue() {
    this.preloadQueue.clear();
    logger.debug('Fila de pré-carregamento limpa');
  }

  // Obter estatísticas de pré-carregamento
  getPreloadStats() {
    return {
      queueSize: this.preloadQueue.size,
      isPreloading: this.isPreloading,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent
    };
  }

  // Delay utilitário
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instância global do preload manager
const preloadManager = new PreloadManager();

export default preloadManager;
