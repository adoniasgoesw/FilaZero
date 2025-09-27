import { useCallback } from 'react';
import { useRealtimeUpdate as useRealtimeUpdateHook } from './useRealtime';

// Hook para disparar atualizações em tempo real
export const useRealtimeUpdate = () => {
  const triggerUpdate = useRealtimeUpdateHook();

  // Função para atualizar dados estáticos (categorias, produtos, clientes, etc.)
  const updateStaticData = useCallback((type, data) => {
    console.log(`🔄 Atualizando dados estáticos: ${type}`, data);
    
    // Disparar evento para invalidar cache
    window.dispatchEvent(new CustomEvent('dataUpdated', {
      detail: { 
        type: 'static', 
        dataType: type,
        data,
        keys: [[type]]
      }
    }));
  }, []);

  // Função para atualizar dados dinâmicos (pedidos, caixas, pontos, etc.)
  const updateDynamicData = useCallback((type, data) => {
    console.log(`🔄 Atualizando dados dinâmicos: ${type}`, data);
    
    // Disparar evento para atualização em tempo real
    triggerUpdate(type, data, [[type]]);
  }, [triggerUpdate]);

  // Função para atualizar múltiplos tipos de dados
  const updateMultipleData = useCallback((updates) => {
    console.log('🔄 Atualizando múltiplos dados:', updates);
    
    updates.forEach(({ type, data, isStatic = false }) => {
      if (isStatic) {
        updateStaticData(type, data);
      } else {
        updateDynamicData(type, data);
      }
    });
  }, [updateStaticData, updateDynamicData]);

  return {
    updateStaticData,
    updateDynamicData,
    updateMultipleData,
    triggerUpdate
  };
};

// Hook específico para cada tipo de atualização
export const useCategoriaUpdate = () => {
  const { updateStaticData } = useRealtimeUpdate();
  
  return useCallback((data) => {
    updateStaticData('categorias', data);
  }, [updateStaticData]);
};

export const useProdutoUpdate = () => {
  const { updateStaticData } = useRealtimeUpdate();
  
  return useCallback((data) => {
    updateStaticData('produtos', data);
  }, [updateStaticData]);
};

export const useClienteUpdate = () => {
  const { updateStaticData } = useRealtimeUpdate();
  
  return useCallback((data) => {
    updateStaticData('clientes', data);
  }, [updateStaticData]);
};

export const usePagamentoUpdate = () => {
  const { updateStaticData } = useRealtimeUpdate();
  
  return useCallback((data) => {
    updateStaticData('pagamentos', data);
  }, [updateStaticData]);
};

export const useComplementoUpdate = () => {
  const { updateStaticData } = useRealtimeUpdate();
  
  return useCallback((data) => {
    updateStaticData('complementos', data);
  }, [updateStaticData]);
};

export const usePedidoUpdate = () => {
  const { updateDynamicData } = useRealtimeUpdate();
  
  return useCallback((data) => {
    updateDynamicData('pedidos', data);
  }, [updateDynamicData]);
};

export const useCaixaUpdate = () => {
  const { updateDynamicData } = useRealtimeUpdate();
  
  return useCallback((data) => {
    updateDynamicData('caixas', data);
  }, [updateDynamicData]);
};

export const usePontoAtendimentoUpdate = () => {
  const { updateDynamicData } = useRealtimeUpdate();
  
  return useCallback((data) => {
    updateDynamicData('pontos-atendimento', data);
  }, [updateDynamicData]);
};
