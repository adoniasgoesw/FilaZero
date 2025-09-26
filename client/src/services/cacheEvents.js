// Sistema de eventos para atualizações automáticas do cache
class CacheEventManager {
  constructor() {
    this.listeners = new Map();
  }

  // Registrar listener para um tipo de evento
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  // Remover listener
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  // Disparar evento
  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no listener do evento ${eventType}:`, error);
        }
      });
    }
  }

  // Limpar todos os listeners
  clear() {
    this.listeners.clear();
  }
}

// Instância global do gerenciador de eventos
const cacheEventManager = new CacheEventManager();

// Tipos de eventos
export const CACHE_EVENTS = {
  // Eventos de dados
  PRODUTO_CRIADO: 'produto_criado',
  PRODUTO_ATUALIZADO: 'produto_atualizado',
  PRODUTO_DELETADO: 'produto_deletado',
  
  CATEGORIA_CRIADA: 'categoria_criada',
  CATEGORIA_ATUALIZADA: 'categoria_atualizada',
  CATEGORIA_DELETADA: 'categoria_deletada',
  
  CLIENTE_CRIADO: 'cliente_criado',
  CLIENTE_ATUALIZADO: 'cliente_atualizado',
  CLIENTE_DELETADO: 'cliente_deletado',
  
  PAGAMENTO_CRIADO: 'pagamento_criado',
  PAGAMENTO_ATUALIZADO: 'pagamento_atualizado',
  PAGAMENTO_DELETADO: 'pagamento_deletado',
  
  CAIXA_CRIADO: 'caixa_criado',
  CAIXA_ATUALIZADO: 'caixa_atualizado',
  CAIXA_DELETADO: 'caixa_deletado',
  
  PONTO_ATENDIMENTO_CRIADO: 'ponto_atendimento_criado',
  PONTO_ATENDIMENTO_ATUALIZADO: 'ponto_atendimento_atualizado',
  PONTO_ATENDIMENTO_DELETADO: 'ponto_atendimento_deletado',
  
  COMPLEMENTO_CRIADO: 'complemento_criado',
  COMPLEMENTO_ATUALIZADO: 'complemento_atualizado',
  COMPLEMENTO_DELETADO: 'complemento_deletado',
  
  // Eventos de cache
  CACHE_INVALIDADO: 'cache_invalidado',
  CACHE_ATUALIZADO: 'cache_atualizado',
  
  // Eventos de sistema
  ESTABELECIMENTO_ALTERADO: 'estabelecimento_alterado',
  USUARIO_LOGADO: 'usuario_logado',
  USUARIO_LOGOUT: 'usuario_logout'
};

// Funções auxiliares para disparar eventos
export const emitCacheEvent = (eventType, data) => {
  console.log(`📡 Emitindo evento de cache: ${eventType}`, data);
  cacheEventManager.emit(eventType, data);
};

// Funções específicas para cada tipo de dados
export const emitProdutoEvent = {
  criado: (produto) => emitCacheEvent(CACHE_EVENTS.PRODUTO_CRIADO, produto),
  atualizado: (produto) => emitCacheEvent(CACHE_EVENTS.PRODUTO_ATUALIZADO, produto),
  deletado: (produtoId) => emitCacheEvent(CACHE_EVENTS.PRODUTO_DELETADO, { id: produtoId })
};

export const emitCategoriaEvent = {
  criada: (categoria) => emitCacheEvent(CACHE_EVENTS.CATEGORIA_CRIADA, categoria),
  atualizada: (categoria) => emitCacheEvent(CACHE_EVENTS.CATEGORIA_ATUALIZADA, categoria),
  deletada: (categoriaId) => emitCacheEvent(CACHE_EVENTS.CATEGORIA_DELETADA, { id: categoriaId })
};

export const emitClienteEvent = {
  criado: (cliente) => emitCacheEvent(CACHE_EVENTS.CLIENTE_CRIADO, cliente),
  atualizado: (cliente) => emitCacheEvent(CACHE_EVENTS.CLIENTE_ATUALIZADO, cliente),
  deletado: (clienteId) => emitCacheEvent(CACHE_EVENTS.CLIENTE_DELETADO, { id: clienteId })
};

export const emitPagamentoEvent = {
  criado: (pagamento) => emitCacheEvent(CACHE_EVENTS.PAGAMENTO_CRIADO, pagamento),
  atualizado: (pagamento) => emitCacheEvent(CACHE_EVENTS.PAGAMENTO_ATUALIZADO, pagamento),
  deletado: (pagamentoId) => emitCacheEvent(CACHE_EVENTS.PAGAMENTO_DELETADO, { id: pagamentoId })
};

export const emitCaixaEvent = {
  criado: (caixa) => emitCacheEvent(CACHE_EVENTS.CAIXA_CRIADO, caixa),
  atualizado: (caixa) => emitCacheEvent(CACHE_EVENTS.CAIXA_ATUALIZADO, caixa),
  deletado: (caixaId) => emitCacheEvent(CACHE_EVENTS.CAIXA_DELETADO, { id: caixaId })
};

export const emitPontoAtendimentoEvent = {
  criado: (ponto) => emitCacheEvent(CACHE_EVENTS.PONTO_ATENDIMENTO_CRIADO, ponto),
  atualizado: (ponto) => emitCacheEvent(CACHE_EVENTS.PONTO_ATENDIMENTO_ATUALIZADO, ponto),
  deletado: (pontoId) => emitCacheEvent(CACHE_EVENTS.PONTO_ATENDIMENTO_DELETADO, { id: pontoId })
};

export const emitComplementoEvent = {
  criado: (complemento) => emitCacheEvent(CACHE_EVENTS.COMPLEMENTO_CRIADO, complemento),
  atualizado: (complemento) => emitCacheEvent(CACHE_EVENTS.COMPLEMENTO_ATUALIZADO, complemento),
  deletado: (complementoId) => emitCacheEvent(CACHE_EVENTS.COMPLEMENTO_DELETADO, { id: complementoId })
};

// Hook para escutar eventos de cache
export const useCacheEvents = (eventType, callback, deps = []) => {
  const { useEffect } = require('react');
  
  useEffect(() => {
    cacheEventManager.on(eventType, callback);
    
    return () => {
      cacheEventManager.off(eventType, callback);
    };
  }, deps);
};

// Hook para escutar múltiplos eventos
export const useMultipleCacheEvents = (events, callback, deps = []) => {
  const { useEffect } = require('react');
  
  useEffect(() => {
    events.forEach(eventType => {
      cacheEventManager.on(eventType, callback);
    });
    
    return () => {
      events.forEach(eventType => {
        cacheEventManager.off(eventType, callback);
      });
    };
  }, deps);
};

export default cacheEventManager;
