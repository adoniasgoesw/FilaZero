import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Hook para dados estáticos com cache de 3 segundos
export const useCache = (key, fetchFn, options = {}) => {
  return useQuery({
    queryKey: key,
    queryFn: fetchFn,
    staleTime: 3 * 1000, // 3 segundos de cache
    gcTime: 5 * 60 * 1000, // 5 minutos no cache
    refetchOnWindowFocus: true,
    retry: 2,
    ...options,
  });
};

// Hook para mutações com invalidação automática do cache
export const useCacheMutation = (invalidateKeys = []) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (data, variables, context) => {
      // Invalidar caches específicos após mutação
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      
      // Disparar evento customizado para atualizações em tempo real
      window.dispatchEvent(new CustomEvent('dataUpdated', { 
        detail: { 
          type: 'mutation', 
          keys: invalidateKeys,
          data 
        } 
      }));
    },
    onError: (error) => {
      console.error('Erro na mutação:', error);
    },
  });
};

// Hooks específicos para cada tipo de dado estático

// Categorias
export const useCategorias = (estabelecimentoId) => {
  return useCache(
    ['categorias', estabelecimentoId],
    () => api.get(`/categorias/${estabelecimentoId}`).then(res => res.data),
    {
      enabled: !!estabelecimentoId,
    }
  );
};

export const useCategoriasMutation = () => {
  return useCacheMutation([['categorias']]);
};

// Produtos
export const useProdutos = (estabelecimentoId) => {
  return useCache(
    ['produtos', estabelecimentoId],
    () => api.get(`/produtos/${estabelecimentoId}`).then(res => res.data),
    {
      enabled: !!estabelecimentoId,
    }
  );
};

export const useProdutosMutation = () => {
  return useCacheMutation([['produtos']]);
};

// Clientes
export const useClientes = (estabelecimentoId) => {
  return useCache(
    ['clientes', estabelecimentoId],
    () => api.get(`/clientes/${estabelecimentoId}`).then(res => res.data),
    {
      enabled: !!estabelecimentoId,
    }
  );
};

export const useClientesMutation = () => {
  return useCacheMutation([['clientes']]);
};

// Pagamentos
export const usePagamentos = (estabelecimentoId) => {
  return useCache(
    ['pagamentos', estabelecimentoId],
    () => api.get(`/pagamentos/${estabelecimentoId}`).then(res => res.data),
    {
      enabled: !!estabelecimentoId,
    }
  );
};

export const usePagamentosMutation = () => {
  return useCacheMutation([['pagamentos']]);
};

// Complementos
export const useComplementos = (estabelecimentoId) => {
  return useCache(
    ['complementos', estabelecimentoId],
    () => api.get(`/complementos/${estabelecimentoId}?show_all=1`).then(res => res.data),
    {
      enabled: !!estabelecimentoId,
    }
  );
};

export const useComplementosMutation = () => {
  return useCacheMutation([['complementos']]);
};
