import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import preloadManager from '../utils/preloadManager.js';
import logger from '../utils/logger.js';

// Hook para pré-carregar dados baseado na navegação
export const useNavigationCache = () => {
  const location = useLocation();

  // Mapeamento de páginas para dados relacionados
  const pageDataMap = {
    '/home': {
      types: ['profile', 'notifications', 'dashboard'],
      priority: 'normal'
    },
    '/gestao/produtos': {
      types: ['categorias', 'complementos', 'estabelecimentos'],
      priority: 'high'
    },
    '/gestao/categorias': {
      types: ['produtos', 'complementos', 'estabelecimentos'],
      priority: 'high'
    },
    '/gestao/clientes': {
      types: ['usuarios', 'pagamentos', 'estabelecimentos'],
      priority: 'normal'
    },
    '/gestao/usuarios': {
      types: ['estabelecimentos', 'perfis'],
      priority: 'normal'
    },
    '/gestao/pagamentos': {
      types: ['clientes', 'estabelecimentos'],
      priority: 'normal'
    },
    '/ajuste': {
      types: ['profile', 'configuracoes', 'estabelecimentos'],
      priority: 'high'
    },
    '/delivery': {
      types: ['produtos', 'categorias', 'estabelecimentos'],
      priority: 'high'
    },
    '/historico': {
      types: ['pedidos', 'vendas', 'estabelecimentos'],
      priority: 'normal'
    }
  };

  // Função para obter dados da página atual
  const getCurrentPageData = useCallback(() => {
    const path = location.pathname;
    return pageDataMap[path] || { types: [], priority: 'normal' };
  }, [location.pathname]);

  // Função para pré-carregar dados da página atual
  const preloadCurrentPageData = useCallback(async () => {
    try {
      const pageData = getCurrentPageData();
      
      if (pageData.types.length === 0) {
        return;
      }

      logger.debug('Pré-carregando dados da página atual', {
        page: location.pathname,
        types: pageData.types,
        priority: pageData.priority
      });

      // Adicionar à fila de pré-carregamento
      pageData.types.forEach(type => {
        preloadManager.addToPreloadQueue(
          type, 
          getDefaultFetchFunction(type), 
          pageData.priority
        );
      });

    } catch (error) {
      logger.error('Erro ao pré-carregar dados da página atual', { error });
    }
  }, [getCurrentPageData, location.pathname]);

  // Função para pré-carregar dados da próxima página
  const preloadNextPageData = useCallback((nextPath) => {
    try {
      const nextPageData = pageDataMap[nextPath];
      
      if (!nextPageData || nextPageData.types.length === 0) {
        return;
      }

      logger.debug('Pré-carregando dados da próxima página', {
        currentPage: location.pathname,
        nextPage: nextPath,
        types: nextPageData.types
      });

      // Pré-carregar com prioridade alta
      nextPageData.types.forEach(type => {
        preloadManager.preloadSpecific(
          type, 
          getDefaultFetchFunction(type), 
          'high'
        );
      });

    } catch (error) {
      logger.error('Erro ao pré-carregar dados da próxima página', { error });
    }
  }, [location.pathname]);

  // Função para pré-carregar dados relacionados
  const preloadRelatedData = useCallback(async (primaryType, relatedTypes) => {
    try {
      if (!relatedTypes || relatedTypes.length === 0) {
        return;
      }

      logger.debug('Pré-carregando dados relacionados', {
        primaryType,
        relatedTypes
      });

      const fetchFunctions = relatedTypes.map(type => 
        getDefaultFetchFunction(type)
      );

      await preloadManager.preloadRelated(
        primaryType, 
        relatedTypes, 
        fetchFunctions
      );

    } catch (error) {
      logger.error('Erro ao pré-carregar dados relacionados', { error });
    }
  }, []);

  // Função para limpar cache de dados específicos
  const clearPageCache = useCallback((pagePath) => {
    try {
      const pageData = pageDataMap[pagePath];
      
      if (pageData && pageData.types.length > 0) {
        logger.debug('Limpando cache da página', { page: pagePath });
        
        // Aqui você pode implementar a lógica para limpar cache específico
        // Por enquanto, apenas log
      }
    } catch (error) {
      logger.error('Erro ao limpar cache da página', { error });
    }
  }, []);

  // Função para obter estatísticas de pré-carregamento
  const getPreloadStats = useCallback(() => {
    return preloadManager.getPreloadStats();
  }, []);

  // Efeito para pré-carregar dados quando a página muda
  useEffect(() => {
    // Pequeno delay para não interferir na navegação
    const timer = setTimeout(() => {
      preloadCurrentPageData();
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname, preloadCurrentPageData]);

  // Função para obter função de busca padrão (placeholder)
  const getDefaultFetchFunction = (type) => {
    // Esta função deve ser substituída pelas funções reais da API
    return async () => {
      logger.warn('Função de busca padrão chamada', { type });
      return [];
    };
  };

  return {
    // Funções de pré-carregamento
    preloadCurrentPageData,
    preloadNextPageData,
    preloadRelatedData,
    clearPageCache,
    
    // Informações da página atual
    currentPage: location.pathname,
    currentPageData: getCurrentPageData(),
    
    // Estatísticas
    getPreloadStats,
    
    // Utilitários
    pageDataMap,
    
    // Função para configurar funções de busca reais
    setFetchFunctions: (fetchFunctions) => {
      // Aqui você pode configurar as funções reais de busca
      logger.debug('Funções de busca configuradas', { 
        types: Object.keys(fetchFunctions) 
      });
    }
  };
};

export default useNavigationCache;
