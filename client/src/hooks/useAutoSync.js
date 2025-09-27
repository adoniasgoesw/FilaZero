import { useEffect, useRef } from 'react';

// Hook para sincronização automática com o banco de dados
export function useAutoSync(estabelecimentoId) {
  const syncIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!estabelecimentoId || isInitializedRef.current) return;

    // Marcar como inicializado para evitar múltiplas inicializações
    isInitializedRef.current = true;

    // Função para sincronizar dados
    const syncData = async () => {
      try {
        // Disparar eventos para atualizar componentes
        window.dispatchEvent(new CustomEvent('refreshProdutos'));
        window.dispatchEvent(new CustomEvent('refreshCategorias'));
        window.dispatchEvent(new CustomEvent('refreshClientes'));
        window.dispatchEvent(new CustomEvent('refreshPagamentos'));
        window.dispatchEvent(new CustomEvent('refreshCaixas'));
        window.dispatchEvent(new CustomEvent('refreshPedidos'));
        window.dispatchEvent(new CustomEvent('refreshPontosAtendimento'));
        
        console.log('🔄 Sincronização automática executada');
      } catch (error) {
        console.error('❌ Erro na sincronização automática:', error);
      }
    };

    // Sincronizar imediatamente
    syncData();

    // Configurar sincronização a cada 30 segundos
    syncIntervalRef.current = setInterval(syncData, 30000);

    // Cleanup
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [estabelecimentoId]);

  // Função para forçar sincronização manual
  const forceSync = async () => {
    try {
      // Disparar eventos para atualizar componentes
      window.dispatchEvent(new CustomEvent('refreshProdutos'));
      window.dispatchEvent(new CustomEvent('refreshCategorias'));
      window.dispatchEvent(new CustomEvent('refreshClientes'));
      window.dispatchEvent(new CustomEvent('refreshPagamentos'));
      window.dispatchEvent(new CustomEvent('refreshCaixas'));
      window.dispatchEvent(new CustomEvent('refreshPedidos'));
      window.dispatchEvent(new CustomEvent('refreshPontosAtendimento'));
      
      console.log('🔄 Sincronização manual executada');
    } catch (error) {
      console.error('❌ Erro na sincronização manual:', error);
    }
  };

  return { forceSync };
}

// Hook para sincronização em tempo real com WebSocket (futuro)
export function useRealtimeSync(estabelecimentoId) {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!estabelecimentoId) return;

    // Conectar ao WebSocket para atualizações em tempo real
    const connectWebSocket = () => {
      try {
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
        wsRef.current = new WebSocket(`${wsUrl}/ws/${estabelecimentoId}`);

        wsRef.current.onopen = () => {
          console.log('🔌 WebSocket conectado');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { type, entity } = data;

            // Disparar eventos baseados no tipo de mudança
            switch (type) {
              case 'CREATE':
              case 'UPDATE':
              case 'DELETE':
                window.dispatchEvent(new CustomEvent(`refresh${entity}`));
                break;
              default:
                console.log('Tipo de evento desconhecido:', type);
            }
          } catch (error) {
            console.error('❌ Erro ao processar mensagem WebSocket:', error);
          }
        };

        wsRef.current.onclose = () => {
          console.log('🔌 WebSocket desconectado, tentando reconectar...');
          // Tentar reconectar após 5 segundos
          setTimeout(connectWebSocket, 5000);
        };

        wsRef.current.onerror = (error) => {
          console.error('❌ Erro no WebSocket:', error);
        };
      } catch (error) {
        console.error('❌ Erro ao conectar WebSocket:', error);
      }
    };

    connectWebSocket();

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [estabelecimentoId]);

  return { isConnected: wsRef.current?.readyState === WebSocket.OPEN };
}
