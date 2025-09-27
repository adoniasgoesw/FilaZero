import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import api from '../services/api';

// Hook para dados dinâmicos em tempo real
export const useRealtime = (key, fetchFn, options = {}) => {
  const queryClient = useQueryClient();

  // Query com cache muito curto (2 segundos)
  const query = useQuery({
    queryKey: key,
    queryFn: fetchFn,
    staleTime: 2 * 1000, // 2 segundos
    gcTime: 30 * 1000, // 30 segundos no cache
    refetchInterval: 5 * 1000, // Refetch a cada 5 segundos
    refetchOnWindowFocus: true,
    retry: 1,
    ...options,
  });

  // Listener para eventos de atualização em tempo real
  useEffect(() => {
    const handleRealtimeUpdate = (event) => {
      const { type, data, keys } = event.detail;
      
      // Verificar se esta query deve ser atualizada
      const shouldUpdate = keys.some(keyToCheck => 
        Array.isArray(keyToCheck) 
          ? keyToCheck.every((k, i) => key[i] === k)
          : keyToCheck === key[0]
      );

      if (shouldUpdate) {
        console.log(`🔄 Atualizando dados em tempo real para:`, key);
        queryClient.invalidateQueries({ queryKey: key });
      }
    };

    // Escutar eventos de atualização
    window.addEventListener('realtimeUpdate', handleRealtimeUpdate);
    window.addEventListener('dataUpdated', handleRealtimeUpdate);

    return () => {
      window.removeEventListener('realtimeUpdate', handleRealtimeUpdate);
      window.removeEventListener('dataUpdated', handleRealtimeUpdate);
    };
  }, [key, queryClient]);

  return query;
};

// Hooks específicos para dados dinâmicos

// Pontos de Atendimento
export const usePontosAtendimento = (estabelecimentoId) => {
  return useRealtime(
    ['pontos-atendimento', estabelecimentoId],
    () => api.get(`/pontos-atendimento/${estabelecimentoId}`).then(res => res.data),
    {
      enabled: !!estabelecimentoId,
    }
  );
};

// Histórico de Pedidos
export const useHistoricoPedidos = (estabelecimentoId, caixaId) => {
  return useRealtime(
    ['historico-pedidos', estabelecimentoId, caixaId],
    () => api.get(`/historico-pedidos/${estabelecimentoId}?caixa_id=${caixaId}`).then(res => res.data),
    {
      enabled: !!estabelecimentoId && !!caixaId,
    }
  );
};

// Histórico de Pagamentos
export const usePagamentosHistorico = (estabelecimentoId, caixaId) => {
  return useRealtime(
    ['pagamentos-historico', estabelecimentoId, caixaId],
    () => api.get(`/pagamentos/historico/caixa/${caixaId}?estabelecimento_id=${estabelecimentoId}`).then(res => res.data),
    {
      enabled: !!estabelecimentoId && !!caixaId,
    }
  );
};

// Movimentações de Caixa
export const useMovimentacoesCaixa = (caixaId) => {
  return useRealtime(
    ['movimentacoes-caixa', caixaId],
    () => api.get(`/movimentacoes-caixa/${caixaId}`).then(res => res.data),
    {
      enabled: !!caixaId,
    }
  );
};

// Caixas
export const useCaixas = (estabelecimentoId, apenasFechados = false) => {
  return useRealtime(
    ['caixas', estabelecimentoId, apenasFechados],
    () => api.get(`/caixas/${estabelecimentoId}?fechados=${apenasFechados}`).then(res => res.data.caixas || res.data),
    {
      enabled: !!estabelecimentoId,
    }
  );
};

// Painel Itens (dados dinâmicos do painel)
export const usePainelItens = (estabelecimentoId) => {
  return useRealtime(
    ['painel-itens', estabelecimentoId],
    () => api.get(`/painel-itens/${estabelecimentoId}`).then(res => res.data),
    {
      enabled: !!estabelecimentoId,
    }
  );
};

// Painel Detalhes (dados dinâmicos do painel)
export const usePainelDetalhes = (estabelecimentoId) => {
  return useRealtime(
    ['painel-detalhes', estabelecimentoId],
    () => api.get(`/painel-detalhes/${estabelecimentoId}`).then(res => res.data),
    {
      enabled: !!estabelecimentoId,
    }
  );
};

// Hook para disparar atualizações em tempo real
export const useRealtimeUpdate = () => {
  const queryClient = useQueryClient();

  const triggerUpdate = useCallback((type, data, keys = []) => {
    console.log(`🚀 Disparando atualização em tempo real:`, { type, data, keys });
    
    // Invalidar queries específicas
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });

    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('realtimeUpdate', {
      detail: { type, data, keys }
    }));
  }, [queryClient]);

  return triggerUpdate;
};
