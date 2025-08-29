// server/middlewares/cacheMiddleware.js
import cacheManager from '../config/cache.js';

// Middleware para cache de rotas GET
export const cacheRoute = (prefix, ttl = 300) => {
  return async (req, res, next) => {
    // Apenas aplicar cache em requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Gerar chave de cache baseada na rota e parâmetros
      const cacheKey = generateCacheKey(prefix, req);
      
      // Tentar buscar do cache
      const cachedData = await cacheManager.get(cacheKey);
      
      if (cachedData) {
        console.log(`⚡ Resposta servida do cache: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Se não encontrou no cache, interceptar a resposta
      const originalJson = res.json;
      
      res.json = function(data) {
        // Salvar no cache antes de enviar a resposta
        cacheManager.set(cacheKey, data, ttl);
        
        // Restaurar método original e enviar resposta
        res.json = originalJson;
        return res.json(data);
      };

      next();
    } catch (error) {
      console.error('❌ Erro no middleware de cache:', error);
      next(); // Continuar sem cache em caso de erro
    }
  };
};

// Middleware para invalidar cache após operações de modificação
export const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Interceptar resposta de sucesso
    const originalJson = res.json;
    
    res.json = async function(data) {
      // Se a operação foi bem-sucedida, invalidar cache
      if (data && data.success) {
        try {
          // Invalidar padrões específicos
          for (const pattern of patterns) {
            await cacheManager.deletePattern(pattern);
          }
          console.log(`🗑️ Cache invalidado para padrões: ${patterns.join(', ')}`);
        } catch (error) {
          console.error('❌ Erro ao invalidar cache:', error);
        }
      }
      
      // Restaurar método original e enviar resposta
      res.json = originalJson;
      return res.json(data);
    };

    next();
  };
};

// Gerar chave de cache baseada na rota e parâmetros
function generateCacheKey(prefix, req) {
  const params = req.params;
  const query = req.query;
  
  // Ordenar parâmetros para consistência
  const sortedParams = Object.keys(params).sort().map(key => `${key}:${params[key]}`);
  const sortedQuery = Object.keys(query).sort().map(key => `${key}:${query[key]}`);
  
  const keyParts = [prefix, ...sortedParams, ...sortedQuery];
  return keyParts.join(':');
}

// Middleware para cache específico de usuário (perfil)
export const cacheUserProfile = (ttl = 600) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Extrair ID do usuário do token ou parâmetros
      const userId = req.user?.id || req.params.userId;
      
      if (!userId) {
        return next();
      }

      const cacheKey = `user:profile:${userId}`;
      const cachedData = await cacheManager.get(cacheKey);
      
      if (cachedData) {
        console.log(`⚡ Perfil do usuário servido do cache: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Interceptar resposta
      const originalJson = res.json;
      
      res.json = function(data) {
        if (data && data.success) {
          cacheManager.set(cacheKey, data, ttl);
        }
        
        res.json = originalJson;
        return res.json(data);
      };

      next();
    } catch (error) {
      console.error('❌ Erro no cache de perfil:', error);
      next();
    }
  };
};

// Middleware para cache de listagens com paginação
export const cacheListings = (prefix, ttl = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Incluir parâmetros de paginação na chave
      const page = req.query.page || '1';
      const limit = req.query.limit || '20';
      const search = req.query.search || '';
      
      const cacheKey = `${prefix}:list:${page}:${limit}:${search}`;
      const cachedData = await cacheManager.get(cacheKey);
      
      if (cachedData) {
        console.log(`⚡ Listagem servida do cache: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Interceptar resposta
      const originalJson = res.json;
      
      res.json = function(data) {
        if (data && data.success) {
          cacheManager.set(cacheKey, data, ttl);
        }
        
        res.json = originalJson;
        return res.json(data);
      };

      next();
    } catch (error) {
      console.error('❌ Erro no cache de listagens:', error);
      next();
    }
  };
};

// Função para limpar cache manualmente
export const clearCache = async (req, res) => {
  try {
    await cacheManager.clear();
    res.json({
      success: true,
      message: 'Cache limpo com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar cache'
    });
  }
};

// Função para obter estatísticas do cache
export const getCacheStats = async (req, res) => {
  try {
    const stats = cacheManager.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do cache:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas do cache'
    });
  }
};
